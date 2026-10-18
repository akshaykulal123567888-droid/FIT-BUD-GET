import React, { useState } from 'react';
import {
  Dumbbell,
  Flame,
  Wallet,
  UtensilsCrossed,
  Camera,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  Target,
  LineChart,
  Droplets,
  Plus,
  RotateCcw,
  ChevronRight,
  Apple,
  Scale,
  Salad,
  Activity,
  Award,
  TrendingUp,
  Check,
  Star,
  Layers,
  Code,
  Bot,
  User,
  Sliders,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../assets/images';
import { EditBudgetModal } from '../components/EditBudgetModal';
import { SpotlightHero } from '../components/SpotlightHero';

export const HomePage: React.FC = () => {
  const {
    user,
    todayLog,
    saveTodayLog,
    setActiveTab,
    setIsCheckInModalOpen,
    setIsAnalyzeFoodModalOpen,
    setIsOnboardingOpen,
    setIsSlidesModalOpen,
    currency,
  } = useApp();

  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Interactive Protein Calculator state
  const [calcWeight, setCalcWeight] = useState<number>(user?.profile?.weightKg || 70);
  const [calcGoal, setCalcGoal] = useState<'lose_weight' | 'maintain_weight' | 'gain_weight'>(
    (user?.profile?.goal as 'lose_weight' | 'maintain_weight' | 'gain_weight') || 'lose_weight'
  );

  // Interactive Budget Simulator state
  const [simulatedBudget, setSimulatedBudget] = useState<number>(100);

  // FAQ Accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Metrics from current profile
  const profile = user?.profile;
  const metrics = profile?.calculatedMetrics;

  const targetCal = metrics?.targetCalories || 2150;
  const targetProt = metrics?.targetProteinGrams || 135;
  const dailyBudget = metrics?.targetDailyBudget || profile?.budgetAmount || 150;

  const calConsumed = todayLog.caloriesConsumed || 0;
  const protConsumed = todayLog.proteinConsumed || 0;
  const foodSpent = todayLog.foodSpent || 0;
  const waterMl = todayLog.waterIntakeMl || 0;

  const calPercent = Math.min(100, Math.round((calConsumed / targetCal) * 100));
  const protPercent = Math.min(100, Math.round((protConsumed / targetProt) * 100));
  const budgetPercent = Math.min(100, Math.round((foodSpent / dailyBudget) * 100));
  const waterTargetMl = 2500;
  const waterPercent = Math.min(100, Math.round((waterMl / waterTargetMl) * 100));

  const handleAddWater = async (amount: number) => {
    await saveTodayLog({ waterIntakeMl: Math.max(0, waterMl + amount) });
  };

  const handleToggleWorkout = async () => {
    await saveTodayLog({ workoutCompleted: !todayLog.workoutCompleted });
  };

  // Protein calculator logic based on bodyweight and fitness goal
  const proteinMultiplier =
    calcGoal === 'lose_weight' ? 2.0 : calcGoal === 'gain_weight' ? 1.8 : 1.6;

  const calculatedProteinTarget = Math.round(calcWeight * proteinMultiplier);
  const calculatedCalorieTarget = Math.round(
    calcGoal === 'lose_weight'
      ? calcWeight * 28
      : calcGoal === 'gain_weight'
      ? calcWeight * 36
      : calcWeight * 32
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setWaitlistSuccess(true);
    setTimeout(() => {
      setIsOnboardingOpen(true);
    }, 600);
  };

  // Budget Tier Simulation Meal Map
  const getBudgetTierDetails = (amount: number) => {
    if (amount <= 80) {
      return {
        tier: 'Frugal Muscle Tier',
        proteinEstimate: '85g – 95g Protein',
        sampleMeals: [
          'Poha with Roasted Peanuts (₹8)',
          'Sautéed Soya Chunks 40g (₹5 / 21g protein)',
          '2 Rotis + Yellow Moong Dal + Curd (₹16)',
          'Steamed Rice + Rajma Curry + Greens (₹19)',
        ],
        keyStaples: 'Soya Chunks, Moong Dal, Whole Wheat, Peanuts, Curd',
      };
    } else if (amount <= 130) {
      return {
        tier: 'Standard Athlete Tier (Recommended)',
        proteinEstimate: '110g – 130g Protein',
        sampleMeals: [
          '2 Whole Eggs + 2 Rotis + Banana (₹21)',
          'Roasted Bhuna Chana + Sprouted Moong (₹11)',
          '2 Rotis + Chana Dal + Steamed Rice + Curd + Salad (₹24)',
          'Soya Chunks Evening Snack (₹5 / 21g protein)',
          'Steamed Rice + Homestyle Rajma + Seasonal Sabzi (₹19)',
        ],
        keyStaples: 'Eggs, Soya Chunks, Whole Milk, Moong Dal, Curd, Bananas',
      };
    } else {
      return {
        tier: 'High-Performance Tier',
        proteinEstimate: '140g – 165g Protein',
        sampleMeals: [
          'Rolled Oats with Milk + Banana + 2 Eggs (₹33)',
          'Raw Almonds + Local Guava (₹27)',
          'Homestyle Chicken Curry / Fresh Paneer + Rotis + Salad (₹42)',
          '3 Boiled Egg Whites / Soya Chunks (₹19)',
          'Pan-seared Fresh Fish / Rajma + Steamed Rice + Sabzi (₹36)',
        ],
        keyStaples: 'Chicken Breast, Fresh Fish, Paneer, Oats, Eggs, Almonds',
      };
    }
  };

  const tierInfo = getBudgetTierDetails(simulatedBudget);

  const faqs = [
    {
      q: 'How does FitBudget guarantee staying under my food budget?',
      a: 'Unlike generic fitness apps that recommend expensive salmon or imported supplements, FitBudget calculates portion prices down to the exact gram using current Indian retail and Mandi benchmark rates. If your target is ₹100/day, the algorithm automatically prioritizes maximum protein-per-rupee staples like soya chunks (21g protein for ₹5), whole eggs, yellow moong dal, curd, and whole wheat rotis so your 5 daily meals strictly total ≤ ₹100.',
    },
    {
      q: 'Can I customize my diet if I am vegetarian, eggetarian, or vegan?',
      a: 'Yes. FitBudget supports strict Vegetarian, Eggetarian, Non-Vegetarian, and Vegan preferences, plus full allergen filtering for gluten, dairy, nuts, and soy. Every meal plan is tailored specifically to your dietary boundaries.',
    },
    {
      q: 'How does the AI Food Scanner work?',
      a: 'You can snap a photo of any restaurant dish or home-cooked meal. FitBudget uses advanced multimodal vision AI to detect ingredients, estimate portion weights in grams, and reconcile caloric and macronutrient values against verified nutritional databases in seconds.',
    },
    {
      q: 'Is FitBudget completely free?',
      a: 'The core personalized diet planning, calorie/protein calculation, workout generation, routine scheduling, and daily progress logging are 100% free forever. No credit card required.',
    },
  ];

  return (
    <div className="min-h-screen bg-black tracking-[-0.02em] text-white font-inter selection-red pb-20">
      {/* ========================================================================= */}
      {/* 1. SIGNATURE FULL-SCREEN SPOTLIGHT HERO SECTION                            */}
      {/* ========================================================================= */}
      <SpotlightHero />

      {/* ========================================================================= */}
      {/* 2. EXPLORE DASHBOARD & LIVE TELEMETRY                                      */}
      {/* ========================================================================= */}
      <div id="explore-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-36 pt-12 sm:pt-20">
        {/* Scientific Standards Strip */}
        <div className="w-full border-y border-white/5 bg-white/[0.015] py-5 px-6 rounded-2xl text-zinc-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8bea3b]">
              Verified Scientific Standards:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-zinc-400">
              <span className="hover:text-white transition">ICMR-NIN Food Composition Database</span>
              <span className="text-zinc-700">·</span>
              <span className="hover:text-white transition">USDA FoodData Central</span>
              <span className="text-zinc-700">·</span>
              <span className="hover:text-white transition">Mifflin-St Jeor Metabolic BMR</span>
              <span className="text-zinc-700">·</span>
              <span className="hover:text-white transition">Agmarknet Mandi Price Feeds</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Telemetry Preview Bar / Goal Simulator */}
        <div className="w-full max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 bg-[#0a1511]/85 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8bea3b]/10 border border-[#8bea3b]/25 text-[#8bea3b] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-manrope">Live Goal Simulator</h3>
                <p className="text-xs text-zinc-400">See your exact protein target & calibrated food budget in real-time</p>
              </div>
            </div>

            {/* Goal Selector Segment */}
            <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10 self-start sm:self-auto">
              {(['lose_weight', 'maintain_weight', 'gain_weight'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setCalcGoal(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-manrope ${
                    calcGoal === g
                      ? 'bg-[#8bea3b] text-[#07100d] shadow-md shadow-[#8bea3b]/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {g === 'lose_weight' ? 'Fat Loss' : g === 'gain_weight' ? 'Hypertrophy' : 'Maintain'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
            {/* Slider Column */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Body Weight</span>
                <span className="font-mono font-bold text-white text-sm">
                  {calcWeight} kg ({Math.round(calcWeight * 2.205)} lbs)
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="130"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Number(e.target.value))}
                className="w-full accent-[#8bea3b] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>40 kg</span>
                <span>70 kg</span>
                <span>100 kg</span>
                <span>130 kg</span>
              </div>
            </div>

            {/* Live Metric Badges */}
            <div className="md:col-span-6 grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Protein Target</span>
                <span className="text-xl sm:text-2xl font-black text-[#8bea3b] font-manrope">
                  {calculatedProteinTarget}g
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Lean Mass Fuel</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Daily Energy</span>
                <span className="text-xl sm:text-2xl font-black text-white font-manrope">
                  {calculatedCalorieTarget}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">kcal / day</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Est. Spend</span>
                <span className="text-xl sm:text-2xl font-black text-[#c5ffd8] font-manrope">
                  {currency}{Math.round(calculatedProteinTarget * 0.95)}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">/ day budget</span>
              </div>
            </div>
          </div>
        </div>

      {/* ========================================================================= */}
      {/* 2. TODAY'S TELEMETRY COCKPIT (IF USER HAS LOGGED DATA OR PROFILE)          */}
      {/* ========================================================================= */}
      {user?.profile && (
        <section className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto rounded-3xl p-6 sm:p-10 bg-[#0a1511]/90 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#a4ff78] uppercase tracking-wider font-manrope">
                  <Activity className="w-4 h-4" />
                  <span>Today's Live Adherence</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-manrope text-white tracking-tight mt-1">
                  Daily Intake & Budget Cockpit
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCheckInModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition active:scale-95 flex items-center gap-1.5 font-manrope"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#a4ff78]" />
                  <span>Quick Check-in</span>
                </button>
                <button
                  onClick={() => setActiveTab('diet')}
                  className="px-4 py-2 rounded-xl bg-[#a4ff78] text-[#07100d] text-xs font-bold font-manrope transition active:scale-95 shadow-md shadow-[#a4ff78]/25"
                >
                  Open Diet Plan
                </button>
              </div>
            </div>

            {/* 4 Telemetry Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {/* Calories */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Calories</span>
                  <span className="text-xs font-mono font-bold text-[#a4ff78]">{calPercent}%</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-manrope">{calConsumed}</span>
                  <span className="text-xs text-zinc-500 font-mono">/ {targetCal} kcal</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#69e681] to-[#a4ff78] rounded-full transition-all duration-500"
                    style={{ width: `${calPercent}%` }}
                  />
                </div>
              </div>

              {/* Protein */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Protein</span>
                  <span className="text-xs font-mono font-bold text-[#a4ff78]">{protPercent}%</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-manrope">{protConsumed}g</span>
                  <span className="text-xs text-zinc-500 font-mono">/ {targetProt}g</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#69e681] to-[#a4ff78] rounded-full transition-all duration-500"
                    style={{ width: `${protPercent}%` }}
                  />
                </div>
              </div>

              {/* Grocery Budget */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Daily Food Spend</span>
                  <span className="text-xs font-mono font-bold text-[#c5ffd8]">{budgetPercent}%</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-manrope">{currency}{foodSpent}</span>
                  <span className="text-xs text-zinc-500 font-mono">/ {currency}{dailyBudget}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#a4ff78] to-[#69e681] rounded-full transition-all duration-500"
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
              </div>

              {/* Water Intake Quick Log */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Hydration</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAddWater(250)}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white transition active:scale-95"
                    >
                      +250ml
                    </button>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-manrope">{waterMl} ml</span>
                  <span className="text-xs text-zinc-500 font-mono">/ 2500 ml</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#69e681] rounded-full transition-all duration-500"
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. CORE ARCHITECTURE — 4 SYSTEM PILLARS                                    */}
      {/* ========================================================================= */}
      <section id="features" className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#a4ff78]">The Intelligent Platform</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-manrope">
              Engineered for Complete Body Transformation
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              Replace scattered workout notes, arbitrary dietitians, and complex spreadsheets with an unified system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1: Generative Nutrition Systems */}
            <div
              onClick={() => setActiveTab('diet')}
              className="p-8 sm:p-10 rounded-3xl bg-[#0a1511]/85 border border-white/10 hover:border-[#a4ff78]/40 transition-all cursor-pointer group flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#a4ff78]/10 border border-[#a4ff78]/25 text-[#a4ff78] flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white font-manrope">Generative Diet Systems</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                  Generates full 5-meal daily nutrition protocols calibrated to your exact body weight, fitness goal, and grocery budget. Every egg, bowl of lentils, and portion of rice is mapped to the gram and rupee.
                </p>

                {/* Micro Preview Row */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Breakfast: Rolled Oats with Milk + Banana</span>
                    <span className="font-mono text-[#a4ff78]">14.1g Protein · ₹25</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Evening: Sautéed Soya Chunks (40g)</span>
                    <span className="font-mono text-[#a4ff78]">21.0g Protein · ₹5</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-[#a4ff78] transition">
                <span>EXPLORE DIET PLANNER</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Pillar 2: AI Vision Food Scanner */}
            <div
              onClick={() => setIsAnalyzeFoodModalOpen(true)}
              className="p-8 sm:p-10 rounded-3xl bg-[#0a1511]/85 border border-white/10 hover:border-[#a4ff78]/40 transition-all cursor-pointer group flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#a4ff78]/10 border border-[#a4ff78]/25 text-[#a4ff78] flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white font-manrope">AI Vision Food Scanner</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#a4ff78]/10 text-[#a4ff78] border border-[#a4ff78]/30 text-[10px] font-mono font-bold">
                    LIVE VISION
                  </span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                  Snap a quick photo of any restaurant dish, street food, home-cooked curry, or snack. Our vision engine identifies ingredients, calculates portion weights, and estimates macros in under 3 seconds.
                </p>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Detection Speed</span>
                    <span className="font-mono text-white">~1.8 seconds</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Analysis Output</span>
                    <span className="font-mono text-[#a4ff78]">Calories, Protein, Carbs, Fat</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-[#a4ff78] transition">
                <span>LAUNCH SCANNER MODAL</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Pillar 3: Workout Progression System */}
            <div
              onClick={() => setActiveTab('workout')}
              className="p-8 sm:p-10 rounded-3xl bg-[#0a1511]/85 border border-white/10 hover:border-[#a4ff78]/40 transition-all cursor-pointer group flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#a4ff78]/10 border border-[#a4ff78]/25 text-[#a4ff78] flex items-center justify-center">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white font-manrope">Periodized Workout Splits</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                  Periodized training plans for muscle hypertrophy and strength. Features sets, rep ranges, integrated exercise demonstration videos, and a built-in countdown rest timer.
                </p>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Weekly Structure</span>
                    <span className="font-mono text-[#a4ff78]">Push · Pull · Legs · Rest</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Rest Timer Feedback</span>
                    <span className="font-mono text-white">Visual Circle + Audio Beep</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-[#a4ff78] transition">
                <span>VIEW WORKOUT SYSTEM</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Pillar 4: Daily Routine & Circadian Timing */}
            <div
              onClick={() => setActiveTab('routine')}
              className="p-8 sm:p-10 rounded-3xl bg-[#0a1511]/85 border border-white/10 hover:border-[#a4ff78]/40 transition-all cursor-pointer group flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#a4ff78]/10 border border-[#a4ff78]/25 text-[#a4ff78] flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white font-manrope">Circadian Routine Timeline</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                  Aligns your meals, work focus blocks, hydration intervals, and training window around your natural wake-up and sleep times to maximize metabolic recovery.
                </p>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Wake-Up & Pre-Fuel</span>
                    <span className="font-mono text-[#a4ff78]">07:00 · Morning Light</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Optimal Training Window</span>
                    <span className="font-mono text-white">18:00 · Peak Body Temp</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-[#a4ff78] transition">
                <span>VIEW SCHEDULE BLUEPRINT</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE INDIAN GROCERY BUDGET SIMULATOR                             */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0c1914] via-[#07100d] to-[#0a1511] border border-white/10 shadow-2xl relative">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#a4ff78]">
              Realistic Price Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-manrope text-white tracking-tight">
              Test Any Budget: See Exactly What You Can Eat
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              FitBudget uses real Indian retail prices for atta, rice, dal, milk, eggs, and soya chunks to prove you never have to overspend to meet your protein requirement.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Interactive Slider */}
            <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-bold text-white font-manrope">Set Daily Food Budget Ceiling</span>
                <span className="text-2xl font-black font-manrope text-[#a4ff78]">
                  {currency}{simulatedBudget} <span className="text-xs text-zinc-400 font-normal">/ day</span>
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="10"
                value={simulatedBudget}
                onChange={(e) => setSimulatedBudget(Number(e.target.value))}
                className="w-full accent-[#a4ff78] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500 font-mono">
                <span>₹50/day (Strict Budget)</span>
                <span>₹100/day (Recommended Target)</span>
                <span>₹180/day (High Protein)</span>
                <span>₹250/day (Premium)</span>
              </div>
            </div>

            {/* Generated Plan Breakdown for Selected Amount */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#a4ff78] font-bold block">
                    {tierInfo.tier}
                  </span>
                  <h3 className="text-2xl font-black font-manrope text-white mt-1">
                    {tierInfo.proteinEstimate}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Key economical staples used: <br />
                    <strong className="text-white">{tierInfo.keyStaples}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setIsEditBudgetOpen(true)}
                  className="w-full py-3 rounded-xl bg-[#a4ff78] hover:bg-[#8def5c] text-[#07100d] font-bold text-xs font-manrope transition active:scale-95 shadow-md shadow-[#a4ff78]/25"
                >
                  Apply {currency}{simulatedBudget} to My Account
                </button>
              </div>

              <div className="md:col-span-8 p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-manrope">
                  Sample Full-Day Meal Plan at {currency}{simulatedBudget}/Day:
                </h4>
                <div className="space-y-2">
                  {tierInfo.sampleMeals.map((meal, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs text-zinc-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a4ff78]" />
                        <span>{meal}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">Portion Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRANSPARENT COMPARISON MATRIX                                           */}
      {/* ========================================================================= */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#a4ff78]">Value Proposition</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-manrope">
              How FitBudget Compares
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              Why thousands of fitness enthusiasts switch to algorithmically optimized nutrition.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase text-[11px]">
                  <th className="py-4 px-4 font-normal">Feature / Dimension</th>
                  <th className="py-4 px-4 text-[#a4ff78] font-bold font-manrope text-sm">FitBudget</th>
                  <th className="py-4 px-4 font-normal text-zinc-500">Personal Trainer</th>
                  <th className="py-4 px-4 font-normal text-zinc-500">Generic Calorie Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Monthly Cost</td>
                  <td className="py-4 px-4 font-bold text-[#a4ff78] font-mono">₹0 Free Forever</td>
                  <td className="py-4 px-4 text-zinc-500">₹8,000 – ₹15,000</td>
                  <td className="py-4 px-4 text-zinc-500">₹800 – ₹1,200/mo</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Grocery Budget Control</td>
                  <td className="py-4 px-4 font-bold text-[#a4ff78]">Real portion-cost math</td>
                  <td className="py-4 px-4 text-zinc-500">Ignored</td>
                  <td className="py-4 px-4 text-zinc-500">No budget features</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">AI Vision Food Scanner</td>
                  <td className="py-4 px-4 font-bold text-[#a4ff78]">Multimodal 2s Scanner</td>
                  <td className="py-4 px-4 text-zinc-500">Manual review</td>
                  <td className="py-4 px-4 text-zinc-500">Manual text search</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Indian Food Database</td>
                  <td className="py-4 px-4 font-bold text-[#a4ff78]">Atta, Soya, Dal, Curd, Poha</td>
                  <td className="py-4 px-4 text-zinc-500">Generic advice</td>
                  <td className="py-4 px-4 text-zinc-500">Western biased</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Periodized Workouts</td>
                  <td className="py-4 px-4 font-bold text-[#a4ff78]">Included with Video Guides</td>
                  <td className="py-4 px-4 text-zinc-500">Included</td>
                  <td className="py-4 px-4 text-zinc-500">Paywalled tier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ATHLETE SPOTLIGHT & SOCIAL PROOF                                        */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-3xl p-8 sm:p-14 bg-[#0a1511]/90 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-1 text-[#a4ff78]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-manrope leading-snug">
              "FitBudget transformed how I train and eat. What used to take hours of manual spreadsheets and expensive nutritionists now happens in seconds."
            </h3>
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="w-11 h-11 rounded-full bg-[#a4ff78] text-[#07100d] flex items-center justify-center font-bold text-sm font-manrope">
                MV
              </div>
              <div className="text-left">
                <span className="block font-bold text-sm text-white font-manrope">Marcus Vance</span>
                <span className="block text-xs text-zinc-400">Competitive Athlete & Software Engineer</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION                                                           */}
      {/* ========================================================================= */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#a4ff78]">Frequently Asked</span>
            <h2 className="text-3xl font-black text-white font-manrope">Everything You Need to Know</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0a1511]/70 border border-white/10 overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-manrope font-bold text-sm text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#a4ff78] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 font-light leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. HIGH-CONVERSION CTA FOOTER STRIP                                       */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center p-8 sm:p-14 rounded-3xl bg-[#0a1511]/90 border border-white/10 space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black font-manrope text-white tracking-tight">
            Ready to Build Your Peak Physique?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-light max-w-xl mx-auto">
            Join thousands of lifters eating over 100g protein daily without ever exceeding their budget.
          </p>

          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#a4ff78]"
            />
            <button
              id="waitlist-submit-btn"
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#a4ff78] text-[#07100d] font-bold text-xs font-manrope shadow-md shadow-[#a4ff78]/25 transition active:scale-95"
            >
              {waitlistSuccess ? 'Access Granted ✓' : 'Get Free Plan'}
            </button>
          </form>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. PRODUCT FOOTER                                                         */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#a4ff78] rounded-sm rotate-45 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#07100d] rounded-full -rotate-45" />
              </div>
              <span className="text-xl font-bold font-manrope tracking-tight text-white">
                Fit<span className="text-[#a4ff78]">Budget</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Algorithmic fitness and nutrition engineering designed for realistic budgets, verified retail food pricing, and sustainable physical progress.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#a4ff78] uppercase tracking-wider mb-4 font-manrope">
              Product Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button onClick={() => setActiveTab('diet')} className="hover:text-white transition">
                  Personalized Diet Planner
                </button>
              </li>
              <li>
                <button onClick={() => setIsAnalyzeFoodModalOpen(true)} className="hover:text-white transition">
                  AI Food Vision Scanner
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('workout')} className="hover:text-white transition">
                  Periodized Workout Split
                </button>
              </li>
              <li>
                <button onClick={() => setIsEditBudgetOpen(true)} className="hover:text-white transition">
                  Daily Grocery Budget Optimizer
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsSlidesModalOpen(true)}
                  className="text-[#a4ff78] hover:text-white transition flex items-center gap-1.5 font-bold"
                >
                  <span>Interactive Pitch Deck & Slides</span>
                  <span className="px-1.5 py-0.2 text-[9px] rounded bg-[#a4ff78]/20 text-[#a4ff78] border border-[#a4ff78]/40">12 Slides</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#a4ff78] uppercase tracking-wider mb-4 font-manrope">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button onClick={() => setActiveTab('settings')} className="hover:text-white transition">
                  Profile & Biometrics
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('progress')} className="hover:text-white transition">
                  Analytics & Trends
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('foods')} className="hover:text-white transition">
                  Indian Food Database
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-white transition">
                  Features Overview
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600 font-mono">
          <p>© {new Date().getFullYear()} FitBudget Systems. All rights reserved.</p>
          <div className="flex gap-4 mt-3 sm:mt-0">
            <span>Non-Medical Lifestyle Platform</span>
            <span>·</span>
            <span>Zero Unrealistic Mock Data</span>
          </div>
        </div>
      </footer>

      {/* Explore Dashboard container close */}
      </div>

      {/* Edit Budget Modal */}
      <EditBudgetModal isOpen={isEditBudgetOpen} onClose={() => setIsEditBudgetOpen(false)} />
    </div>
  );
};
