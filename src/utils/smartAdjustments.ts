import { DailyLog, UserProfile, UserPlan } from '../../server/db';

export interface SmartAdjustmentSuggestion {
  id: string;
  type: 'breakfast_time' | 'budget_reduction' | 'workout_time' | 'hydration_boost' | 'calorie_pacing';
  title: string;
  message: string;
  actionText: string;
  applied?: boolean;
  proposedChanges: {
    targetField: string;
    newValue: any;
    explanation: string;
  };
}

export function detectSmartAdjustments(
  logs: DailyLog[],
  profile: UserProfile,
  plan: UserPlan
): SmartAdjustmentSuggestion[] {
  if (!logs || logs.length < 2) return [];

  const suggestions: SmartAdjustmentSuggestion[] = [];
  const recentLogs = logs.slice(-7); // inspect last 7 days

  // 1. Check if breakfast is frequently skipped
  // Breakfast is marked skipped if 'm1' is absent from mealsCompleted in 2+ recent logs
  const breakfastSkippedCount = recentLogs.filter(
    (log) => !log.mealsCompleted.some((m) => m.toLowerCase().includes('m1') || m.toLowerCase().includes('breakfast'))
  ).length;

  if (breakfastSkippedCount >= 2) {
    suggestions.push({
      id: 'adj-skip-breakfast',
      type: 'breakfast_time',
      title: 'Meal Timing Adjustment',
      message: `We noticed breakfast was skipped on ${breakfastSkippedCount} of your recent logged days. Would you prefer moving your first meal to 10:00 AM as a brunch?`,
      actionText: 'Shift First Meal to 10:00 AM',
      proposedChanges: {
        targetField: 'breakfast_time',
        newValue: '10:00',
        explanation: 'Adapts your meal window into a sustainable intermittent schedule without feeling pressured.',
      },
    });
  }

  // 2. Check if food spending repeatedly exceeds budget
  const overBudgetDays = recentLogs.filter(
    (log) => log.foodSpent > 0 && log.foodSpent > (profile.calculatedMetrics?.targetDailyBudget || profile.budgetAmount)
  ).length;

  if (overBudgetDays >= 2) {
    suggestions.push({
      id: 'adj-over-budget',
      type: 'budget_reduction',
      title: 'Budget Optimization Alert',
      message: `You exceeded your daily food budget on ${overBudgetDays} days this week. Would you like to activate low-cost protein swaps (e.g. Soya Chunks & Eggs) to save ₹30–₹50 daily?`,
      actionText: 'Apply Budget-Saving Meal Swaps',
      proposedChanges: {
        targetField: 'budget_optimization',
        newValue: true,
        explanation: 'Swaps premium protein items with budget superfoods with identical macro nutrition.',
      },
    });
  }

  // 3. Check if workouts are frequently skipped
  const skippedWorkouts = recentLogs.filter((log) => log.workoutCompleted === false).length;
  if (skippedWorkouts >= 2) {
    const nextPreferredTime = profile.preferredWorkoutTime === 'evening' ? 'morning' : 'evening';
    suggestions.push({
      id: 'adj-skip-workout',
      type: 'workout_time',
      title: 'Workout Schedule Shift',
      message: `You missed ${skippedWorkouts} scheduled workouts recently. Shifting your workout to ${nextPreferredTime} or shortening it to 30 mins often unlocks better consistency!`,
      actionText: `Switch Workout Time to ${nextPreferredTime.toUpperCase()}`,
      proposedChanges: {
        targetField: 'preferredWorkoutTime',
        newValue: nextPreferredTime,
        explanation: `Reschedules your workout to ${nextPreferredTime} when motivation and schedule flexibility may be higher.`,
      },
    });
  }

  // 4. Check hydration
  const lowHydrationDays = recentLogs.filter((log) => log.waterIntakeMl > 0 && log.waterIntakeMl < 1800).length;
  if (lowHydrationDays >= 3) {
    suggestions.push({
      id: 'adj-hydration',
      type: 'hydration_boost',
      title: 'Hydration Optimization',
      message: 'Your average daily water intake is under 1.8 liters. Drinking an extra glass before each meal improves energy, metabolism, and recovery.',
      actionText: 'Enable Regular Hydration Pings',
      proposedChanges: {
        targetField: 'water_reminders',
        newValue: true,
        explanation: 'Enables hourly gentle in-app water prompts during your daytime routine.',
      },
    });
  }

  return suggestions;
}
