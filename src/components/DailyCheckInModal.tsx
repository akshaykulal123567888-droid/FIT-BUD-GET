import React, { useState } from 'react';
import { X, CheckCircle, Scale, Zap, Dumbbell, Droplets, Moon, FileText, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DailyCheckInModal: React.FC = () => {
  const { isCheckInModalOpen, setIsCheckInModalOpen, todayLog, saveTodayLog, user } = useApp();

  const [weight, setWeight] = useState<number>(todayLog.weightKg || user?.profile?.weightKg || 65);
  const [energy, setEnergy] = useState<number>(todayLog.energyLevel || 4);
  const [workoutCompleted, setWorkoutCompleted] = useState<boolean>(todayLog.workoutCompleted || false);
  const [waterMl, setWaterMl] = useState<number>(todayLog.waterIntakeMl || 2000);
  const [sleepHours, setSleepHours] = useState<number>(todayLog.sleepHours || 7.5);
  const [notes, setNotes] = useState<string>(todayLog.notes || '');
  const [mealsCompleted, setMealsCompleted] = useState<string[]>(todayLog.mealsCompleted || ['m1', 'm2', 'm3']);
  const [isSaving, setIsSaving] = useState(false);

  if (!isCheckInModalOpen) return null;

  const mealOptions = [
    { id: 'm1', label: 'Breakfast' },
    { id: 'm2', label: 'Mid-Morning Snack' },
    { id: 'm3', label: 'Lunch' },
    { id: 'm4', label: 'Evening Snack' },
    { id: 'm5', label: 'Dinner' },
  ];

  const toggleMeal = (id: string) => {
    setMealsCompleted((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const plannedMeals = user?.plan?.meals || [];
      let totalCal = 0;
      let totalProt = 0;
      let totalCost = 0;

      plannedMeals.forEach((m) => {
        if (mealsCompleted.includes(m.id)) {
          totalCal += m.totalCalories;
          totalProt += m.totalProtein;
          totalCost += m.totalCost;
        }
      });

      await saveTodayLog({
        weightKg: Number(weight),
        energyLevel: energy,
        workoutCompleted,
        waterIntakeMl: waterMl,
        sleepHours: Number(sleepHours),
        mealsCompleted,
        caloriesConsumed: totalCal,
        proteinConsumed: Number(totalProt.toFixed(1)),
        foodSpent: totalCost,
        notes,
      });

      setIsCheckInModalOpen(false);
    } catch (e) {
      console.error('Failed to save log:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white selection-red">
      <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/90 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ef233c]" />
            <div>
              <h3 className="font-extrabold text-base leading-tight text-white font-manrope">Daily Check-In</h3>
              <p className="text-[11px] text-zinc-400">How was your day? Quick 30-second log.</p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckInModalOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm text-zinc-300">
          {/* Weight */}
          <div>
            <label className="flex items-center gap-2 font-bold text-white mb-1.5 text-xs font-manrope">
              <Scale className="w-4 h-4 text-[#ef233c]" />
              <span>Morning Weight (kg)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-32 px-3 py-2 bg-black border border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#ef233c] font-black text-white focus:outline-none"
              />
              <span className="text-xs text-zinc-400">kg (Recorded for weight trend)</span>
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="flex items-center gap-2 font-bold text-white mb-1.5 text-xs font-manrope">
              <Zap className="w-4 h-4 text-[#ef233c]" />
              <span>Energy & Motivation Level</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: 1, label: 'Exhausted', emoji: '😴' },
                { val: 2, label: 'Low', emoji: '🥱' },
                { val: 3, label: 'Normal', emoji: '🙂' },
                { val: 4, label: 'Great', emoji: '⚡' },
                { val: 5, label: 'On Fire!', emoji: '🔥' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.val}
                  onClick={() => setEnergy(item.val)}
                  className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 font-manrope ${
                    energy === item.val
                      ? 'bg-[#ef233c] text-white border-red-500 font-black shadow-md shadow-red-600/30'
                      : 'border-zinc-800 bg-black/80 hover:bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[10px] leading-tight font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workout Completed? */}
          <div>
            <label className="flex items-center gap-2 font-bold text-white mb-1.5 text-xs font-manrope">
              <Dumbbell className="w-4 h-4 text-[#ef233c]" />
              <span>Did you finish today's workout?</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWorkoutCompleted(true)}
                className={`py-2.5 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition text-xs font-manrope ${
                  workoutCompleted
                    ? 'bg-[#ef233c] text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'border-zinc-800 bg-black text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Yes, Completed!</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkoutCompleted(false)}
                className={`py-2.5 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition text-xs font-manrope ${
                  !workoutCompleted
                    ? 'bg-zinc-900 text-white border-zinc-700'
                    : 'border-zinc-800 bg-black text-zinc-500 hover:bg-zinc-900'
                }`}
              >
                <span>Rest Day / Skipped</span>
              </button>
            </div>
          </div>

          {/* Meals Completed */}
          <div>
            <label className="flex items-center justify-between font-bold text-white mb-1.5 text-xs font-manrope">
              <span>Meals Adhered to Today:</span>
              <span className="text-xs font-normal text-zinc-400">{mealsCompleted.length} of 5 completed</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mealOptions.map((m) => {
                const checked = mealsCompleted.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleMeal(m.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition text-left font-manrope ${
                      checked
                        ? 'bg-[#ef233c]/15 border-[#ef233c]/40 text-white'
                        : 'border-zinc-800 bg-black/80 text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        checked ? 'bg-[#ef233c] border-[#ef233c] text-white font-bold' : 'border-zinc-800'
                      }`}
                    >
                      {checked && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Water & Sleep Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 font-bold text-white text-xs mb-1 font-manrope">
                <Droplets className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Water (ml)</span>
              </label>
              <input
                type="number"
                step="250"
                min="0"
                max="8000"
                value={waterMl}
                onChange={(e) => setWaterMl(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl font-bold text-white text-sm focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">~{Math.round(waterMl / 250)} standard glasses</p>
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-bold text-white text-xs mb-1 font-manrope">
                <Moon className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Sleep (hours)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="16"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl font-bold text-white text-sm focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Target: 7–8 hrs</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 font-bold text-white text-xs mb-1 font-manrope">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Notes / Reflections (optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Felt great energy during push-ups, stayed strictly within daily budget!"
              className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/90 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsCheckInModalOpen(false)}
            className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#ef233c] hover:bg-red-700 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-md shadow-red-600/30 transition active:scale-95 flex items-center gap-2 font-manrope"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Check-In'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
