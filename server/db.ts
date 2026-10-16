import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  isDemo?: boolean;
  createdAt: string;
  profile?: UserProfile;
  plan?: UserPlan;
  logs?: DailyLog[];
  customPrices?: Record<string, number>;
  notificationSettings?: NotificationSettings;
}

export interface UserProfile {
  age: number;
  heightCm: number;
  weightKg: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  goal: 'maintain_weight' | 'lose_weight' | 'gain_weight' | 'improve_general_fitness';
  foodPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian';
  allergies: string[];
  budgetFrequency: 'daily' | 'weekly' | 'monthly';
  budgetAmount: number; // in selected currency
  currency: string; // '₹', '$', '€', '£'
  wakeTime: string; // '07:00'
  sleepTime: string; // '22:30'
  workStartTime: string; // '09:00'
  workEndTime: string; // '17:00'
  workoutDurationMinutes: number; // e.g. 45
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening' | 'night';
  equipment: 'full_gym' | 'dumbbells' | 'resistance_bands' | 'home_no_equipment';
  experience: 'beginner' | 'intermediate' | 'advanced';
  workoutDaysPerWeek: number; // 1-7
  // Calculated stats
  calculatedMetrics?: {
    bmi: number;
    bmiCategory: string;
    bmr: number;
    tdee: number;
    targetCalories: number;
    targetProteinGrams: number;
    targetCarbsGrams: number;
    targetFatGrams: number;
    targetDailyBudget: number;
  };
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number; // in INR by default
  dietType: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian';
  allergens: string[];
  cheaperAlternativeId?: string;
  cheaperAlternativeReason?: string;
}

export interface MealItemEntry {
  foodId: string;
  name: string;
  servingSize: string;
  quantity: number; // multiplier of serving
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
}

export interface MealPlan {
  id: string;
  name: 'Breakfast' | 'Mid-Morning Snack' | 'Lunch' | 'Evening Snack' | 'Dinner';
  time: string;
  items: MealItemEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCost: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  restSeconds: number;
  estimatedMinutes: number;
  instructions: string;
  equipmentNeeded: string;
  completed?: boolean;
}

export interface WorkoutDayPlan {
  dayName: string; // 'Monday', 'Tuesday', etc.
  focus: string; // 'Upper Body Strength', 'Full Body Conditioning', 'Rest & Recovery'
  isRestDay: boolean;
  exercises: WorkoutExercise[];
  estimatedTotalMinutes: number;
}

export interface DailyRoutineEvent {
  id: string;
  time: string;
  title: string;
  type: 'wake' | 'meal' | 'work' | 'workout' | 'snack' | 'winddown' | 'sleep';
  description: string;
  completed?: boolean;
}

export interface UserPlan {
  meals: MealPlan[];
  workoutSplit: WorkoutDayPlan[];
  dailyRoutine: DailyRoutineEvent[];
  updatedAt: string;
}

export interface DailyLog {
  date: string; // 'YYYY-MM-DD'
  weightKg?: number;
  energyLevel?: number; // 1 to 5
  mealsCompleted: string[]; // meal ids or names
  workoutCompleted: boolean;
  workoutNotes?: string;
  completedExercises?: { exerciseName: string; setsCompleted: number; repsOrWeight?: string }[];
  waterIntakeMl: number;
  sleepHours?: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  foodSpent: number;
  notes?: string;
  routineEventsCompleted?: string[];
}

export interface NotificationSettings {
  enabled: boolean;
  breakfastReminder: boolean;
  breakfastTime: string;
  lunchReminder: boolean;
  lunchTime: string;
  dinnerReminder: boolean;
  dinnerTime: string;
  snackReminder: boolean;
  workoutReminder: boolean;
  workoutTime: string;
  waterReminder: boolean;
  checkInReminder: boolean;
  checkInTime: string;
  sleepReminder: boolean;
  sleepTime: string;
  weeklyProgress: boolean;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DBStructure {
  users: Record<string, User>;
}

// In-memory cache + file sync
let dbCache: DBStructure = { users: {} };

export function initDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
    } else {
      seedDemoData();
      saveDB();
    }
  } catch (err) {
    console.error('Failed to init DB, using in-memory state:', err);
    seedDemoData();
  }
}

export function saveDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist DB to disk:', err);
  }
}

export function getUsers(): Record<string, User> {
  return dbCache.users;
}

export function getUserById(id: string): User | undefined {
  return dbCache.users[id];
}

export function getUserByEmail(email: string): User | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  return Object.values(dbCache.users).find((u) => u.email.trim().toLowerCase() === clean);
}

export function saveUser(user: User): User {
  dbCache.users[user.id] = user;
  saveDB();
  return user;
}

export function deleteUser(id: string): boolean {
  if (dbCache.users[id]) {
    delete dbCache.users[id];
    saveDB();
    return true;
  }
  return false;
}

function seedDemoData() {
  const demoUserId = 'demo-user-123';
  const today = new Date();

  // Helper for generating recent dates
  const getDateStr = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const demoProfile: UserProfile = {
    age: 20,
    heightCm: 170,
    weightKg: 65,
    gender: 'male',
    activityLevel: 'moderately_active',
    goal: 'improve_general_fitness',
    foodPreference: 'vegetarian',
    allergies: [],
    budgetFrequency: 'daily',
    budgetAmount: 150,
    currency: '₹',
    wakeTime: '07:00',
    sleepTime: '22:30',
    workStartTime: '09:00',
    workEndTime: '17:00',
    workoutDurationMinutes: 45,
    preferredWorkoutTime: 'evening',
    equipment: 'home_no_equipment',
    experience: 'beginner',
    workoutDaysPerWeek: 4,
    calculatedMetrics: {
      bmi: 22.5,
      bmiCategory: 'Normal weight (18.5 - 24.9)',
      bmr: 1612,
      tdee: 2250,
      targetCalories: 2100,
      targetProteinGrams: 85,
      targetCarbsGrams: 280,
      targetFatGrams: 55,
      targetDailyBudget: 150,
    },
  };

  const demoMeals: MealPlan[] = [
    {
      id: 'm1',
      name: 'Breakfast',
      time: '07:30',
      items: [
        { foodId: 'oats-1', name: 'Rolled Oats with Milk', servingSize: '50g oats + 200ml milk', quantity: 1, calories: 310, protein: 13, carbs: 43, fat: 9.5, cost: 20 },
        { foodId: 'banana-1', name: 'Fresh Banana', servingSize: '1 medium (100g)', quantity: 1, calories: 90, protein: 1.1, carbs: 23, fat: 0.3, cost: 5 },
      ],
      totalCalories: 400,
      totalProtein: 14.1,
      totalCarbs: 66,
      totalFat: 9.8,
      totalCost: 25,
    },
    {
      id: 'm2',
      name: 'Mid-Morning Snack',
      time: '10:30',
      items: [
        { foodId: 'roasted-peanuts-1', name: 'Roasted Peanuts', servingSize: '30g', quantity: 1, calories: 170, protein: 7.8, carbs: 5, fat: 14, cost: 5 },
      ],
      totalCalories: 170,
      totalProtein: 7.8,
      totalCarbs: 5,
      totalFat: 14,
      totalCost: 5,
    },
    {
      id: 'm3',
      name: 'Lunch',
      time: '13:00',
      items: [
        { foodId: 'chapati-1', name: 'Whole Wheat Roti', servingSize: '2 rotis (~70g atta)', quantity: 1, calories: 160, protein: 6, carbs: 32, fat: 1.0, cost: 3 },
        { foodId: 'moong-dal-1', name: 'Yellow Moong Dal (Tadka)', servingSize: '1 medium bowl (150g)', quantity: 1, calories: 165, protein: 10.5, carbs: 25, fat: 3.0, cost: 7 },
        { foodId: 'curd-1', name: 'Fresh Plain Curd / Dahi', servingSize: '1 bowl (100g)', quantity: 1, calories: 65, protein: 3.5, carbs: 4.5, fat: 3.2, cost: 6 },
        { foodId: 'white-rice-1', name: 'Steamed White Rice', servingSize: '100g cooked', quantity: 0.75, calories: 130, protein: 2.7, carbs: 29, fat: 0.3, cost: 2 },
        { foodId: 'cucumber-tomato-salad-1', name: 'Cucumber & Tomato Salad', servingSize: '1 bowl', quantity: 1, calories: 35, protein: 1.5, carbs: 7, fat: 0.3, cost: 5 },
      ],
      totalCalories: 555,
      totalProtein: 24.2,
      totalCarbs: 97.5,
      totalFat: 7.8,
      totalCost: 23,
    },
    {
      id: 'm4',
      name: 'Evening Snack',
      time: '17:30',
      items: [
        { foodId: 'soya-chunks-1', name: 'Sautéed Soya Chunks', servingSize: '40g dry (~120g rehydrated)', quantity: 1, calories: 140, protein: 21.0, carbs: 13, fat: 0.4, cost: 5 },
      ],
      totalCalories: 140,
      totalProtein: 21.0,
      totalCarbs: 13,
      totalFat: 0.4,
      totalCost: 5,
    },
    {
      id: 'm5',
      name: 'Dinner',
      time: '20:30',
      items: [
        { foodId: 'white-rice-1', name: 'Steamed White Rice', servingSize: '150g cooked plate', quantity: 1, calories: 195, protein: 4.0, carbs: 43, fat: 0.4, cost: 3 },
        { foodId: 'rajma-1', name: 'Homestyle Rajma Curry', servingSize: '1 bowl (180g)', quantity: 1, calories: 220, protein: 12.5, carbs: 34, fat: 4.0, cost: 9 },
        { foodId: 'mixed-veg-curry-1', name: 'Seasonal Mixed Veggie Sabzi', servingSize: '1 bowl (150g)', quantity: 1, calories: 90, protein: 3.0, carbs: 12, fat: 3.5, cost: 7 },
      ],
      totalCalories: 505,
      totalProtein: 19.5,
      totalCarbs: 89,
      totalFat: 7.9,
      totalCost: 19,
    },
  ];

  const demoWorkoutSplit: WorkoutDayPlan[] = [
    {
      dayName: 'Monday',
      focus: 'Full Body Circuit A (Bodyweight Focus)',
      isRestDay: false,
      estimatedTotalMinutes: 40,
      exercises: [
        { id: 'ex-1', name: 'Bodyweight Squats', targetMuscle: 'Quadriceps & Glutes', sets: 3, reps: '15 reps', restSeconds: 60, estimatedMinutes: 8, instructions: 'Feet shoulder-width apart, chest upright, lower down until thighs are parallel to ground.', equipmentNeeded: 'None', completed: true },
        { id: 'ex-2', name: 'Standard / Incline Push-ups', targetMuscle: 'Chest & Triceps', sets: 3, reps: '10-12 reps', restSeconds: 60, estimatedMinutes: 8, instructions: 'Core tight, lower chest smoothly to 2 inches off floor, push up steadily.', equipmentNeeded: 'Floor or wall/table for incline', completed: true },
        { id: 'ex-3', name: 'Glute Bridges', targetMuscle: 'Glutes & Hamstrings', sets: 3, reps: '15 reps', restSeconds: 45, estimatedMinutes: 6, instructions: 'Lie on back, drive through heels to elevate hips, squeeze glutes at the peak.', equipmentNeeded: 'Floor mat', completed: true },
        { id: 'ex-4', name: 'Plank Hold', targetMuscle: 'Core & Abdominals', sets: 3, reps: '35-45 secs', restSeconds: 60, estimatedMinutes: 6, instructions: 'Forearms on floor, maintain straight line from head to heels without sagging hips.', equipmentNeeded: 'Floor mat', completed: true },
        { id: 'ex-5', name: 'Jumping Jacks / Shadow Boxing', targetMuscle: 'Full Body Cardio', sets: 3, reps: '45 secs', restSeconds: 60, estimatedMinutes: 6, instructions: 'Light on feet, steady breathing pace.', equipmentNeeded: 'None', completed: true },
      ],
    },
    {
      dayName: 'Tuesday',
      focus: 'Active Recovery & Mobility',
      isRestDay: true,
      estimatedTotalMinutes: 20,
      exercises: [
        { id: 'ex-r1', name: 'Brisk Walk & Hip Openers', targetMuscle: 'Full Body Mobility', sets: 1, reps: '20 mins', restSeconds: 0, estimatedMinutes: 20, instructions: 'Gentle walk outdoors or light dynamic stretching to promote blood flow.', equipmentNeeded: 'None' },
      ],
    },
    {
      dayName: 'Wednesday',
      focus: 'Full Body Circuit B (Pull & Core Focus)',
      isRestDay: false,
      estimatedTotalMinutes: 40,
      exercises: [
        { id: 'ex-6', name: 'Doorframe / Towel Isometric Rows', targetMuscle: 'Upper Back & Lats', sets: 3, reps: '12 reps', restSeconds: 60, estimatedMinutes: 8, instructions: 'Lean back holding a sturdy doorframe or bedsheet knot, pull chest towards frame.', equipmentNeeded: 'Doorframe / Towel' },
        { id: 'ex-7', name: 'Walking Lunges', targetMuscle: 'Quads, Hamstrings & Balance', sets: 3, reps: '10 each leg', restSeconds: 60, estimatedMinutes: 8, instructions: 'Take controlled steps forward, dropping back knee gently towards floor.', equipmentNeeded: 'None' },
        { id: 'ex-8', name: 'Pike Push-ups', targetMuscle: 'Shoulders & Triceps', sets: 3, reps: '8-10 reps', restSeconds: 60, estimatedMinutes: 7, instructions: 'Hips elevated in an inverted V-shape, lower forehead gently toward ground.', equipmentNeeded: 'None' },
        { id: 'ex-9', name: 'Dead Bug Holds', targetMuscle: 'Deep Core Stability', sets: 3, reps: '10 each side', restSeconds: 45, estimatedMinutes: 6, instructions: 'Lower back glued to floor, extend opposite arm and leg slowly.', equipmentNeeded: 'Floor mat' },
      ],
    },
    {
      dayName: 'Thursday',
      focus: 'Rest & Recovery',
      isRestDay: true,
      estimatedTotalMinutes: 0,
      exercises: [],
    },
    {
      dayName: 'Friday',
      focus: 'Full Body Conditioning C',
      isRestDay: false,
      estimatedTotalMinutes: 45,
      exercises: [
        { id: 'ex-10', name: 'Tempo Bodyweight Squats (3s down)', targetMuscle: 'Legs & Core', sets: 3, reps: '12 reps', restSeconds: 60, estimatedMinutes: 8, instructions: 'Take 3 seconds lowering down to maximize muscle recruitment without weights.', equipmentNeeded: 'None' },
        { id: 'ex-11', name: 'Diamond / Close Grip Push-ups', targetMuscle: 'Triceps & Inner Chest', sets: 3, reps: '8-10 reps', restSeconds: 60, estimatedMinutes: 7, instructions: 'Hands closer together beneath sternum.', equipmentNeeded: 'Floor' },
        { id: 'ex-12', name: 'Superman Hold & Y-Raises', targetMuscle: 'Lower Back & Rear Delts', sets: 3, reps: '12 reps', restSeconds: 45, estimatedMinutes: 6, instructions: 'Lie on stomach, elevate chest and arms, squeeze shoulder blades.', equipmentNeeded: 'Floor mat' },
        { id: 'ex-13', name: 'Mountain Climbers', targetMuscle: 'Cardio & Core', sets: 3, reps: '30 secs', restSeconds: 45, estimatedMinutes: 6, instructions: 'Drive knees rhythmically into chest from plank position.', equipmentNeeded: 'Floor' },
      ],
    },
    {
      dayName: 'Saturday',
      focus: 'Core & Cardio Endurance',
      isRestDay: false,
      estimatedTotalMinutes: 35,
      exercises: [
        { id: 'ex-14', name: 'Bicycle Crunches', targetMuscle: 'Obliques & Abs', sets: 3, reps: '15 each side', restSeconds: 45, estimatedMinutes: 6, instructions: 'Touch opposite elbow to knee with controlled rotation.', equipmentNeeded: 'Mat' },
        { id: 'ex-15', name: 'High Knees in Place', targetMuscle: 'Cardiovascular Conditioning', sets: 4, reps: '30 secs', restSeconds: 45, estimatedMinutes: 8, instructions: 'Drive knees up towards waist height.', equipmentNeeded: 'None' },
      ],
    },
    {
      dayName: 'Sunday',
      focus: 'Full Rest & Weekly Meal Prep',
      isRestDay: true,
      estimatedTotalMinutes: 0,
      exercises: [],
    },
  ];

  const demoDailyRoutine: DailyRoutineEvent[] = [
    { id: 'r1', time: '07:00', title: 'Wake Up & Hydrate', type: 'wake', description: 'Drink 2 glasses (500ml) of warm water to kickstart digestion.', completed: true },
    { id: 'r2', time: '07:30', title: 'Breakfast', type: 'meal', description: 'Rolled Oats with Milk + 1 Banana (430 kcal, 15g protein)', completed: true },
    { id: 'r3', time: '09:00', title: 'Work / Study Session 1', type: 'work', description: 'Deep focused work block with standing breaks.', completed: true },
    { id: 'r4', time: '10:30', title: 'Mid-Morning Snack', type: 'snack', description: 'Roasted Peanuts (30g) + Lemon Tea (185 kcal, 8g protein)', completed: true },
    { id: 'r5', time: '13:00', title: 'Lunch', type: 'meal', description: '3 Rotis, Moong Dal, Curd & Salad (520 kcal, 25g protein)', completed: true },
    { id: 'r6', time: '14:00', title: 'Work / Study Session 2', type: 'work', description: 'Afternoon productivity block + 500ml water.', completed: true },
    { id: 'r7', time: '17:30', title: 'Pre-Workout Snack', type: 'snack', description: 'Sautéed Soya Chunks (145 kcal, 18g protein) for sustained energy.', completed: true },
    { id: 'r8', time: '18:00', title: 'Home Workout Session', type: 'workout', description: '40 mins Full Body Circuit (No Equipment needed).', completed: true },
    { id: 'r9', time: '20:30', title: 'Dinner', type: 'meal', description: 'Steamed Rice, Rajma Curry & Veggies (515 kcal, 20g protein)', completed: false },
    { id: 'r10', time: '21:45', title: 'Evening Wind-Down', type: 'winddown', description: 'Screen off, light reading, daily check-in reflection.', completed: false },
    { id: 'r11', time: '22:30', title: 'Sleep', type: 'sleep', description: 'Aim for 7.5 - 8 hours restful recovery.', completed: false },
  ];

  // Pre-seed 7 days of realistic logs for immediate rich charts!
  const demoLogs: DailyLog[] = [
    {
      date: getDateStr(6),
      weightKg: 65.4,
      energyLevel: 4,
      mealsCompleted: ['m1', 'm2', 'm3', 'm4', 'm5'],
      workoutCompleted: true,
      waterIntakeMl: 2500,
      sleepHours: 7.5,
      caloriesConsumed: 2050,
      proteinConsumed: 82,
      foodSpent: 142,
      notes: 'Felt great, stayed strictly within ₹150 budget!',
    },
    {
      date: getDateStr(5),
      weightKg: 65.3,
      energyLevel: 3,
      mealsCompleted: ['m1', 'm2', 'm3', 'm4'],
      workoutCompleted: true,
      waterIntakeMl: 2200,
      sleepHours: 7.0,
      caloriesConsumed: 1980,
      proteinConsumed: 79,
      foodSpent: 135,
    },
    {
      date: getDateStr(4),
      weightKg: 65.2,
      energyLevel: 4,
      mealsCompleted: ['m1', 'm3', 'm5'],
      workoutCompleted: false, // skipped workout
      waterIntakeMl: 2000,
      sleepHours: 6.5,
      caloriesConsumed: 1850,
      proteinConsumed: 72,
      foodSpent: 120,
      notes: 'Busy college assignments day, rested today.',
    },
    {
      date: getDateStr(3),
      weightKg: 65.1,
      energyLevel: 5,
      mealsCompleted: ['m1', 'm2', 'm3', 'm4', 'm5'],
      workoutCompleted: true,
      waterIntakeMl: 2750,
      sleepHours: 8.0,
      caloriesConsumed: 2120,
      proteinConsumed: 88,
      foodSpent: 148,
    },
    {
      date: getDateStr(2),
      weightKg: 65.0,
      energyLevel: 4,
      mealsCompleted: ['m1', 'm2', 'm3', 'm5'],
      workoutCompleted: true,
      waterIntakeMl: 2500,
      sleepHours: 7.5,
      caloriesConsumed: 2040,
      proteinConsumed: 84,
      foodSpent: 138,
    },
    {
      date: getDateStr(1),
      weightKg: 64.9,
      energyLevel: 4,
      mealsCompleted: ['m1', 'm2', 'm3', 'm4', 'm5'],
      workoutCompleted: true,
      waterIntakeMl: 2600,
      sleepHours: 7.5,
      caloriesConsumed: 2080,
      proteinConsumed: 86,
      foodSpent: 145,
    },
    {
      date: getDateStr(0), // Today
      weightKg: 64.8,
      energyLevel: 5,
      mealsCompleted: ['m1', 'm2', 'm3', 'm4'],
      workoutCompleted: true,
      waterIntakeMl: 2000,
      sleepHours: 7.5,
      caloriesConsumed: 1795, // currently 4 meals eaten, dinner pending
      proteinConsumed: 66.3,
      foodSpent: 107,
      notes: 'Strong energy, only dinner remaining to reach target.',
    },
  ];

  const demoNotificationSettings: NotificationSettings = {
    enabled: true,
    breakfastReminder: true,
    breakfastTime: '07:15',
    lunchReminder: true,
    lunchTime: '12:45',
    dinnerReminder: true,
    dinnerTime: '20:00',
    snackReminder: true,
    workoutReminder: true,
    workoutTime: '17:45',
    waterReminder: true,
    checkInReminder: true,
    checkInTime: '21:30',
    sleepReminder: true,
    sleepTime: '22:15',
    weeklyProgress: true,
  };

  dbCache.users[demoUserId] = {
    id: demoUserId,
    name: 'Aman Sharma',
    email: 'demo@fitbudget.app',
    isDemo: true,
    createdAt: new Date().toISOString(),
    profile: demoProfile,
    plan: {
      meals: demoMeals,
      workoutSplit: demoWorkoutSplit,
      dailyRoutine: demoDailyRoutine,
      updatedAt: new Date().toISOString(),
    },
    logs: demoLogs,
    customPrices: {},
    notificationSettings: demoNotificationSettings,
  };
}

// Auto initialize on module import
initDB();
