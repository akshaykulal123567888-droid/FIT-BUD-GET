import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  Wallet,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  DollarSign,
  Flame,
  Dumbbell,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeBudget, applyCheaperAlternative } from '../utils/budgetOptimizer';
import { INITIAL_FOOD_DATABASE, FoodItem } from '../data/foodDatabase';
import { MealPlan, MealItemEntry } from '../../server/db';
import { ASSETS } from '../assets/images';
import { EditBudgetModal } from '../components/EditBudgetModal';

export const DietView: React.FC = () => {
  const { user, updatePlan, setIsAnalyzeFoodModalOpen, currency } = useApp();

  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);

  const profile = user?.profile;
  const meals = user?.plan?.meals || [];
  const dailyBudget = profile?.calculatedMetrics?.targetDailyBudget || profile?.budgetAmount || 150;

  const budgetAnalysis = analyzeBudget(meals, dailyBudget, user?.customPrices);

  // Modals for editing/adding items
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [targetMealIdForAdd, setTargetMealIdForAdd] = useState<string>('m1');
  const [selectedFoodIdToAdd, setSelectedFoodIdToAdd] = useState<string>('oats-1');
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);

  const [editingItemInfo, setEditingItemInfo] = useState<{
    mealId: string;
    itemIndex: number;
    quantity: number;
  } | null>(null);

  // Macro totals
  const totalCalories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const totalProtein = Number(meals.reduce((sum, m) => sum + m.totalProtein, 0).toFixed(1));
  const totalCarbs = meals.reduce((sum, m) => sum + m.totalCarbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.totalFat, 0);

  const handleApplyCheaperAlternative = async (
    mealId: string,
    originalFoodId: string,
    alternativeFoodId: string
  ) => {
    const updatedMeals = applyCheaperAlternative(
      meals,
      mealId,
      originalFoodId,
      alternativeFoodId,
      user?.customPrices
    );
    await updatePlan({ meals: updatedMeals });
  };

  const handleRemoveFood = async (mealId: string, itemIdx: number) => {
    const updatedMeals = meals.map((m) => {
      if (m.id !== mealId) return m;
      const items = m.items.filter((_, i) => i !== itemIdx);
      return {
        ...m,
        items,
        totalCalories: items.reduce((acc, i) => acc + i.calories, 0),
        totalProtein: Number(items.reduce((acc, i) => acc + i.protein, 0).toFixed(1)),
        totalCarbs: items.reduce((acc, i) => acc + i.carbs, 0),
        totalFat: items.reduce((acc, i) => acc + i.fat, 0),
        totalCost: items.reduce((acc, i) => acc + i.cost, 0),
      };
    });
    await updatePlan({ meals: updatedMeals });
  };

  const handleSaveQuantityEdit = async () => {
    if (!editingItemInfo) return;
    const { mealId, itemIndex, quantity } = editingItemInfo;

    const updatedMeals = meals.map((m) => {
      if (m.id !== mealId) return m;
      const items = m.items.map((item, idx) => {
        if (idx !== itemIndex) return item;
        const foodDef = INITIAL_FOOD_DATABASE.find((f) => f.id === item.foodId);
        const unitCost = (user?.customPrices?.[item.foodId] ?? foodDef?.cost) || item.cost;
        const unitCal = foodDef ? foodDef.calories : item.calories / item.quantity;
        const unitProt = foodDef ? foodDef.protein : item.protein / item.quantity;
        const unitCarbs = foodDef ? foodDef.carbs : item.carbs / item.quantity;
        const unitFat = foodDef ? foodDef.fat : item.fat / item.quantity;

        return {
          ...item,
          quantity,
          calories: Math.round(unitCal * quantity),
          protein: Number((unitProt * quantity).toFixed(1)),
          carbs: Math.round(unitCarbs * quantity),
          fat: Math.round(unitFat * quantity),
          cost: Math.round(unitCost * quantity),
        };
      });

      return {
        ...m,
        items,
        totalCalories: items.reduce((acc, i) => acc + i.calories, 0),
        totalProtein: Number(items.reduce((acc, i) => acc + i.protein, 0).toFixed(1)),
        totalCarbs: items.reduce((acc, i) => acc + i.carbs, 0),
        totalFat: items.reduce((acc, i) => acc + i.fat, 0),
        totalCost: items.reduce((acc, i) => acc + i.cost, 0),
      };
    });

    await updatePlan({ meals: updatedMeals });
    setEditingItemInfo(null);
  };

  const handleAddFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const foodDef = INITIAL_FOOD_DATABASE.find((f) => f.id === selectedFoodIdToAdd);
    if (!foodDef) return;

    const unitCost = user?.customPrices?.[foodDef.id] ?? foodDef.cost;
    const newEntry: MealItemEntry = {
      foodId: foodDef.id,
      name: foodDef.name,
      servingSize: foodDef.servingSize,
      quantity: quantityToAdd,
      calories: Math.round(foodDef.calories * quantityToAdd),
      protein: Number((foodDef.protein * quantityToAdd).toFixed(1)),
      carbs: Math.round(foodDef.carbs * quantityToAdd),
      fat: Math.round(foodDef.fat * quantityToAdd),
      cost: Math.round(unitCost * quantityToAdd),
    };

    const updatedMeals = meals.map((m) => {
      if (m.id !== targetMealIdForAdd) return m;
      const items = [...m.items, newEntry];
      return {
        ...m,
        items,
        totalCalories: items.reduce((acc, i) => acc + i.calories, 0),
        totalProtein: Number(items.reduce((acc, i) => acc + i.protein, 0).toFixed(1)),
        totalCarbs: items.reduce((acc, i) => acc + i.carbs, 0),
        totalFat: items.reduce((acc, i) => acc + i.fat, 0),
        totalCost: items.reduce((acc, i) => acc + i.cost, 0),
      };
    });

    await updatePlan({ meals: updatedMeals });
    setIsAddFoodModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-white selection-red">
      {/* 3D Diet Showcase Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/3 opacity-25 md:opacity-40 pointer-events-none overflow-hidden">
          <img
            src={ASSETS.diet3D}
            alt="3D Diet Bowl"
            className="w-full h-full object-cover object-center filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 rounded-md text-[10px] font-bold uppercase tracking-wider font-manrope">
              {profile?.foodPreference ? profile.foodPreference.replace('_', ' ') : 'Vegetarian'} Plan
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              5 Meals • Daily Target: {currency}{dailyBudget}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-manrope">
            Personalized Diet & Nutrition Plan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
            Every meal is calibrated for your protein requirement ({profile?.calculatedMetrics?.targetProteinGrams || 85}g) while keeping daily spending within {currency}{dailyBudget}.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAnalyzeFoodModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-red-600/30 transition active:scale-95 font-manrope"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Food Photo</span>
          </button>
        </div>
      </div>

      {/* Budget Optimization Banner */}
      <div
        className={`p-5 rounded-3xl border shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          budgetAnalysis.isOverBudget
            ? 'bg-red-950/40 border-red-800 text-red-200'
            : 'bg-zinc-950/90 border-zinc-800 text-zinc-200'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
              budgetAnalysis.isOverBudget
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-[#ef233c]/20 border-[#ef233c]/30 text-[#ef233c]'
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-manrope">Budget Status:</span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  budgetAnalysis.isOverBudget
                    ? 'bg-red-500 text-black'
                    : 'bg-[#ef233c] text-white'
                }`}
              >
                {budgetAnalysis.isOverBudget
                  ? `Over Budget by ${currency}${budgetAnalysis.overBudgetAmount}`
                  : `Within Budget (${currency}${budgetAnalysis.remainingAmount} remaining)`}
              </span>
            </div>
            <p className="text-xs font-medium mt-1 text-zinc-300">
              Planned Cost: <strong className="text-white">{currency}{budgetAnalysis.totalPlannedCost}</strong> / Target: {currency}{dailyBudget} per day.
              {budgetAnalysis.isOverBudget &&
                ' Tap any cheaper superfood swap below to stay within budget instantly.'}
            </p>
          </div>
        </div>

        {/* Quick Macro Breakdown Tiles */}
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-4 bg-black/80 px-4 py-2.5 rounded-2xl border border-zinc-800">
            <div>
              <span className="text-zinc-500 block text-[10px] font-mono">Calories</span>
              <span className="font-extrabold text-white font-manrope">{totalCalories} kcal</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] font-mono">Protein</span>
              <span className="font-extrabold text-[#ef233c] font-manrope">{totalProtein}g</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] font-mono">Cost</span>
              <span className="font-extrabold text-white font-manrope">{currency}{budgetAnalysis.totalPlannedCost}</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditBudgetOpen(true)}
            className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs rounded-2xl border border-white/10 transition flex items-center gap-1.5 font-manrope"
            title="Adjust your daily/weekly food budget"
          >
            <Wallet className="w-3.5 h-3.5 text-[#ef233c]" />
            <span>Edit Budget</span>
          </button>
        </div>
      </div>

      {/* Cheaper Alternatives Recommendations (Budget Optimizer) */}
      {budgetAnalysis.suggestions.length > 0 && (
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-zinc-200 font-extrabold text-xs font-manrope">
            <ArrowRightLeft className="w-4 h-4 text-[#ef233c]" />
            <span>Budget Optimization Swaps ({budgetAnalysis.suggestions.length} recommended)</span>
          </div>
          <p className="text-xs text-zinc-400">
            Swap premium ingredients with budget-friendly superfoods providing equal or higher protein:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {budgetAnalysis.suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="p-4 bg-black/90 rounded-2xl border border-zinc-800 shadow-md flex flex-col justify-between text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-300">{sug.originalName}</span>
                    <span className="text-zinc-600 font-bold">→</span>
                    <span className="font-extrabold text-[#ef233c]">{sug.alternativeName}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 font-bold rounded-lg text-[11px] font-mono">
                    Save {currency}{sug.potentialSavings}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">{sug.reason}</p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Protein: {sug.originalProtein}g → {sug.alternativeProtein}g
                  </span>
                  <button
                    onClick={() =>
                      handleApplyCheaperAlternative(
                        sug.mealId,
                        sug.originalFoodId,
                        sug.alternativeFoodId
                      )
                    }
                    className="px-3.5 py-1.5 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold text-[11px] rounded-xl transition active:scale-95 font-manrope"
                  >
                    Apply Swap
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synchronized Daily Meal Price Breakdown Strip */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl px-5 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400 font-semibold font-manrope">
          <ShieldCheck className="w-4 h-4 text-[#ef233c] shrink-0" />
          <span>Synchronized Daily Meal Total:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono font-bold">
          {meals.map((m, idx) => (
            <span key={m.id} className="inline-flex items-center gap-1">
              <span className="text-zinc-300">
                {m.name.split(' ')[0]}: <strong className="text-white">{currency}{m.totalCost}</strong>
              </span>
              {idx < meals.length - 1 && <span className="text-zinc-600">+</span>}
            </span>
          ))}
          <span className="text-zinc-500 font-bold">=</span>
          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-extrabold font-manrope">
            {currency}{budgetAnalysis.totalPlannedCost} / day
          </span>
          <span className="text-zinc-400 font-sans font-medium text-[11px] ml-1">
            (Limit: {currency}{dailyBudget})
          </span>
        </div>
      </div>

      {/* 5 Structured Meal Cards */}
      <div className="space-y-4">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="bg-zinc-950/80 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden"
          >
            {/* Meal Header */}
            <div className="px-6 py-4 bg-black/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-white/5 text-[#ef233c] font-black text-xs rounded-xl border border-white/10 font-mono">
                  {meal.time}
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-base font-manrope">{meal.name}</h3>
                  <span className="text-[10px] text-zinc-500 font-semibold">
                    {meal.items.length} food items planned
                  </span>
                </div>
              </div>

              {/* Meal Total Macros & Add Button */}
              <div className="flex items-center gap-4 text-xs">
                {/* Mobile Meal Price Tag */}
                <span className="sm:hidden px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-white font-extrabold text-xs font-mono">
                  {currency}{meal.totalCost}
                </span>

                <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-zinc-400">
                  <span><strong className="text-white">{meal.totalCalories}</strong> kcal</span>
                  <span><strong className="text-[#ef233c]">{meal.totalProtein}g</strong> protein</span>
                  <span><strong className="text-zinc-300">{meal.totalCarbs}g</strong> carbs</span>
                  <span><strong className="text-zinc-300">{meal.totalFat}g</strong> fat</span>
                  <span className="text-white font-bold">{currency}{meal.totalCost}</span>
                </div>

                <button
                  onClick={() => {
                    setTargetMealIdForAdd(meal.id);
                    setIsAddFoodModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition font-manrope"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ef233c]" />
                  <span>Add Food</span>
                </button>
              </div>
            </div>

            {/* Meal Items List */}
            <div className="p-4 sm:p-6 divide-y divide-zinc-900">
              {meal.items.map((item, itemIdx) => (
                <div
                  key={`${item.foodId}-${itemIdx}`}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm font-manrope">{item.name}</span>
                      <span className="text-[11px] text-zinc-500">({item.servingSize})</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span>Quantity: <strong className="text-zinc-200">{item.quantity}x</strong></span>
                      <span>•</span>
                      <span>{item.calories} kcal</span>
                      <span>•</span>
                      <span className="text-[#ef233c] font-bold">{item.protein}g Protein</span>
                      <span>•</span>
                      <span>{item.carbs}g Carbs</span>
                      <span>•</span>
                      <span>{item.fat}g Fat</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-1 sm:pt-0">
                    <span className="font-black text-white text-sm sm:text-right font-manrope">
                      {currency}{item.cost}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setEditingItemInfo({
                            mealId: meal.id,
                            itemIndex: itemIdx,
                            quantity: item.quantity,
                          })
                        }
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                        title="Edit quantity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRemoveFood(meal.id, itemIdx)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition"
                        title="Remove food"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Quantity Modal */}
      {editingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="w-full max-w-sm bg-zinc-950 rounded-3xl p-6 shadow-2xl border border-zinc-800 space-y-4">
            <h3 className="font-extrabold text-base text-white font-manrope">Edit Food Quantity</h3>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Serving Multiplier</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="10"
                value={editingItemInfo.quantity}
                onChange={(e) =>
                  setEditingItemInfo({
                    ...editingItemInfo,
                    quantity: parseFloat(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl font-bold text-white text-sm focus:ring-2 focus:ring-[#ef233c]"
              />
              <p className="text-[11px] text-zinc-500 mt-1">e.g. 1.5 = 1.5x of base serving size</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItemInfo(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuantityEdit}
                className="px-5 py-2 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition font-manrope"
              >
                Update Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Food from Database Modal */}
      {isAddFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="w-full max-w-md bg-zinc-950 rounded-3xl p-6 shadow-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white font-manrope">Add Food to Meal</h3>
              <button
                onClick={() => setIsAddFoodModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFoodSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Select Food Item</label>
                <select
                  value={selectedFoodIdToAdd}
                  onChange={(e) => setSelectedFoodIdToAdd(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-[#ef233c]"
                >
                  {INITIAL_FOOD_DATABASE.map((f) => (
                    <option key={f.id} value={f.id} className="bg-zinc-950 text-white">
                      {f.name} ({f.servingSize}) — {f.protein}g Prot, {currency}{f.cost}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Quantity / Servings</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl font-bold text-white text-sm focus:ring-2 focus:ring-[#ef233c]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFoodModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition font-manrope"
                >
                  Add to Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Edit Budget Modal */}
      <EditBudgetModal isOpen={isEditBudgetOpen} onClose={() => setIsEditBudgetOpen(false)} />
    </div>
  );
};
