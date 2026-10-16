import { INITIAL_FOOD_DATABASE, FoodItem } from '../data/foodDatabase';
import { MealPlan, MealItemEntry } from '../../server/db';

export interface BudgetAnalysis {
  dailyBudget: number;
  totalPlannedCost: number;
  difference: number; // positive = under budget, negative = over budget
  isOverBudget: boolean;
  overBudgetAmount: number;
  remainingAmount: number;
  percentUsed: number;
  suggestions: CheaperAlternativeSuggestion[];
}

export interface CheaperAlternativeSuggestion {
  originalFoodId: string;
  originalName: string;
  originalCost: number;
  originalProtein: number;
  alternativeFoodId: string;
  alternativeName: string;
  alternativeCost: number;
  alternativeProtein: number;
  potentialSavings: number;
  reason: string;
  mealId: string;
}

export function analyzeBudget(
  meals: MealPlan[],
  dailyBudget: number,
  customPrices?: Record<string, number>
): BudgetAnalysis {
  const totalPlannedCost = meals.reduce((sum, meal) => sum + meal.totalCost, 0);
  const difference = dailyBudget - totalPlannedCost;
  const isOverBudget = difference < 0;
  const overBudgetAmount = isOverBudget ? Math.abs(difference) : 0;
  const remainingAmount = isOverBudget ? 0 : difference;
  const percentUsed = dailyBudget > 0 ? Math.round((totalPlannedCost / dailyBudget) * 100) : 0;

  const suggestions: CheaperAlternativeSuggestion[] = [];

  // Search each meal item for items that have cheaper alternatives
  meals.forEach((meal) => {
    meal.items.forEach((item) => {
      const foodDef = INITIAL_FOOD_DATABASE.find((f) => f.id === item.foodId);
      if (!foodDef) return;

      if (foodDef.cheaperAlternativeId) {
        const altDef = INITIAL_FOOD_DATABASE.find((f) => f.id === foodDef.cheaperAlternativeId);
        if (altDef) {
          const origCost = (customPrices?.[foodDef.id] ?? foodDef.cost) * item.quantity;
          const altCost = (customPrices?.[altDef.id] ?? altDef.cost) * item.quantity;
          const savings = origCost - altCost;

          if (savings > 0) {
            suggestions.push({
              originalFoodId: foodDef.id,
              originalName: item.name,
              originalCost: Math.round(origCost),
              originalProtein: Number((foodDef.protein * item.quantity).toFixed(1)),
              alternativeFoodId: altDef.id,
              alternativeName: altDef.name,
              alternativeCost: Math.round(altCost),
              alternativeProtein: Number((altDef.protein * item.quantity).toFixed(1)),
              potentialSavings: Math.round(savings),
              reason: foodDef.cheaperAlternativeReason || 'Budget-friendly alternative offering comparable nutrition',
              mealId: meal.id,
            });
          }
        }
      }
    });
  });

  return {
    dailyBudget,
    totalPlannedCost,
    difference,
    isOverBudget,
    overBudgetAmount,
    remainingAmount,
    percentUsed,
    suggestions,
  };
}

/**
 * Applies a cheaper alternative swap into the meal plan
 */
export function applyCheaperAlternative(
  meals: MealPlan[],
  mealId: string,
  originalFoodId: string,
  alternativeFoodId: string,
  customPrices?: Record<string, number>
): MealPlan[] {
  const altDef = INITIAL_FOOD_DATABASE.find((f) => f.id === alternativeFoodId);
  if (!altDef) return meals;

  return meals.map((meal) => {
    if (meal.id !== mealId) return meal;

    const updatedItems = meal.items.map((item) => {
      if (item.foodId !== originalFoodId) return item;

      const unitCost = customPrices?.[altDef.id] ?? altDef.cost;
      return {
        foodId: altDef.id,
        name: altDef.name,
        servingSize: altDef.servingSize,
        quantity: item.quantity,
        calories: Math.round(altDef.calories * item.quantity),
        protein: Number((altDef.protein * item.quantity).toFixed(1)),
        carbs: Math.round(altDef.carbs * item.quantity),
        fat: Math.round(altDef.fat * item.quantity),
        cost: Math.round(unitCost * item.quantity),
      };
    });

    const totalCalories = updatedItems.reduce((acc, i) => acc + i.calories, 0);
    const totalProtein = Number(updatedItems.reduce((acc, i) => acc + i.protein, 0).toFixed(1));
    const totalCarbs = updatedItems.reduce((acc, i) => acc + i.carbs, 0);
    const totalFat = updatedItems.reduce((acc, i) => acc + i.fat, 0);
    const totalCost = updatedItems.reduce((acc, i) => acc + i.cost, 0);

    return {
      ...meal,
      items: updatedItems,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalCost,
    };
  });
}
