import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  Utensils,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  matchFoodInDatabase,
  calculateNutrientsForPortion,
} from '../data/nutritionDatabase';

interface DetectedFoodItem {
  name: string;
  portion: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  estimatedCost: number;
  confidence?: 'High' | 'Medium' | 'Low' | string;
  estimateNote?: string;
  alternativeOptions?: string[];
  matchedDatabaseItem?: string;
  nutritionSource?: string;
  isDatabaseVerified?: boolean;
}

export const AnalyzeFoodModal: React.FC = () => {
  const { isAnalyzeFoodModalOpen, setIsAnalyzeFoodModalOpen, saveTodayLog, todayLog, currency } = useApp();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [isFoodDetected, setIsFoodDetected] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedFoodItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');
  const [mealTarget, setMealTarget] = useState<string>('Lunch');
  const [isSuccessAdded, setIsSuccessAdded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAnalyzeFoodModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so selecting another file or the same file again triggers change
    e.target.value = '';

    // CRITICAL: Read actual image pixels into an offscreen Canvas.
    // This decodes the raw image pixels and eliminates all EXIF headers, IPTC tags,
    // camera metadata, original file paths, and filename strings completely.
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          // Scale to crisp resolution suitable for vision AI (max 1280px)
          const maxDim = 1280;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw pure background and raster pixels
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Re-encode from raw raster pixel buffer to clean JPEG (zero EXIF, zero filename metadata)
            const cleanPixelDataUrl = canvas.toDataURL('image/jpeg', 0.92);
            setSelectedImage(cleanPixelDataUrl);
            setSelectedMimeType('image/jpeg');
          } else {
            setSelectedImage(dataUri);
            setSelectedMimeType('image/jpeg');
          }
        } catch {
          setSelectedImage(dataUri);
          setSelectedMimeType('image/jpeg');
        }
        setErrorMsg(null);
        setDetectedItems([]);
        setNotes('');
        setHasAnalyzed(false);
        setIsFoodDetected(true);
      };
      img.onerror = () => {
        setSelectedImage(dataUri);
        setSelectedMimeType('image/jpeg');
        setErrorMsg(null);
        setDetectedItems([]);
        setNotes('');
        setHasAnalyzed(false);
        setIsFoodDetected(true);
      };
      img.src = dataUri;
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    setHasAnalyzed(false);

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: selectedMimeType,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Analysis request failed. Please check the image and try again.');
      }

      const data = await res.json();
      setHasAnalyzed(true);
      setIsFoodDetected(data.isFoodDetected !== false);

      const rawList = Array.isArray(data.detectedFoods) ? data.detectedFoods : [];
      setDetectedItems(
        rawList.map((f: any) => ({
          name: f.name || 'Identified Food Item',
          portion: f.portion || '1 serving',
          portionGrams: Number(f.portionGrams) || 100,
          calories: Number(f.calories) || 0,
          protein: Number(f.protein) || 0,
          carbs: Number(f.carbs) || 0,
          fat: Number(f.fat) || 0,
          fiber: Number(f.fiber) || 0,
          estimatedCost: Number(f.estimatedCost) || 0,
          matchedDatabaseItem: f.matchedDatabaseItem,
          confidence: f.confidence,
          estimateNote: f.estimateNote || (f.isDatabaseVerified ? `${f.nutritionSource} (portion estimated)` : 'Estimated from comparable food'),
          alternativeOptions: Array.isArray(f.alternativeOptions) ? f.alternativeOptions : [],
          nutritionSource: f.nutritionSource,
          isDatabaseVerified: f.isDatabaseVerified,
        }))
      );
      setNotes(data.notes || '');
      setDisclaimer(data.disclaimer || '');
      setDataSource(data.dataSource || '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze food image with AI vision. Please try again.');
      setHasAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateItem = (index: number, field: keyof DetectedFoodItem, value: any) => {
    setDetectedItems((prev) => {
      const copy = [...prev];
      const current = { ...copy[index], [field]: value };

      if (field === 'name') {
        current.name = value;
        const matched = matchFoodInDatabase(value);
        if (matched) {
          const grams = current.portionGrams || 100;
          const scaled = calculateNutrientsForPortion(matched, grams);
          current.calories = scaled.calories;
          current.protein = scaled.protein;
          current.carbs = scaled.carbs;
          current.fat = scaled.fat;
          current.fiber = scaled.fiber;
          current.estimatedCost = scaled.estimatedCost;
          current.matchedDatabaseItem = matched.name;
          current.nutritionSource = scaled.source;
          current.isDatabaseVerified = true;
          current.confidence = matched.isVariableDish ? 'Medium' : 'High';
          current.estimateNote = matched.isVariableDish
            ? 'Estimated — recipe/portion may vary'
            : 'Verified Database';
        } else {
          current.matchedDatabaseItem = undefined;
          current.isDatabaseVerified = false;
          current.confidence = 'Low';
          current.estimateNote = 'Estimated — recipe/portion may vary';
        }
      }

      // Portion weight change: calculate mathematically from canonical database
      if (field === 'portionGrams') {
        const newGrams = Math.max(1, Number(value) || 100);
        current.portionGrams = newGrams;
        const matched = current.matchedDatabaseItem
          ? matchFoodInDatabase(current.matchedDatabaseItem)
          : matchFoodInDatabase(current.name);

        if (matched) {
          // Rule 3: (nutrient per 100g * portion weight) / 100
          const scaled = calculateNutrientsForPortion(matched, newGrams);
          current.calories = scaled.calories;
          current.protein = scaled.protein;
          current.carbs = scaled.carbs;
          current.fat = scaled.fat;
          current.fiber = scaled.fiber;
          current.estimatedCost = scaled.estimatedCost;
          current.matchedDatabaseItem = matched.name;
          current.nutritionSource = scaled.source;
          current.isDatabaseVerified = true;
          current.confidence = matched.isVariableDish ? 'Medium' : 'High';
          current.estimateNote = matched.isVariableDish
            ? 'Estimated — recipe/portion may vary'
            : 'Verified Database';
        } else if (copy[index].portionGrams && copy[index].portionGrams > 0) {
          const ratio = newGrams / copy[index].portionGrams;
          current.calories = Math.round(current.calories * ratio);
          current.protein = Number((current.protein * ratio).toFixed(1));
          current.carbs = Number((current.carbs * ratio).toFixed(1));
          current.fat = Number((current.fat * ratio).toFixed(1));
          current.fiber = Number((current.fiber * ratio).toFixed(1));
          current.estimatedCost = Math.round(current.estimatedCost * ratio);
        }
      }

      copy[index] = current;
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setDetectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setDetectedItems((prev) => [
      ...prev,
      {
        name: 'Whole Wheat Roti / Chapati',
        portion: '1 roti (~35g edible portion, estimated)',
        portionGrams: 35,
        calories: 91,
        protein: 3.2,
        carbs: 18.2,
        fat: 0.5,
        fiber: 1.6,
        estimatedCost: 4,
        confidence: 'high',
        matchedDatabaseItem: 'Whole Wheat Roti / Chapati',
        nutritionSource: 'ICMR-NIN IFCT 2017 (Code A001)',
        estimateNote: 'ICMR-NIN IFCT 2017 (Code A001)',
        isDatabaseVerified: true,
      },
    ]);
  };

  const totalCalories = detectedItems.reduce((acc, i) => acc + (Number(i.calories) || 0), 0);
  const totalProtein = Number(detectedItems.reduce((acc, i) => acc + (Number(i.protein) || 0), 0).toFixed(1));
  const totalCarbs = Number(detectedItems.reduce((acc, i) => acc + (Number(i.carbs) || 0), 0).toFixed(1));
  const totalFat = Number(detectedItems.reduce((acc, i) => acc + (Number(i.fat) || 0), 0).toFixed(1));
  const totalFiber = Number(detectedItems.reduce((acc, i) => acc + (Number(i.fiber) || 0), 0).toFixed(1));
  const totalCost = detectedItems.reduce((acc, i) => acc + (Number(i.estimatedCost) || 0), 0);

  const handleAddToTodayLog = async () => {
    const updatedCalories = (todayLog.caloriesConsumed || 0) + totalCalories;
    const updatedProtein = Number(((todayLog.proteinConsumed || 0) + totalProtein).toFixed(1));
    const updatedCost = (todayLog.foodSpent || 0) + totalCost;

    await saveTodayLog({
      caloriesConsumed: updatedCalories,
      proteinConsumed: updatedProtein,
      foodSpent: updatedCost,
      notes:
        (todayLog.notes ? todayLog.notes + ' | ' : '') +
        `Analyzed ${mealTarget}: ${detectedItems.map((i) => `${i.name} (${i.portion})`).join(', ')}`,
    });

    setIsSuccessAdded(true);
    setTimeout(() => {
      setIsSuccessAdded(false);
      setIsAnalyzeFoodModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white selection-red">
      <div className="relative w-full max-w-2xl bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/90 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ef233c]" />
            <div>
              <h3 className="font-extrabold text-base leading-tight text-white font-manrope">Analyze Food (AI Vision)</h3>
              <p className="text-[11px] text-zinc-400">Audited portion-based nutrition (ICMR-NIN & USDA FoodData Central)</p>
            </div>
          </div>
          <button
            onClick={() => setIsAnalyzeFoodModalOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm text-zinc-300">
          {/* Notice Banner */}
          <div className="p-3 bg-red-950/20 rounded-xl border border-red-900/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Audited Scientific Nutrition:</span> Values are calculated from verified food composition tables based on recognized portions. Mixed dishes, curries, chutneys, and beverages vary by preparation (oil/sugar) — please review and confirm.
            </div>
          </div>

          {/* Upload Area */}
          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-[#ef233c] bg-black/60 hover:bg-black rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#ef233c] shadow-sm">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-white text-sm font-manrope">Upload Food Photo or Snap with Camera</p>
                <p className="text-xs text-zinc-400 mt-0.5 font-light">Supports JPG, PNG, WEBP (plate of food, curry, roti, salad, beverage, etc.)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden max-h-56 bg-black border border-zinc-800 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Meal Preview"
                  className="w-full h-56 object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setDetectedItems([]);
                  }}
                  className="absolute top-3 right-3 px-3 py-1 bg-black/90 hover:bg-black text-white text-xs font-bold rounded-lg border border-zinc-800 backdrop-blur-sm transition"
                >
                  Change Photo
                </button>
              </div>

              {detectedItems.length === 0 && !hasAnalyzed && (
                <button
                  type="button"
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full py-3.5 bg-[#ef233c] hover:bg-red-700 disabled:opacity-60 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 font-manrope"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAnalyzing ? 'Detecting visible foods & calculating portion nutrition...' : 'Analyze Food Now'}</span>
                </button>
              )}

              {detectedItems.length === 0 && hasAnalyzed && !isFoodDetected && (
                <div className="p-4 bg-black rounded-2xl border border-zinc-800 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-red-500/10 text-[#ef233c] flex items-center justify-center font-bold text-lg">
                    🍽️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm font-manrope">No Food Detected in Image</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      {notes || 'The vision AI could not detect recognizable food or drinks in this picture. Please take a clear, well-lit photo of your meal or plate.'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition border border-zinc-700"
                    >
                      Try Another Photo
                    </button>
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-4 py-2 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-red-600/30 transition font-manrope"
                    >
                      + Add Food Manually
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/40 text-red-300 border border-red-800 rounded-xl text-xs flex items-center justify-between gap-2">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={analyzeImage}
                className="px-2.5 py-1 bg-red-900/60 hover:bg-red-900 text-white font-bold rounded-lg text-[10px] shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Results Table (Editable) */}
          {detectedItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-sm">Detected Food Items & Portions</h4>
                  <p className="text-[11px] text-slate-400">Nutrients calculated according to portion size. Adjust grams or values anytime:</p>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {detectedItems.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={`p-3.5 bg-[#070d1e]/90 rounded-2xl border space-y-2.5 text-xs transition ${
                        item.confidence === 'uncertain' || item.name.toLowerCase().includes('uncertain')
                          ? 'border-amber-500/50 bg-amber-950/20'
                          : 'border-[#1b2b54] hover:border-blue-500/40'
                      }`}
                    >
                      {/* Top Row: Food Name, Portion Description, Portion Weight (g) */}
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-6">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                Food Name
                              </label>
                              {item.name.toLowerCase().includes('uncertain') && (
                                <span className="text-[10px] text-amber-400 font-semibold">
                                  Select or type food below
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(index, 'name', e.target.value)}
                              className={`w-full px-2.5 py-1.5 bg-[#0a1329] border rounded-xl font-bold text-xs focus:ring-1 focus:ring-blue-500 ${
                                item.name.toLowerCase().includes('uncertain')
                                  ? 'border-amber-500/60 text-amber-200'
                                  : 'border-[#1b2b54] text-white'
                              }`}
                              placeholder="e.g. Roasted Chicken"
                            />
                            {/* Alternative Options if ambiguous */}
                            {item.alternativeOptions && item.alternativeOptions.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] text-slate-500">Possible options:</span>
                                {item.alternativeOptions.map((alt) => (
                                  <button
                                    key={alt}
                                    type="button"
                                    onClick={() => updateItem(index, 'name', alt)}
                                    className={`px-2 py-0.5 text-[10px] rounded-lg border transition ${
                                      item.name.toLowerCase() === alt.toLowerCase()
                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                                        : 'bg-[#0a1329] hover:bg-[#0e1a3a] text-slate-400 border-[#1b2b54]'
                                    }`}
                                  >
                                    {alt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                              Estimated Portion
                            </label>
                            <input
                              type="text"
                              value={item.portion}
                              onChange={(e) => updateItem(index, 'portion', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#0a1329] border border-[#1b2b54] text-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                              placeholder="e.g. 1 portion (~150g, estimated)"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-0.5">
                              Portion (g)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.portionGrams}
                              onChange={(e) => updateItem(index, 'portionGrams', parseInt(e.target.value, 10) || 100)}
                              className="w-full px-2.5 py-1.5 bg-[#0a1329] border border-blue-500/40 rounded-xl text-white font-black text-xs focus:ring-1 focus:ring-blue-500"
                              title="Changing portion weight recalculates calories and macros automatically from the database"
                            />
                          </div>
                        </div>

                        {/* Source transparency, estimate note, & confidence */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-400 pt-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-lg border font-medium ${
                                item.isDatabaseVerified && item.estimateNote === 'Verified Database'
                                  ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                                  : 'bg-[#0a1329] text-slate-300 border-[#1b2b54]'
                              }`}
                            >
                              {item.estimateNote || (item.isDatabaseVerified ? 'Verified Database' : 'Estimated — recipe/portion may vary')}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-lg border font-bold ${
                                (item.confidence || '').toLowerCase() === 'high'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : (item.confidence || '').toLowerCase() === 'medium'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-[#0a1329] text-slate-400 border-[#1b2b54]'
                              }`}
                            >
                              Confidence: {item.confidence ? item.confidence.charAt(0).toUpperCase() + item.confidence.slice(1).toLowerCase() : 'Medium'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-[#0e1a3a] transition ml-auto"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Nutrient Fields Grid: Calories, Protein, Carbs, Fat, Fiber */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-[#1b2b54]/80">
                        <div className="bg-[#0a1329] p-1.5 rounded-xl border border-[#1b2b54]">
                          <label className="text-[9px] text-slate-400 font-bold block leading-none mb-1">
                            Calories
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={item.calories}
                              onChange={(e) => updateItem(index, 'calories', parseInt(e.target.value, 10) || 0)}
                              className="w-full bg-transparent font-black text-white text-xs text-right focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500">kcal</span>
                          </div>
                        </div>

                        <div className="bg-[#0a1329] p-1.5 rounded-xl border border-[#1b2b54]">
                          <label className="text-[9px] text-emerald-400 font-bold block leading-none mb-1">
                            Protein
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.protein}
                              onChange={(e) => updateItem(index, 'protein', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent font-black text-emerald-400 text-xs text-right focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500">g</span>
                          </div>
                        </div>

                        <div className="bg-[#0a1329] p-1.5 rounded-xl border border-[#1b2b54]">
                          <label className="text-[9px] text-slate-300 font-bold block leading-none mb-1">
                            Carbs
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.carbs}
                              onChange={(e) => updateItem(index, 'carbs', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent font-black text-slate-300 text-xs text-right focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500">g</span>
                          </div>
                        </div>

                        <div className="bg-[#0a1329] p-1.5 rounded-xl border border-[#1b2b54]">
                          <label className="text-[9px] text-slate-400 font-bold block leading-none mb-1">
                            Fat
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.fat}
                              onChange={(e) => updateItem(index, 'fat', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent font-black text-slate-300 text-xs text-right focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500">g</span>
                          </div>
                        </div>

                        <div className="bg-[#0a1329] p-1.5 rounded-xl border border-[#1b2b54]">
                          <label className="text-[9px] text-teal-400 font-bold block leading-none mb-1">
                            Fiber
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.fiber}
                              onChange={(e) => updateItem(index, 'fiber', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent font-black text-teal-400 text-xs text-right focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500">g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nutritionist Insights / Notes Box */}
              {notes && (
                <div className="p-3 bg-red-950/20 rounded-2xl border border-red-900/40 text-red-200 text-xs flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#ef233c] font-manrope">Nutritional Analysis: </span>
                    <span>{notes}</span>
                  </div>
                </div>
              )}

              {/* Total Nutrition Strip */}
              <div className="p-4 bg-black rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-extrabold text-white text-sm block font-manrope">Calculated Meal Total:</span>
                  <span className="text-[10px] text-zinc-500 block">Sum of detected food items scaled mathematically from reference portions</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="text-center px-2 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block font-black text-white text-sm font-manrope">{totalCalories}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Calories</span>
                  </div>
                  <div className="text-center px-2 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block font-black text-[#ef233c] text-sm font-manrope">{totalProtein}g</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Protein</span>
                  </div>
                  <div className="text-center px-2 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block font-black text-zinc-300 text-sm font-manrope">{totalCarbs}g</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Carbs</span>
                  </div>
                  <div className="text-center px-2 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block font-black text-zinc-400 text-sm font-manrope">{totalFat}g</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Fat</span>
                  </div>
                  <div className="text-center px-2 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="block font-black text-zinc-300 text-sm font-manrope">{totalFiber}g</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Fiber</span>
                  </div>
                </div>
              </div>

              {/* Target Meal & Add Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-zinc-400 shrink-0 font-manrope">Log As:</label>
                  <select
                    value={mealTarget}
                    onChange={(e) => setMealTarget(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-black border border-zinc-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#ef233c]"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack / Pre-Workout</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddToTodayLog}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-red-600/30 transition flex items-center justify-center gap-1.5 active:scale-95 font-manrope"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSuccessAdded ? 'Added to Today!' : 'Add to Today’s Tracking'}</span>
                </button>
              </div>

              {/* Disclaimer and Reference Footer */}
              <div className="pt-2 text-[10px] text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 border-t border-[#1b2b54]/60">
                <span>{disclaimer || 'Nutritional values are referenced from ICMR-NIN & USDA food composition databases.'}</span>
                {dataSource && <span className="text-slate-500">{dataSource}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
