import React, { useState } from 'react';
import {
  LineChart,
  TrendingDown,
  TrendingUp,
  Award,
  Calendar,
  Wallet,
  Dumbbell,
  Droplets,
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectSmartAdjustments } from '../utils/smartAdjustments';
import { ASSETS } from '../assets/images';

export const ProgressView: React.FC = () => {
  const { user, updatePlan, updateProfile, currency } = useApp();

  const logs = user?.logs || [];
  const profile = user?.profile;
  const plan = user?.plan;

  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  const [activeChart, setActiveChart] = useState<'weight' | 'calories' | 'protein' | 'spending' | 'water'>('weight');

  const daysCount = parseInt(timeRange, 10);
  const visibleLogs = logs.slice(-daysCount);

  const totalLoggedDays = visibleLogs.length || 1;
  const completedWorkouts = visibleLogs.filter((l) => l.workoutCompleted).length;
  const avgCalories = Math.round(visibleLogs.reduce((acc, l) => acc + (l.caloriesConsumed || 0), 0) / totalLoggedDays);
  const avgProtein = Number(
    (visibleLogs.reduce((acc, l) => acc + (l.proteinConsumed || 0), 0) / totalLoggedDays).toFixed(1)
  );
  const avgSpending = Math.round(visibleLogs.reduce((acc, l) => acc + (l.foodSpent || 0), 0) / totalLoggedDays);

  const weightStart = visibleLogs[0]?.weightKg || profile?.weightKg || 65;
  const weightEnd = visibleLogs[visibleLogs.length - 1]?.weightKg || profile?.weightKg || 65;
  const weightDelta = Number((weightEnd - weightStart).toFixed(1));

  const smartAdjustments = user && plan ? detectSmartAdjustments(logs, profile!, plan) : [];

  const handleApplyAdjustment = async (adj: any) => {
    if (adj.type === 'breakfast_time') {
      const updatedMeals = plan?.meals.map((m) => (m.id === 'm1' ? { ...m, time: '10:00' } : m)) || [];
      const updatedRoutine = plan?.dailyRoutine.map((r) => (r.id === 'r-bfast' ? { ...r, time: '10:00' } : r)) || [];
      await updatePlan({ meals: updatedMeals, dailyRoutine: updatedRoutine });
    } else if (adj.type === 'workout_time') {
      const newPreferred = adj.proposedChanges.newValue;
      await updateProfile({ ...profile!, preferredWorkoutTime: newPreferred });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-white selection-red">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-manrope">
            <span>Progress & Adherence Analytics</span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 rounded-lg font-mono">
              {logs.length} Days Logged
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Tracking trends for weight, protein intake, workout consistency, and budget discipline.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setTimeRange('7')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition font-manrope ${
              timeRange === '7' ? 'bg-[#ef233c] text-white shadow-md shadow-red-600/30' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition font-manrope ${
              timeRange === '30' ? 'bg-[#ef233c] text-white shadow-md shadow-red-600/30' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Weekly Report Card with 3D Fit Body Showcase */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black text-white p-6 sm:p-8 shadow-2xl border border-white/10 space-y-4">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/3 opacity-15 md:opacity-30 pointer-events-none overflow-hidden">
          <img
            src={ASSETS.fitBody3D}
            alt="Fit Body Art"
            className="w-full h-full object-cover object-center filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ef233c]" />
            <h3 className="font-extrabold text-base tracking-tight text-white font-manrope">Your Weekly Progress Report</h3>
          </div>
          <span className="text-[11px] font-bold text-[#ef233c] bg-[#ef233c]/15 border border-[#ef233c]/30 px-2.5 py-1 rounded-lg font-mono">
            Adherence: {Math.round((completedWorkouts / (profile?.workoutDaysPerWeek || 4)) * 100)}%
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-black/80 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block font-mono">Workouts Finished</span>
            <span className="text-2xl font-black text-[#ef233c] font-manrope">
              {completedWorkouts} <span className="text-xs text-zinc-500 font-normal">/ {profile?.workoutDaysPerWeek || 4}</span>
            </span>
          </div>

          <div className="p-3.5 bg-black/80 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block font-mono">Avg. Protein Intake</span>
            <span className="text-2xl font-black text-white font-manrope">
              {avgProtein}g <span className="text-xs text-zinc-500 font-normal">/ day</span>
            </span>
          </div>

          <div className="p-3.5 bg-black/80 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block font-mono">Avg. Food Spending</span>
            <span className="text-2xl font-black text-white font-manrope">
              {currency}{avgSpending} <span className="text-xs text-zinc-500 font-normal">/ day</span>
            </span>
          </div>

          <div className="p-3.5 bg-black/80 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block font-mono">Weight Change</span>
            <div className="flex items-center justify-center gap-1 font-manrope">
              <span className="text-2xl font-black text-white">
                {weightDelta > 0 ? `+${weightDelta}` : weightDelta}
              </span>
              <span className="text-xs text-zinc-500 font-normal">kg</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-zinc-300 leading-relaxed bg-black/80 p-3.5 rounded-2xl border border-zinc-800 font-light">
          <strong>Observation:</strong> You've maintained steady protein and stayed close to your daily food budget ({currency}{profile?.calculatedMetrics?.targetDailyBudget || 150}). Remember that daily weight fluctuates by 1–2 kg due to water retention and sodium. Consistency over weeks is what creates lasting progress.
        </p>
      </div>

      {/* Smart Adjustments Section */}
      {smartAdjustments.length > 0 && (
        <div className="bg-[#0e1a3a]/80 rounded-3xl p-6 border border-blue-500/30 space-y-4">
          <div className="flex items-center gap-2 text-blue-300 font-extrabold text-sm">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Smart Recommendations Based on Your Logged Habits</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {smartAdjustments.map((adj) => (
              <div
                key={adj.id}
                className="p-4 bg-[#0d1736] rounded-2xl border border-[#1b2b54] shadow-md flex flex-col justify-between space-y-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{adj.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{adj.message}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#1b2b54]">
                  <span className="text-[11px] text-blue-400 font-medium">Always asks before changing</span>
                  <button
                    onClick={() => handleApplyAdjustment(adj)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition active:scale-95 shadow-md shadow-blue-600/30"
                  >
                    {adj.actionText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Area */}
      <div className="bg-[#0d1736] rounded-3xl p-6 sm:p-8 border border-[#1b2b54] shadow-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2b54] overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            {[
              { id: 'weight', label: 'Weight Trend', icon: TrendingDown },
              { id: 'calories', label: 'Calories', icon: Flame },
              { id: 'protein', label: 'Protein Intake', icon: Dumbbell },
              { id: 'spending', label: 'Food Spending', icon: Wallet },
              { id: 'water', label: 'Hydration', icon: Droplets },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeChart === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#0e1a3a]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-56 flex items-end gap-2 sm:gap-4 pt-4 border-b border-[#1b2b54] pb-2">
            {visibleLogs.map((log) => {
              let value = 0;
              let maxValue = 100;
              let displaySuffix = '';

              if (activeChart === 'weight') {
                value = log.weightKg || 65;
                maxValue = 100;
                displaySuffix = ' kg';
              } else if (activeChart === 'calories') {
                value = log.caloriesConsumed || 0;
                maxValue = 3000;
                displaySuffix = ' kcal';
              } else if (activeChart === 'protein') {
                value = log.proteinConsumed || 0;
                maxValue = 120;
                displaySuffix = 'g';
              } else if (activeChart === 'spending') {
                value = log.foodSpent || 0;
                maxValue = (profile?.budgetAmount || 150) * 1.5;
                displaySuffix = currency;
              } else if (activeChart === 'water') {
                value = log.waterIntakeMl || 0;
                maxValue = 3500;
                displaySuffix = ' ml';
              }

              const heightPercent = Math.min(100, Math.max(15, (value / maxValue) * 100));

              return (
                <div key={log.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold bg-white text-slate-900 px-2 py-0.5 rounded shadow pointer-events-none mb-1">
                    {value}{displaySuffix}
                  </div>

                  <div
                    className="w-full max-w-[42px] bg-gradient-to-t from-blue-600 via-blue-500 to-emerald-400 rounded-t-xl transition-all duration-300 group-hover:brightness-125 shadow-sm shadow-blue-600/30"
                    style={{ height: `${heightPercent}%` }}
                  />

                  <span className="text-[10px] font-semibold text-slate-400 mt-1">
                    {new Date(log.date).toLocaleDateString([], { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Trend timeline ({visibleLogs.length} days)</span>
            <span className="font-bold text-white">
              {activeChart === 'weight' && `Current: ${weightEnd} kg`}
              {activeChart === 'calories' && `Avg: ${avgCalories} kcal/day`}
              {activeChart === 'protein' && `Avg: ${avgProtein} g/day`}
              {activeChart === 'spending' && `Avg: ${currency}${avgSpending}/day`}
              {activeChart === 'water' && `Target: 2.5 L/day`}
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Policy Box */}
      <div className="p-5 bg-[#0d1736] rounded-3xl border border-[#1b2b54] text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-white">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>FitBudget Privacy & User Tracking Transparency</span>
        </div>
        <p className="leading-relaxed">
          FitBudget tracks only the data you choose to log (weight, completed meals, workouts, water, and food expenses) solely to render your personal progress charts and budget optimization suggestions. Your data is stored securely in your private account and is never sold or shared with third-party advertisers.
        </p>
      </div>
    </div>
  );
};
