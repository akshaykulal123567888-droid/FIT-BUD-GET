import React, { useState } from 'react';
import { X, Wallet, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../../server/db';

export const EditBudgetModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateProfile, regenerateAllPlans, currency } = useApp();

  const currentFrequency = user?.profile?.budgetFrequency || 'daily';
  const currentAmount = user?.profile?.budgetAmount || 150;

  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(currentFrequency);
  const [amount, setAmount] = useState<number>(currentAmount);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  // Calculate equivalent daily/weekly/monthly breakdown
  let dailyEquivalent = amount;
  let weeklyEquivalent = amount * 7;
  let monthlyEquivalent = amount * 30;

  if (frequency === 'weekly') {
    dailyEquivalent = Math.round(amount / 7);
    weeklyEquivalent = amount;
    monthlyEquivalent = Math.round((amount / 7) * 30);
  } else if (frequency === 'monthly') {
    dailyEquivalent = Math.round(amount / 30);
    weeklyEquivalent = Math.round((amount / 30) * 7);
    monthlyEquivalent = amount;
  }

  const handleSaveBudget = async () => {
    if (!user?.profile) return;
    setIsUpdating(true);
    try {
      const updatedProfile: UserProfile = {
        ...user.profile,
        budgetFrequency: frequency,
        budgetAmount: amount,
        calculatedMetrics: {
          ...user.profile.calculatedMetrics!,
          targetDailyBudget: dailyEquivalent,
        },
      };

      await regenerateAllPlans(updatedProfile);
      onClose();
    } catch (e) {
      console.error('Failed to update budget:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white selection-red">
      <div className="relative w-full max-w-md bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-[#ef233c] border border-red-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-manrope">Update Food Budget</h3>
              <p className="text-[11px] text-zinc-400">Set your custom food spending ceiling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Frequency Tabs */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2 font-manrope">Budget Timeframe</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-black rounded-xl border border-zinc-800">
            {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
              <button
                type="button"
                key={freq}
                onClick={() => setFrequency(freq)}
                className={`py-1.5 text-xs font-bold rounded-lg capitalize transition font-manrope ${
                  frequency === freq
                    ? 'bg-[#ef233c] text-white shadow-md shadow-red-600/30 font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Presets for Daily */}
        {frequency === 'daily' && (
          <div>
            <span className="text-[11px] text-zinc-500 block mb-1.5 font-mono">Quick Daily Benchmarks:</span>
            <div className="grid grid-cols-4 gap-2">
              {[100, 150, 200, 300].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-2 rounded-xl text-xs font-bold border transition font-mono ${
                    amount === preset
                      ? 'bg-[#ef233c] text-white border-red-500 font-black shadow-md shadow-red-600/30'
                      : 'border-zinc-800 bg-black text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {currency}{preset}/day
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
            Your {frequency} Food Budget Amount:
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-[#ef233c] font-extrabold text-base font-mono">
              {currency}
            </span>
            <input
              type="number"
              min="20"
              max="50000"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
              className="w-full pl-8 pr-4 py-2.5 bg-black border border-zinc-800 rounded-xl font-black text-white text-lg focus:ring-2 focus:ring-[#ef233c] focus:outline-none font-manrope"
            />
          </div>
        </div>

        {/* Calculated Breakdown Display */}
        <div className="p-4 bg-black/80 rounded-2xl border border-zinc-800 space-y-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">
            Equivalent Breakdown:
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block font-mono">Daily</span>
              <span className="font-extrabold text-[#ef233c] font-manrope">{currency}{dailyEquivalent}</span>
            </div>
            <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block font-mono">Weekly</span>
              <span className="font-extrabold text-white font-manrope">{currency}{weeklyEquivalent}</span>
            </div>
            <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block font-mono">Monthly</span>
              <span className="font-extrabold text-white font-manrope">{currency}{monthlyEquivalent}</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed pt-1 font-light">
            FitBudget will re-optimize your 5-meal plan to fit within <strong>{currency}{dailyEquivalent}/day</strong> using budget superfood staples.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveBudget}
            disabled={isUpdating}
            className="px-5 py-2.5 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-600/30 transition active:scale-95 flex items-center gap-1.5 font-manrope"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isUpdating ? 'Re-optimizing Diet...' : 'Save & Update Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
