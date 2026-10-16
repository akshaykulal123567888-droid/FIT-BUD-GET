import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  Check,
  Scale,
  Target,
  Utensils,
  Wallet,
  Clock,
  Dumbbell,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../../server/db';
import { calculatePersonalizedPlan } from '../utils/calculations';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, user, regenerateAllPlans, currency, initialBudget } = useApp();

  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showHowCalculated, setShowHowCalculated] = useState<boolean>(false);

  // Profile Identity
  const [userName, setUserName] = useState<string>(
    user?.name && !user.isDemo ? user.name : ''
  );
  const [userEmail, setUserEmail] = useState<string>(
    user?.email && !user.isDemo ? user.email : ''
  );

  // Form State initialized with user profile or defaults
  const [age, setAge] = useState<number>(user?.profile?.age || 20);
  const [heightCm, setHeightCm] = useState<number>(user?.profile?.heightCm || 170);
  const [weightKg, setWeightKg] = useState<number>(user?.profile?.weightKg || 65);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>(
    user?.profile?.gender || 'male'
  );
  const [activityLevel, setActivityLevel] = useState<
    'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
  >(user?.profile?.activityLevel || 'moderately_active');

  const [goal, setGoal] = useState<
    'maintain_weight' | 'lose_weight' | 'gain_weight' | 'improve_general_fitness'
  >(user?.profile?.goal || 'improve_general_fitness');

  const [foodPreference, setFoodPreference] = useState<
    'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian'
  >(user?.profile?.foodPreference || 'vegetarian');
  const [allergies, setAllergies] = useState<string[]>(user?.profile?.allergies || []);
  const [customAllergy, setCustomAllergy] = useState<string>('');

  const [budgetFrequency, setBudgetFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    user?.profile?.budgetFrequency || initialBudget?.frequency || 'daily'
  );
  const [budgetAmount, setBudgetAmount] = useState<number>(
    user?.profile?.budgetAmount || initialBudget?.amount || 150
  );

  React.useEffect(() => {
    if (initialBudget && (!user || !user.profile)) {
      setBudgetAmount(initialBudget.amount);
      setBudgetFrequency(initialBudget.frequency);
    }
  }, [initialBudget, isOnboardingOpen]);

  const [wakeTime, setWakeTime] = useState<string>(user?.profile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState<string>(user?.profile?.sleepTime || '22:30');
  const [workStartTime, setWorkStartTime] = useState<string>(user?.profile?.workStartTime || '09:00');
  const [workEndTime, setWorkEndTime] = useState<string>(user?.profile?.workEndTime || '17:00');
  const [workoutDurationMinutes, setWorkoutDurationMinutes] = useState<number>(
    user?.profile?.workoutDurationMinutes || 45
  );
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState<
    'morning' | 'afternoon' | 'evening' | 'night'
  >(user?.profile?.preferredWorkoutTime || 'evening');

  const [equipment, setEquipment] = useState<
    'full_gym' | 'dumbbells' | 'resistance_bands' | 'home_no_equipment'
  >(user?.profile?.equipment || 'home_no_equipment');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>(
    user?.profile?.experience || 'beginner'
  );
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState<number>(
    user?.profile?.workoutDaysPerWeek || 4
  );

  if (!isOnboardingOpen) return null;

  const calc = calculatePersonalizedPlan({
    age,
    heightCm,
    weightKg,
    gender,
    activityLevel,
    goal,
    budgetFrequency,
    budgetAmount,
  });

  const allergyOptions = ['Milk', 'Peanuts', 'Eggs', 'Gluten', 'Soy', 'Seafood'];

  const toggleAllergy = (allergen: string) => {
    setAllergies((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies((prev) => [...prev, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const handleFinish = async () => {
    setIsGenerating(true);
    try {
      const profile: UserProfile = {
        age,
        heightCm,
        weightKg,
        gender,
        activityLevel,
        goal,
        foodPreference,
        allergies,
        budgetFrequency,
        budgetAmount,
        currency,
        wakeTime,
        sleepTime,
        workStartTime,
        workEndTime,
        workoutDurationMinutes,
        preferredWorkoutTime,
        equipment,
        experience,
        workoutDaysPerWeek,
      };

      await regenerateAllPlans(profile, userName.trim() || undefined, userEmail.trim() || undefined);
      setIsOnboardingOpen(false);
    } catch (err) {
      console.error('Error generating plans:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className="relative w-full max-w-2xl bg-[#0d1736] rounded-3xl shadow-2xl border border-[#1b2b54] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a1329] border-b border-[#1b2b54] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                Step {step} of 7
              </span>
              <h3 className="font-extrabold text-base leading-tight text-white">
                {step === 1 && 'Basic Body Information'}
                {step === 2 && 'Your Primary Fitness Goal'}
                {step === 3 && 'Diet Pattern & Allergies'}
                {step === 4 && 'Food Budget Target'}
                {step === 5 && 'Daily Lifestyle & Hours'}
                {step === 6 && 'Workout Equipment & Split'}
                {step === 7 && 'Your Personalized FitBudget Plan'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {step === 1 && 'Calculates baseline BMR and energy requirements.'}
              {step === 2 && 'Sets sustainable calorie targets without extreme restrictions.'}
              {step === 3 && 'Tailors food items to what you enjoy and excludes allergens.'}
              {step === 4 && 'Selects low-cost superfood meals to stay within this limit.'}
              {step === 5 && 'Harmonizes meals and training with work and sleep.'}
              {step === 6 && 'Customized exercises matching your available equipment.'}
              {step === 7 && 'Review your scientific baseline calculations.'}
            </p>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#0e1a3a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#16254c] h-1.5">
          <div
            className="bg-blue-600 h-1.5 transition-all duration-300 shadow-sm shadow-blue-600/50"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm text-slate-300">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Starting Budget Indicator */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-950/40 border border-blue-900/60 text-xs">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">
                    Food Budget Selected: <strong className="text-emerald-400">{currency}{budgetAmount}/{budgetFrequency}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold bg-[#070d1e] px-2 py-0.5 rounded border border-[#1b2b54]">
                  Customizable in Step 4
                </span>
              </div>

              {/* User Profile Account Info */}
              <div className="p-3.5 bg-[#070d1e]/80 rounded-2xl border border-[#1b2b54] space-y-3">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                  Your Profile Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Name <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a1329] border border-[#1b2b54] rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-slate-500 text-[10px]">(to save progress)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a1329] border border-[#1b2b54] rounded-xl focus:ring-2 focus:ring-blue-500 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age (years)</label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10) || 20)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender (optional)</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="100"
                      max="240"
                      value={heightCm}
                      onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 170)}
                      className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-white pr-10 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">cm</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">~{Math.floor(heightCm / 30.48)}' {Math.round((heightCm % 30.48) / 2.54)}"</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="30"
                      max="250"
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value) || 65)}
                      className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-white pr-10 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">kg</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">~{Math.round(weightKg * 2.20462)} lbs</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Daily Activity Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'sedentary', title: 'Sedentary', desc: 'Desk job, little to no regular exercise' },
                    { id: 'lightly_active', title: 'Lightly Active', desc: 'Light exercise / walks 1–3 days/week' },
                    { id: 'moderately_active', title: 'Moderately Active', desc: 'Moderate workouts 3–5 days/week' },
                    { id: 'very_active', title: 'Very Active', desc: 'Hard training / sports 6–7 days/week' },
                  ].map((act) => (
                    <button
                      type="button"
                      key={act.id}
                      onClick={() => setActivityLevel(act.id as any)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        activityLevel === act.id
                          ? 'border-blue-500 bg-blue-950/40 text-white font-bold ring-1 ring-blue-500/40'
                          : 'border-[#1b2b54] bg-[#070d1e]/80 hover:bg-[#0e1a3a] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{act.title}</span>
                        {activityLevel === act.id && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goal */}
          {step === 2 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">What is your primary fitness goal?</label>
              {[
                {
                  id: 'improve_general_fitness',
                  title: 'Improve General Fitness & Energy',
                  desc: 'Stay fit, build stamina, establish wholesome eating habits without extreme dieting.',
                  icon: '⚡',
                },
                {
                  id: 'lose_weight',
                  title: 'Sustainable Fat Loss',
                  desc: 'Moderate -350 kcal deficit with high protein to preserve muscle and curb hunger safely.',
                  icon: '🎯',
                },
                {
                  id: 'gain_weight',
                  title: 'Build Muscle & Healthy Weight Gain',
                  desc: 'Clean +350 kcal surplus fueled by whole grains, protein superfoods, and steady lifting.',
                  icon: '💪',
                },
                {
                  id: 'maintain_weight',
                  title: 'Maintain Weight & Vitality',
                  desc: 'Balanced caloric maintenance for optimal body composition and daily wellness.',
                  icon: '⚖️',
                },
              ].map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGoal(g.id as any)}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                    goal === g.id
                      ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/40'
                      : 'border-[#1b2b54] bg-[#070d1e]/80 hover:bg-[#0e1a3a]'
                  }`}
                >
                  <span className="text-2xl mt-0.5">{g.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm">{g.title}</span>
                      {goal === g.id && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{g.desc}</p>
                  </div>
                </button>
              ))}

              <div className="p-3 bg-[#070d1e] rounded-xl border border-[#1b2b54] text-xs text-slate-400 flex items-center gap-2 mt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>FitBudget enforces safe health guidelines: Never extreme deficits or crash restrictions.</span>
              </div>
            </div>
          )}

          {/* STEP 3: Food Preferences & Allergies */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Dietary Pattern</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'vegetarian', title: 'Vegetarian', desc: 'Plant foods, dairy, grains & pulses (no meat/eggs)' },
                    { id: 'eggetarian', title: 'Eggetarian', desc: 'Vegetarian + Eggs (high protein & cost-effective)' },
                    { id: 'non_vegetarian', title: 'Non-Vegetarian', desc: 'Chicken, fish, eggs, dairy, grains & pulses' },
                    { id: 'vegan', title: '100% Vegan', desc: 'Strictly plant-based (no dairy, eggs, or meat)' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setFoodPreference(p.id as any)}
                      className={`p-3 rounded-xl border text-left transition ${
                        foodPreference === p.id
                          ? 'border-blue-500 bg-blue-950/40 text-white font-bold ring-1 ring-blue-500/40'
                          : 'border-[#1b2b54] bg-[#070d1e]/80 hover:bg-[#0e1a3a] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.title}</span>
                        {foodPreference === p.id && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Food Allergies / Intolerances</label>
                <div className="flex flex-wrap gap-2">
                  {allergyOptions.map((a) => {
                    const isSelected = allergies.includes(a);
                    return (
                      <button
                        type="button"
                        key={a}
                        onClick={() => toggleAllergy(a)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                            : 'border-[#1b2b54] bg-[#070d1e]/80 text-slate-400 hover:bg-[#0e1a3a]'
                        }`}
                      >
                        {isSelected ? `✕ ${a}` : `+ ${a}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Food Exclusion</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    placeholder="e.g. Mustard, Mushrooms, Shellfish..."
                    className="flex-1 px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomAllergy();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomAllergy}
                    className="px-4 py-2 bg-[#0e1a3a] hover:bg-[#16254c] text-white rounded-xl text-xs font-bold border border-[#1b2b54]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Budget */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  How much can you spend on food?
                </label>
                <div className="inline-flex p-1 bg-[#070d1e] rounded-xl border border-[#1b2b54] mb-3">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <button
                      type="button"
                      key={freq}
                      onClick={() => setBudgetFrequency(freq)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition ${
                        budgetFrequency === freq ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400'
                      }`}
                    >
                      {freq} Budget
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Popular daily budget benchmarks:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 150, 200, 300].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => {
                        setBudgetFrequency('daily');
                        setBudgetAmount(preset);
                      }}
                      className={`py-2 px-3 rounded-xl border text-center transition ${
                        budgetFrequency === 'daily' && budgetAmount === preset
                          ? 'bg-blue-600 text-white border-blue-400 font-black shadow-md shadow-blue-600/30'
                          : 'border-[#1b2b54] bg-[#070d1e] hover:bg-[#0e1a3a] text-slate-300 font-bold'
                      }`}
                    >
                      {currency}{preset}/day
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom {budgetFrequency} amount:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-blue-400 font-bold">{currency}</span>
                  <input
                    type="number"
                    min="30"
                    max="100000"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-8 pr-4 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-950/30 rounded-2xl border border-blue-900/60 space-y-2">
                <span className="text-xs font-bold text-blue-300">Equivalent Budget Breakdown:</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-[#070d1e] rounded-xl border border-[#1b2b54]">
                    <span className="text-[10px] text-slate-500 block">Daily</span>
                    <span className="font-extrabold text-blue-400 text-sm">{currency}{calc.dailyBudget}</span>
                  </div>
                  <div className="p-2.5 bg-[#070d1e] rounded-xl border border-[#1b2b54]">
                    <span className="text-[10px] text-slate-500 block">Weekly</span>
                    <span className="font-extrabold text-white text-sm">{currency}{calc.weeklyBudget}</span>
                  </div>
                  <div className="p-2.5 bg-[#070d1e] rounded-xl border border-[#1b2b54]">
                    <span className="text-[10px] text-slate-500 block">Monthly</span>
                    <span className="font-extrabold text-white text-sm">{currency}{calc.monthlyBudget}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Lifestyle */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Wake-up Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sleep Time</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work / College Start</label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work / College End</label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Preferred Workout Time</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'morning', label: 'Morning', icon: '🌅' },
                    { id: 'afternoon', label: 'Afternoon', icon: '☀️' },
                    { id: 'evening', label: 'Evening', icon: '🌆' },
                    { id: 'night', label: 'Night', icon: '🌙' },
                  ].map((w) => (
                    <button
                      type="button"
                      key={w.id}
                      onClick={() => setPreferredWorkoutTime(w.id as any)}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        preferredWorkoutTime === w.id
                          ? 'bg-blue-600 text-white border-blue-400 font-extrabold shadow-md shadow-blue-600/30'
                          : 'border-[#1b2b54] bg-[#070d1e] hover:bg-[#0e1a3a] text-slate-300'
                      }`}
                    >
                      <span className="text-xl">{w.icon}</span>
                      <span className="text-xs font-bold">{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Available Workout Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => setWorkoutDurationMinutes(dur)}
                      className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition ${
                        workoutDurationMinutes === dur
                          ? 'bg-blue-600 text-white border-blue-400 font-black shadow-md shadow-blue-600/30'
                          : 'border-[#1b2b54] bg-[#070d1e] hover:bg-[#0e1a3a] text-slate-300'
                      }`}
                    >
                      {dur} Minutes
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Workout Setup */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Available Equipment</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'home_no_equipment', title: 'Home / No Equipment', desc: 'Bodyweight calisthenics, pushups, squats & core' },
                    { id: 'dumbbells', title: 'Pair of Dumbbells', desc: 'Adjustable or fixed dumbbells at home' },
                    { id: 'resistance_bands', title: 'Resistance Bands', desc: 'Loop & tube bands for tension workouts' },
                    { id: 'full_gym', title: 'Full Commercial Gym', desc: 'Barbells, cables, machines, and racks' },
                  ].map((eq) => (
                    <button
                      type="button"
                      key={eq.id}
                      onClick={() => setEquipment(eq.id as any)}
                      className={`p-3 rounded-xl border text-left transition ${
                        equipment === eq.id
                          ? 'border-blue-500 bg-blue-950/40 text-white font-bold ring-1 ring-blue-500/40'
                          : 'border-[#1b2b54] bg-[#070d1e]/80 hover:bg-[#0e1a3a] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{eq.title}</span>
                        {equipment === eq.id && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{eq.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'beginner', title: 'Beginner', desc: '0–6 months' },
                    { id: 'intermediate', title: 'Intermediate', desc: '6–24 months' },
                    { id: 'advanced', title: 'Advanced', desc: '2+ years' },
                  ].map((exp) => (
                    <button
                      type="button"
                      key={exp.id}
                      onClick={() => setExperience(exp.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        experience === exp.id
                          ? 'bg-blue-600 text-white border-blue-400 font-black shadow-md shadow-blue-600/30'
                          : 'border-[#1b2b54] bg-[#070d1e] hover:bg-[#0e1a3a] text-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold block">{exp.title}</span>
                      <span className="text-[10px]">{exp.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Workout Days Per Week ({workoutDaysPerWeek} days)
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={workoutDaysPerWeek}
                  onChange={(e) => setWorkoutDaysPerWeek(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>2 Days (Busy)</span>
                  <span>3–4 Days (Balanced)</span>
                  <span>5–6 Days (Dedicated)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Personalized Calculations Result */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0a1329] rounded-2xl border border-[#1b2b54] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Profile Account</span>
                  <span className="font-extrabold text-white text-sm">{userName || 'Athlete'}</span>
                  {userEmail && <span className="text-[11px] text-slate-400 block">{userEmail}</span>}
                </div>
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold">
                  Personal Plan Ready
                </span>
              </div>

              <div className="p-3.5 bg-blue-950/40 rounded-2xl border border-blue-900/80 text-blue-300 text-xs">
                <span className="font-bold">Calculated Baseline Metrics:</span> Here is your scientifically estimated blueprint ready to be generated into daily meals, workouts & routine.
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#070d1e] rounded-2xl border border-[#1b2b54]">
                  <span className="text-[11px] text-slate-400 block font-semibold">Body Mass Index</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-white">{calc.bmi}</span>
                    <span className="text-[10px] text-slate-500 font-bold">BMI</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">{calc.bmiCategory}</span>
                </div>

                <div className="p-3.5 bg-[#070d1e] rounded-2xl border border-[#1b2b54]">
                  <span className="text-[11px] text-slate-400 block font-semibold">Estimated BMR</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-white">{calc.bmr}</span>
                    <span className="text-[10px] text-slate-500">kcal/day</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Base resting energy</span>
                </div>

                <div className="p-3.5 bg-[#070d1e] rounded-2xl border border-[#1b2b54]">
                  <span className="text-[11px] text-slate-400 block font-semibold">Est. Daily Energy (TDEE)</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-white">{calc.tdee}</span>
                    <span className="text-[10px] text-slate-500">kcal/day</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">With daily activity</span>
                </div>

                <div className="p-3.5 bg-[#0a1329] rounded-2xl border border-blue-900/60">
                  <span className="text-[11px] text-blue-400 font-bold block">Target Calories</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white">{calc.targetCalories}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">kcal</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">{calc.calorieAdjustmentNote}</span>
                </div>

                <div className="p-3.5 bg-[#0a1329] rounded-2xl border border-blue-900/60">
                  <span className="text-[11px] text-blue-400 font-bold block">Target Protein</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white">{calc.targetProteinGrams}g</span>
                    <span className="text-[10px] text-blue-400 font-semibold">/day</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">{calc.proteinRatioNote}</span>
                </div>

                <div className="p-3.5 bg-[#0a1329] rounded-2xl border border-amber-900/60">
                  <span className="text-[11px] text-amber-400 font-bold block">Daily Food Budget</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white">{currency}{calc.dailyBudget}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">/day</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Superfood budget diet</span>
                </div>
              </div>

              {/* How was this calculated toggle */}
              <div className="border border-[#1b2b54] rounded-2xl overflow-hidden bg-[#070d1e]">
                <button
                  type="button"
                  onClick={() => setShowHowCalculated(!showHowCalculated)}
                  className="w-full px-4 py-2.5 text-left flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span>How was this calculated? (Formulas & Assumptions)</span>
                  </span>
                  <span>{showHowCalculated ? '▲' : '▼'}</span>
                </button>
                {showHowCalculated && (
                  <div className="p-4 bg-[#0a1329] text-xs text-slate-400 space-y-2 border-t border-[#1b2b54] leading-relaxed">
                    <p><strong>BMR Formula:</strong> {calc.explanation.bmrFormula}.</p>
                    <p><strong>Activity Multiplier:</strong> {calc.explanation.activityMultiplier}x for {calc.explanation.activityDescription}.</p>
                    <p><strong>Goal Strategy:</strong> {calc.explanation.goalStrategy}</p>
                    <p><strong>Macronutrient Ratio:</strong> {calc.explanation.macroDistribution}.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 bg-[#0a1329] border-t border-[#1b2b54] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-[#0e1a3a] transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black rounded-xl text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Diet, Workout & Routine...' : 'Generate Plan & Open Dashboard'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
