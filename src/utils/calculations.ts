/**
 * FitBudget Pure Calculation Engine
 * Separated from UI for unit testability, accuracy, and clear estimation disclaimers.
 * Note: These are scientific estimates based on standard clinical formulas (Mifflin-St Jeor),
 * not medical prescriptions.
 */

export interface CalculationInput {
  age: number;
  heightCm: number;
  weightKg: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  goal: 'maintain_weight' | 'lose_weight' | 'gain_weight' | 'improve_general_fitness';
  budgetFrequency: 'daily' | 'weekly' | 'monthly';
  budgetAmount: number;
}

export interface CalculationResult {
  bmi: number;
  bmiCategory: string;
  bmiHealthTip: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  dailyBudget: number;
  weeklyBudget: number;
  monthlyBudget: number;
  calorieAdjustmentNote: string;
  proteinRatioNote: string;
  explanation: {
    bmrFormula: string;
    activityMultiplier: number;
    activityDescription: string;
    goalStrategy: string;
    macroDistribution: string;
  };
}

/**
 * Calculates BMI (Body Mass Index)
 */
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string; tip: string } {
  if (heightCm <= 0 || weightKg <= 0) return { bmi: 0, category: 'Invalid input', tip: '' };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  let tip = 'Your BMI is in a healthy range. Focus on nutrient balance and strength.';

  if (bmi < 18.5) {
    category = 'Underweight (< 18.5)';
    tip = 'Consider a gentle caloric surplus with nutrient-dense, protein-rich foods to build healthy muscle.';
  } else if (bmi <= 24.9) {
    category = 'Normal weight (18.5 – 24.9)';
    tip = 'Healthy baseline. Focus on regular exercise, wholesome food, and progressive fitness.';
  } else if (bmi <= 29.9) {
    category = 'Overweight (25.0 – 29.9)';
    tip = 'A gradual, sustainable caloric deficit paired with daily movement will improve wellness.';
  } else {
    category = 'Obesity range (≥ 30.0)';
    tip = 'Prioritize gradual lifestyle improvements and consult a qualified physician or dietitian.';
  }

  return { bmi, category, tip };
}

/**
 * Calculates BMR using the Mifflin-St Jeor formula
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender?: string): number {
  // Mifflin-St Jeor equation
  let base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    base += 5;
  } else if (gender === 'female') {
    base -= 161;
  } else {
    // Average of male (+5) and female (-161) is -78
    base -= 78;
  }
  return Math.round(Math.max(800, base));
}

/**
 * Activity multipliers
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: { multiplier: 1.2, name: 'Sedentary (desk job, little to no exercise)' },
  lightly_active: { multiplier: 1.375, name: 'Lightly Active (light exercise 1–3 days/week)' },
  moderately_active: { multiplier: 1.55, name: 'Moderately Active (moderate exercise 3–5 days/week)' },
  very_active: { multiplier: 1.725, name: 'Very Active (hard exercise 6–7 days/week)' },
};

/**
 * Full fitness & nutrition calculator with safe boundaries
 */
export function calculatePersonalizedPlan(input: CalculationInput): CalculationResult {
  const { bmi, category: bmiCategory, tip: bmiHealthTip } = calculateBMI(input.weightKg, input.heightCm);
  const bmr = calculateBMR(input.weightKg, input.heightCm, input.age, input.gender);

  const act = ACTIVITY_MULTIPLIERS[input.activityLevel] || ACTIVITY_MULTIPLIERS.moderately_active;
  const tdee = Math.round(bmr * act.multiplier);

  // Target calories with safety guardrails (never extreme deficit/surplus)
  let targetCalories = tdee;
  let calorieAdjustmentNote = 'Maintenance calories: estimated energy in matches energy out.';
  let goalStrategy = 'Sustaining body weight while refining body composition.';

  if (input.goal === 'lose_weight') {
    // Safe moderate deficit: ~15-20% deficit, max 500 kcal
    const deficit = Math.min(500, Math.max(300, Math.round(tdee * 0.18)));
    targetCalories = Math.max(1250, tdee - deficit);
    calorieAdjustmentNote = `Moderate safe deficit (-${deficit} kcal/day) for sustainable fat loss without muscle depletion.`;
    goalStrategy = 'Gentle deficit prioritizing satiety and lean tissue retention.';
  } else if (input.goal === 'gain_weight') {
    // Safe moderate surplus: ~300-400 kcal
    const surplus = 350;
    targetCalories = tdee + surplus;
    calorieAdjustmentNote = `Moderate surplus (+${surplus} kcal/day) to support progressive muscle growth without excessive fat gain.`;
    goalStrategy = 'Caloric surplus with protein emphasis to fuel recovery.';
  } else if (input.goal === 'improve_general_fitness') {
    // Maintenance or slight recomposition (-100 kcal)
    targetCalories = Math.round(tdee * 0.96);
    calorieAdjustmentNote = 'Near-maintenance calories tailored for active energy, stamina, and metabolic health.';
    goalStrategy = 'Balanced energy balance supporting steady physical progression.';
  }

  // Target Protein (grams per kg of bodyweight)
  // Non-extreme, evidence-based:
  // Lose weight: 1.7 - 2.0 g/kg (preserves lean mass in deficit)
  // Gain weight: 1.6 - 1.8 g/kg
  // General fitness / maintenance: 1.3 - 1.6 g/kg
  let proteinPerKg = 1.4;
  if (input.goal === 'lose_weight') {
    proteinPerKg = 1.8;
  } else if (input.goal === 'gain_weight') {
    proteinPerKg = 1.7;
  } else {
    proteinPerKg = 1.4;
  }

  // Cap protein safely to prevent excessive strain: between 60g and 180g
  const targetProteinGrams = Math.round(Math.min(180, Math.max(55, input.weightKg * proteinPerKg)));
  const proteinRatioNote = `Estimated at ${proteinPerKg}g per kg of body weight (${targetProteinGrams}g total).`;

  // Fat target: ~25% of total calories (9 kcal/g)
  const targetFatCalories = targetCalories * 0.25;
  const targetFatGrams = Math.round(targetFatCalories / 9);

  // Carbs target: Remaining calories (4 kcal/g)
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - (targetProteinGrams * 4 + targetFatGrams * 9));
  const targetCarbsGrams = Math.round(remainingCaloriesForCarbs / 4);

  // Budget conversions
  let dailyBudget = input.budgetAmount;
  let weeklyBudget = input.budgetAmount * 7;
  let monthlyBudget = input.budgetAmount * 30;

  if (input.budgetFrequency === 'weekly') {
    dailyBudget = Math.round(input.budgetAmount / 7);
    weeklyBudget = input.budgetAmount;
    monthlyBudget = Math.round((input.budgetAmount / 7) * 30);
  } else if (input.budgetFrequency === 'monthly') {
    dailyBudget = Math.round(input.budgetAmount / 30);
    weeklyBudget = Math.round((input.budgetAmount / 30) * 7);
    monthlyBudget = input.budgetAmount;
  }

  return {
    bmi,
    bmiCategory,
    bmiHealthTip,
    bmr,
    tdee,
    targetCalories,
    targetProteinGrams,
    targetCarbsGrams,
    targetFatGrams,
    dailyBudget,
    weeklyBudget,
    monthlyBudget,
    calorieAdjustmentNote,
    proteinRatioNote,
    explanation: {
      bmrFormula: 'Mifflin-St Jeor formula (10 × wt + 6.25 × ht - 5 × age + gender offset)',
      activityMultiplier: act.multiplier,
      activityDescription: act.name,
      goalStrategy,
      macroDistribution: `Protein: ~${Math.round((targetProteinGrams * 400) / targetCalories)}%, Fats: ~25%, Carbs: ~${Math.round((targetCarbsGrams * 400) / targetCalories)}%`,
    },
  };
}
