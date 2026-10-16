import React, { useState } from 'react';
import {
  Dumbbell,
  UtensilsCrossed,
  Wallet,
  LineChart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  Flame,
  Zap,
  Check,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../assets/images';

export const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const {
    loadDemoUser,
    loginWithEmail,
    setIsDisclaimerModalOpen,
    currency,
    initialBudget,
    setInitialBudget,
    startNewPlanWithBudget,
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  // Starting Page Hero Budget State
  const [budgetFreq, setBudgetFreq] = useState<'daily' | 'weekly' | 'monthly'>(initialBudget?.frequency || 'daily');
  const [budgetAmt, setBudgetAmt] = useState<number>(initialBudget?.amount || 150);

  // Conversion calculations
  const dailyEquivalent =
    budgetFreq === 'daily'
      ? budgetAmt
      : budgetFreq === 'weekly'
      ? Math.round(budgetAmt / 7)
      : Math.round(budgetAmt / 30);

  const weeklyEquivalent =
    budgetFreq === 'weekly'
      ? budgetAmt
      : budgetFreq === 'daily'
      ? budgetAmt * 7
      : Math.round((budgetAmt / 30) * 7);

  const monthlyEquivalent =
    budgetFreq === 'monthly'
      ? budgetAmt
      : budgetFreq === 'daily'
      ? budgetAmt * 30
      : Math.round((budgetAmt / 7) * 30);

  // Interactive Quick Calculator on Landing Page
  const [quickWeight, setQuickWeight] = useState(65);
  const [quickGoal, setQuickGoal] = useState<'lose_weight' | 'maintain_weight' | 'gain_weight'>('lose_weight');

  const estimatedCalories =
    quickGoal === 'lose_weight'
      ? Math.round(quickWeight * 28)
      : quickGoal === 'gain_weight'
      ? Math.round(quickWeight * 36)
      : Math.round(quickWeight * 32);

  const estimatedProtein =
    quickGoal === 'lose_weight'
      ? Math.round(quickWeight * 1.8)
      : quickGoal === 'gain_weight'
      ? Math.round(quickWeight * 1.7)
      : Math.round(quickWeight * 1.4);

  const handleStartWithBudget = () => {
    startNewPlanWithBudget(budgetAmt, budgetFreq);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      await loginWithEmail(emailInput.trim());
      setIsLoginModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">
                  Fit<span className="text-emerald-400">Budget</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md">
                  3D FITNESS & DIET
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Budget-Optimized Nutrition & Workout Planner</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsDisclaimerModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Health Disclaimer</span>
            </button>

            {/* Profile Button - Clearly visible on mobile and desktop */}
            <button
              onClick={onGetStarted}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition active:scale-95 shadow-sm"
              title="Make or view your profile"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl border border-zinc-800 transition"
            >
              Sign In
            </button>

            <button
              onClick={handleStartWithBudget}
              className="px-3.5 sm:px-5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center gap-1"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 hidden xs:inline-block" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20">
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Structured Fitness • Budget Optimization • 3D Visual Routines</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            Your Fitness Plan.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Your Budget.
            </span>{' '}
            Your Routine.
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Get a personalized food and workout plan based on your body, goals, budget and lifestyle.
          </p>

          <p className="text-xs text-zinc-500 flex items-center justify-center gap-2">
            <span>✓ No credit card required</span>
            <span>•</span>
            <span>✓ No forced Google login</span>
            <span>•</span>
            <span>✓ 100% customizable</span>
          </p>
        </div>

        {/* 🌟 STARTING PAGE BUDGET INPUT CARD (HERO PROMINENCE) 🌟 */}
        <div className="max-w-3xl mx-auto bg-gradient-to-b from-zinc-900 via-zinc-950 to-black rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                      Step 1 of Planning
                    </span>
                    <h2 className="text-lg font-black text-white">How much can you spend on food?</h2>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Input your food budget below to personalize 5 daily high-protein meals within your budget.
                  </p>
                </div>
              </div>

              {/* Frequency Toggle */}
              <div className="inline-flex p-1 bg-black rounded-xl border border-zinc-800 self-start sm:self-center">
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => {
                      setBudgetFreq(freq);
                      if (freq === 'daily' && budgetAmt > 1000) setBudgetAmt(150);
                      if (freq === 'weekly' && budgetAmt < 300) setBudgetAmt(1050);
                      if (freq === 'monthly' && budgetAmt < 1000) setBudgetAmt(4500);
                    }}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg capitalize transition ${
                      budgetFreq === freq
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Budget Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Popular {budgetFreq === 'daily' ? 'Daily' : budgetFreq === 'weekly' ? 'Weekly' : 'Monthly'} Benchmarks:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    daily: 100,
                    label: 'Smart Saver',
                    desc: 'Dal, eggs/soya, oats & roti',
                  },
                  {
                    daily: 150,
                    label: 'Optimal Balance',
                    desc: 'Eggs, curd, milk, bananas & dal',
                    popular: true,
                  },
                  {
                    daily: 200,
                    label: 'High Protein',
                    desc: 'Paneer, chicken/eggs, nuts, curd',
                  },
                  {
                    daily: 300,
                    label: 'Athletic Premium',
                    desc: 'Fish/chicken, dry fruits, seeds, paneer',
                  },
                ].map((preset) => {
                  const targetAmt =
                    budgetFreq === 'daily'
                      ? preset.daily
                      : budgetFreq === 'weekly'
                      ? preset.daily * 7
                      : preset.daily * 30;

                  const isSelected = budgetAmt === targetAmt;

                  return (
                    <button
                      key={preset.daily}
                      type="button"
                      onClick={() => setBudgetAmt(targetAmt)}
                      className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400'
                          : 'bg-black/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {preset.popular && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-black text-[9px] font-black rounded uppercase">
                          Popular
                        </span>
                      )}
                      <div>
                        <span className="text-base font-black text-white block">
                          {currency}{targetAmt}
                          <span className="text-[10px] text-zinc-400 font-semibold ml-1">/{budgetFreq}</span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">{preset.label}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 leading-tight mt-1 line-clamp-1">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input & Stepper */}
            <div className="bg-black/70 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-zinc-300 block">Custom {budgetFreq} Amount</span>
                  <span className="text-[11px] text-zinc-500">Type any specific budget or use quick adjusters:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBudgetAmt((prev) => Math.max(30, prev - (budgetFreq === 'daily' ? 10 : 100)))}
                    className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-800 flex items-center justify-center transition"
                  >
                    -
                  </button>

                  <div className="relative">
                    <span className="absolute left-3 top-2 text-zinc-400 font-bold text-sm">{currency}</span>
                    <input
                      type="number"
                      min="30"
                      max="100000"
                      value={budgetAmt}
                      onChange={(e) => setBudgetAmt(parseInt(e.target.value, 10) || 0)}
                      className="w-36 pl-7 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl font-black text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setBudgetAmt((prev) => prev + (budgetFreq === 'daily' ? 10 : 100))}
                    className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-800 flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dynamic Equivalent Budget Matrix */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center">
                <div className="p-2 bg-zinc-900/90 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-semibold block">Daily Equivalent</span>
                  <span className="text-sm font-black text-emerald-400">{currency}{dailyEquivalent}/day</span>
                </div>
                <div className="p-2 bg-zinc-900/90 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-semibold block">Weekly Equivalent</span>
                  <span className="text-sm font-black text-white">{currency}{weeklyEquivalent.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-zinc-900/90 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-semibold block">Monthly Equivalent</span>
                  <span className="text-sm font-black text-white">{currency}{monthlyEquivalent.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/40">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  At <strong>{currency}{dailyEquivalent}/day</strong>, FitBudget will configure 5 balanced meals (Breakfast, Mid-morning, Lunch, Evening Snack, Dinner) with over-budget auto-replacement suggestions.
                </span>
              </div>
            </div>

            {/* CTA Execution Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartWithBudget}
                className="w-full sm:flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Continue with {currency}{budgetAmt}/{budgetFreq} → Personalize My Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  await loadDemoUser();
                }}
                className="w-full sm:w-auto px-5 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-bold text-xs rounded-2xl transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Explore Demo (Aman, ₹150/day)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 3D VISUAL SHOWCASE: 3 PILLARS (GYM, FIT BODY, DIET) 🌟 */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                The 3 Core Pillars of FitBudget
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                Gym, Fit Body & Diet in Complete Harmony
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm">
              Engineered with 3D precision to align your calories, protein, workout days, and grocery costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. 3D Gym Workout Card */}
            <div className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col hover:border-emerald-500/50 transition duration-300">
              <div className="relative h-64 overflow-hidden bg-black">
                <img
                  src={ASSETS.gym3D}
                  alt="3D Gym Workout"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-zinc-700/80 rounded-xl text-[10px] font-extrabold uppercase text-emerald-400 shadow-md">
                  Pillar 1 • 3D Gym & Training
                </span>
                <span className="absolute bottom-3 right-4 px-2.5 py-1 bg-zinc-950/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-zinc-300 border border-zinc-800">
                  Full Gym • Dumbbells • Bodyweight
                </span>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-white">Targeted Workout Splits</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
                    Step-by-step workout splits tailored to beginner, intermediate, or advanced lifters. Includes rest stopwatches, muscle target guides, and exercise swaps.
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">Weekly Schedule</span>
                  <span className="text-emerald-400 font-extrabold">1–7 Days/Week Flexible</span>
                </div>
              </div>
            </div>

            {/* 2. 3D Fit Body Composition Card */}
            <div className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col hover:border-teal-500/50 transition duration-300">
              <div className="relative h-64 overflow-hidden bg-black">
                <img
                  src={ASSETS.fitBody3D}
                  alt="3D Fit Body"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-zinc-700/80 rounded-xl text-[10px] font-extrabold uppercase text-teal-400 shadow-md">
                  Pillar 2 • 3D Body & Metrics
                </span>
                <span className="absolute bottom-3 right-4 px-2.5 py-1 bg-zinc-950/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-zinc-300 border border-zinc-800">
                  Mifflin-St Jeor Formula
                </span>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-white">Body Composition & Metabolism</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
                    Scientific calculations for BMR, TDEE, informational BMI, and safe target calories. Avoids extreme deficits or dangerous starvation diets.
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">Target Protein Target</span>
                  <span className="text-teal-400 font-extrabold">1.4–1.8g / kg</span>
                </div>
              </div>
            </div>

            {/* 3. 3D Diet & Superfoods Card */}
            <div className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col hover:border-amber-500/50 transition duration-300">
              <div className="relative h-64 overflow-hidden bg-black">
                <img
                  src={ASSETS.diet3D}
                  alt="3D Fitness Diet"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md border border-zinc-700/80 rounded-xl text-[10px] font-extrabold uppercase text-amber-400 shadow-md">
                  Pillar 3 • 3D Budget Diet
                </span>
                <span className="absolute bottom-3 right-4 px-2.5 py-1 bg-zinc-950/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-zinc-300 border border-zinc-800">
                  5 Daily Meals Within Budget
                </span>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-white">Affordable High-Protein Meals</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
                    Calculated for Indian & global diets. If your plan exceeds your budget limit, smart 1-click swaps instantly recommend high-protein substitutes (e.g. Paneer → Eggs/Soya).
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">Budget Auto-Optimizer</span>
                  <span className="text-amber-400 font-extrabold">Smart Cost Swaps</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 4 MAIN BENEFITS (STRUCTURED FOR EASY UNDERSTANDING) 🌟 */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Structured For Effortless Understanding</h2>
            <p className="text-xs text-zinc-400">No complex jargon. Clear numbers, actionable meals, and real food prices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Personalized Diet',
                subtitle: '5 Structured Meals',
                desc: 'Balanced breakfast, mid-morning snack, lunch, evening snack, and dinner tailored to your exact calories and protein targets.',
                icon: UtensilsCrossed,
                color: 'text-emerald-400',
                border: 'hover:border-emerald-500/40',
              },
              {
                step: '02',
                title: 'Budget-Friendly Meals',
                subtitle: 'Zero Overspending',
                desc: 'If your plan is ₹35 over budget, smart 1-click swaps recommend high-protein affordable alternatives like soya, eggs, lentils, and oats.',
                icon: Wallet,
                color: 'text-amber-400',
                border: 'hover:border-amber-500/40',
              },
              {
                step: '03',
                title: 'Workout Planning',
                subtitle: 'Gym or Home Sets',
                desc: 'Structured sets, reps, rest stopwatches, and exercise alternatives suited to bodyweight, resistance bands, or full gym equipment.',
                icon: Dumbbell,
                color: 'text-blue-400',
                border: 'hover:border-blue-500/40',
              },
              {
                step: '04',
                title: 'Daily Progress Tracking',
                subtitle: 'Analytics & Habits',
                desc: 'Log quick 30-second daily check-ins, hydration, routine adherence, weight trends, and review automated weekly summaries.',
                icon: LineChart,
                color: 'text-teal-400',
                border: 'hover:border-teal-500/40',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`p-6 bg-zinc-900 rounded-3xl border border-zinc-800 ${item.border} transition flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-zinc-600">{item.step}</span>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">{item.title}</h4>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">{item.subtitle}</p>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🌟 STEP-BY-STEP WORKFLOW GUIDE 🌟 */}
        <div className="bg-zinc-950 rounded-3xl p-6 sm:p-10 border border-zinc-800 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Transparent Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">How Your Plan Is Created in 7 Steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: '1',
                title: 'Body Metrics',
                desc: 'Age, Height, Weight, Gender & Activity Level (Sedentary to Very Active)',
              },
              {
                num: '2',
                title: 'Fitness Goal',
                desc: 'Maintain Weight, Lose Weight, Gain Weight, or General Fitness (No extreme starvation)',
              },
              {
                num: '3',
                title: 'Diet & Allergies',
                desc: 'Vegetarian, Non-veg, Vegan, Eggetarian + Exclude milk, peanuts, gluten, eggs, etc.',
              },
              {
                num: '4',
                title: 'Budget Allocation',
                desc: 'Daily, Weekly, or Monthly food spend (₹100, ₹150, ₹200, ₹300, or Custom)',
              },
              {
                num: '5',
                title: 'Daily Lifestyle',
                desc: 'Wake time, sleep time, work/college hours, and preferred workout time window',
              },
              {
                num: '6',
                title: 'Equipment & Splits',
                desc: 'Full Gym, Dumbbells, Resistance Bands, or Home No Equipment (1–7 days/week)',
              },
              {
                num: '7',
                title: 'Instant Calculations',
                desc: 'Mifflin-St Jeor BMR, TDEE, Target Calories, Protein (g), and 5-Meal Schedule',
              },
              {
                num: 'AI',
                title: 'Smart Adjustments',
                desc: 'Analyze food photos via Gemini Vision and auto-adjust routine when life happens',
              },
            ].map((s) => (
              <div key={s.num} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-black border border-zinc-700 flex items-center justify-center text-xs font-black text-emerald-400 shrink-0">
                  {s.num}
                </span>
                <div>
                  <h5 className="font-bold text-sm text-white">{s.title}</h5>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🌟 INTERACTIVE QUICK ESTIMATOR PREVIEW 🌟 */}
        <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black rounded-3xl p-6 sm:p-10 border border-zinc-800 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Estimator Preview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Test the Scientific Formulas Before Starting
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Adjust the sliders below to see how our algorithm calculates realistic daily calories, protein, and grocery costs:
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-zinc-300">Your Current Weight</span>
                    <span className="text-emerald-400 font-bold text-sm">{quickWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="120"
                    value={quickWeight}
                    onChange={(e) => setQuickWeight(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-zinc-300 block mb-1.5">Target Fitness Goal:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'lose_weight', label: 'Fat Loss' },
                      { id: 'maintain_weight', label: 'Maintenance' },
                      { id: 'gain_weight', label: 'Muscle Gain' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setQuickGoal(g.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                          quickGoal === g.id
                            ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-zinc-300">Your Budget (from above)</span>
                    <span className="text-amber-400 font-bold text-sm">{currency}{dailyEquivalent}/day</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="400"
                    step="10"
                    value={dailyEquivalent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setBudgetFreq('daily');
                      setBudgetAmt(val);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Result Box */}
            <div className="lg:col-span-5 bg-zinc-900 rounded-3xl p-6 border border-zinc-800 space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Calculated Live Estimate
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 bg-black rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-semibold">Calories</span>
                  <span className="text-2xl font-black text-white">{estimatedCalories}</span>
                  <span className="text-[10px] text-zinc-500 block">kcal/day</span>
                </div>
                <div className="p-3.5 bg-black rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-semibold">Target Protein</span>
                  <span className="text-2xl font-black text-emerald-400">{estimatedProtein}g</span>
                  <span className="text-[10px] text-zinc-500 block">/day</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-emerald-300">
                  <span>Planned Budget:</span>
                  <span>{currency}{dailyEquivalent}/day</span>
                </div>
                <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                  Easily fits 5 balanced meals using whole wheat rotis, moong dal, eggs or soya chunks, curd, and seasonal vegetables.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartWithBudget}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Generate Complete Custom Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 bg-black py-8 text-xs text-zinc-500 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">FitBudget</span>
              <span>• Affordable Fitness, Nutrition & Routine Planner</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDisclaimerModalOpen(true)}
                className="hover:text-emerald-400 underline underline-offset-2 transition"
              >
                Medical & Wellness Disclaimer
              </button>
              <button
                onClick={async () => {
                  await loadDemoUser();
                }}
                className="hover:text-emerald-400 underline underline-offset-2 transition"
              >
                Launch Demo Mode (Aman)
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed text-center sm:text-left">
            <strong>Important Wellness Notice:</strong> FitBudget is a general wellness, exercise and lifestyle organization tool, NOT a medical provider or clinical dietitian. Calorie, protein, and food-cost figures are mathematical approximations. For medical conditions, pregnancy, or eating disorders, please consult a qualified healthcare professional.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-800 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">Sign In to FitBudget</h3>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md transition"
              >
                Continue with Email
              </button>
            </form>

            <div className="relative py-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-zinc-900 px-2 text-[10px] uppercase font-bold text-zinc-500">
                Or Quick Demo
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await loadDemoUser();
                setIsLoginModalOpen(false);
              }}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs rounded-xl transition"
            >
              Sign in as Demo Profile (Aman)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
