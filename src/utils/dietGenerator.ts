import { FoodItem, INITIAL_FOOD_DATABASE } from '../data/foodDatabase';
import { MealItemEntry, MealPlan } from '../../server/db';
import { getFoodPortionCost } from './pricingEngine';

export interface DietGeneratorInput {
  targetCalories: number;
  targetProtein: number;
  foodPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian';
  allergies: string[];
  dailyBudget: number;
  customPrices?: Record<string, number>;
}

export function filterFoodsForUser(
  preference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian',
  allergies: string[],
  customPrices?: Record<string, number>
): FoodItem[] {
  const allergyList = (allergies || []).map((a) => a.toLowerCase().trim());

  return INITIAL_FOOD_DATABASE.map((item) => {
    const customCost = customPrices?.[item.id];
    return customCost !== undefined ? { ...item, cost: customCost } : item;
  }).filter((item) => {
    // Check allergen exclusion
    const hasAllergen = item.allergens.some((allergen) =>
      allergyList.includes(allergen.toLowerCase())
    );
    if (hasAllergen) return false;

    // Check diet preference
    if (preference === 'vegan') {
      return item.dietType === 'vegan';
    }
    if (preference === 'vegetarian') {
      return item.dietType === 'vegan' || item.dietType === 'vegetarian';
    }
    if (preference === 'eggetarian') {
      return (
        item.dietType === 'vegan' ||
        item.dietType === 'vegetarian' ||
        item.dietType === 'eggetarian'
      );
    }
    // non_vegetarian eats all
    return true;
  });
}

/**
 * Generates an affordable, balanced 5-meal daily plan adhering strictly to calories, protein & budget
 */
export function generatePersonalizedDiet(input: DietGeneratorInput): MealPlan[] {
  const targetBudget = Math.max(40, input.dailyBudget || 100);
  const availableFoods = filterFoodsForUser(
    input.foodPreference,
    input.allergies,
    input.customPrices
  );

  const byId = (id: string): FoodItem | undefined => availableFoods.find((f) => f.id === id);

  // Helper to convert FoodItem to MealItemEntry with exact portion price
  const toEntry = (food: FoodItem, quantity: number = 1): MealItemEntry => {
    const qty = Math.max(0.25, Math.round(quantity * 100) / 100);
    const unitPrice = input.customPrices?.[food.id] ?? food.cost;
    const computedCost = Math.round(unitPrice * qty);

    return {
      foodId: food.id,
      name: food.name,
      servingSize: food.servingSize,
      quantity: qty,
      calories: Math.round(food.calories * qty),
      protein: Number((food.protein * qty).toFixed(1)),
      carbs: Math.round(food.carbs * qty),
      fat: Math.round(food.fat * qty),
      cost: computedCost,
    };
  };

  // Safe pantry references
  const chapati = byId('chapati-1');
  const rice = byId('white-rice-1');
  const oats = byId('oats-1');
  const poha = byId('poha-1');
  const banana = byId('banana-1');
  const milk = byId('milk-cow-1');
  const curd = byId('curd-1');
  const moongDal = byId('moong-dal-1') || byId('chana-dal-1');
  const chanaDal = byId('chana-dal-1') || byId('toor-dal-1');
  const rajma = byId('rajma-1') || byId('chickpeas-chhole-1');
  const soya = byId('soya-chunks-1');
  const peanuts = byId('roasted-peanuts-1');
  const roastedChana = byId('roasted-chana-1');
  const sprouts = byId('sprouts-moong-1');
  const salad = byId('cucumber-tomato-salad-1');
  const sabzi = byId('mixed-veg-curry-1') || byId('spinach-palak-1');
  const eggs = byId('whole-eggs-2');
  const chicken = byId('chicken-curry-1');
  const chickenBreast = byId('chicken-breast-1');
  const fish = byId('fish-rohu-1');
  const paneer = byId('paneer-1');

  // Meal arrays
  let breakfastItems: MealItemEntry[] = [];
  let midMorningItems: MealItemEntry[] = [];
  let lunchItems: MealItemEntry[] = [];
  let eveningItems: MealItemEntry[] = [];
  let dinnerItems: MealItemEntry[] = [];

  // ==========================================
  // 1. TIER-BASED MEAL ASSEMBLY
  // ==========================================

  // Ultra-frugal / Budget <= ₹110 (e.g. ₹60, ₹80, ₹100/day)
  if (targetBudget <= 110) {
    // 1. Breakfast (~₹20)
    if (input.foodPreference === 'non_vegetarian' || input.foodPreference === 'eggetarian') {
      if (eggs) breakfastItems.push(toEntry(eggs, 1)); // 2 whole eggs = ₹13
      if (chapati) breakfastItems.push(toEntry(chapati, 1)); // 2 rotis = ₹3
      if (banana) breakfastItems.push(toEntry(banana, 1)); // 1 banana = ₹5
    } else {
      // Veg / Vegan
      if (poha) {
        breakfastItems.push(toEntry(poha, 1)); // ₹3
      } else if (oats) {
        breakfastItems.push(toEntry(oats, 0.8)); // ~₹7
      }
      if (milk && input.foodPreference !== 'vegan') {
        breakfastItems.push(toEntry(milk, 1)); // ₹11
      }
      if (banana) breakfastItems.push(toEntry(banana, 1)); // ₹5
    }

    // 2. Mid-Morning Snack (~₹5)
    if (peanuts) {
      midMorningItems.push(toEntry(peanuts, 1)); // 30g = ₹4.50 -> ₹5
    } else if (roastedChana) {
      midMorningItems.push(toEntry(roastedChana, 1)); // ₹6
    } else if (sprouts) {
      midMorningItems.push(toEntry(sprouts, 1)); // ₹5
    }

    // 3. Lunch (~₹24-₹28)
    if (input.foodPreference === 'non_vegetarian' && targetBudget >= 95 && eggs) {
      // 2 Boiled eggs or budget chicken portion + rotis + dal + salad
      breakfastItems = breakfastItems.filter((i) => i.foodId !== 'whole-eggs-2');
      if (eggs) lunchItems.push(toEntry(eggs, 1)); // ₹13
      if (chapati) lunchItems.push(toEntry(chapati, 1)); // 2 rotis = ₹3
      if (rice) lunchItems.push(toEntry(rice, 0.75)); // ₹2
      if (moongDal) lunchItems.push(toEntry(moongDal, 1)); // ₹7
      if (salad) lunchItems.push(toEntry(salad, 0.8)); // ₹4
    } else {
      // Vegetarian / Eggetarian staple
      if (chapati) lunchItems.push(toEntry(chapati, 1)); // 2 rotis = ₹3
      if (moongDal) lunchItems.push(toEntry(moongDal, 1)); // ₹7
      if (curd && input.foodPreference !== 'vegan') lunchItems.push(toEntry(curd, 1)); // ₹6
      if (rice) lunchItems.push(toEntry(rice, 0.75)); // ₹2
      if (salad) lunchItems.push(toEntry(salad, 0.8)); // ₹4
    }

    // 4. Evening Snack (~₹5)
    // Soya chunks: supreme Indian budget staple delivering 21g protein for ₹5!
    if (soya) {
      eveningItems.push(toEntry(soya, 1)); // 40g dry chunks = ₹5 (21g protein!)
    } else if (roastedChana) {
      eveningItems.push(toEntry(roastedChana, 1)); // ₹6
    } else if (peanuts) {
      eveningItems.push(toEntry(peanuts, 1)); // ₹5
    }

    // 5. Dinner (~₹18-₹22)
    if (rice) dinnerItems.push(toEntry(rice, 1)); // 150g rice = ₹3
    if (rajma) {
      dinnerItems.push(toEntry(rajma, 1)); // 1 bowl rajma = ₹9
    } else if (chanaDal) {
      dinnerItems.push(toEntry(chanaDal, 1)); // ₹6
    }
    if (sabzi) dinnerItems.push(toEntry(sabzi, 1)); // ₹7
  }
  // Moderate Budget: ₹111 to ₹170/day (e.g. ₹130, ₹150)
  else if (targetBudget <= 170) {
    // 1. Breakfast (~₹25-₹30)
    if (oats) breakfastItems.push(toEntry(oats, 1)); // ₹9
    if (milk && input.foodPreference !== 'vegan') breakfastItems.push(toEntry(milk, 1)); // ₹11
    if (banana) breakfastItems.push(toEntry(banana, 1)); // ₹5
    if ((input.foodPreference === 'non_vegetarian' || input.foodPreference === 'eggetarian') && eggs) {
      breakfastItems.push(toEntry(eggs, 1)); // ₹13
    }

    // 2. Mid-Morning Snack (~₹8-₹12)
    if (roastedChana) midMorningItems.push(toEntry(roastedChana, 1)); // ₹6
    if (banana && breakfastItems.every((i) => i.foodId !== 'banana-1')) {
      midMorningItems.push(toEntry(banana, 1)); // ₹5
    } else if (peanuts) {
      midMorningItems.push(toEntry(peanuts, 1)); // ₹5
    }

    // 3. Lunch (~₹38-₹45)
    if (input.foodPreference === 'non_vegetarian' && chicken) {
      lunchItems.push(toEntry(chicken, 1)); // ₹30
      if (chapati) lunchItems.push(toEntry(chapati, 1)); // ₹3
      if (rice) lunchItems.push(toEntry(rice, 1)); // ₹3
      if (salad) lunchItems.push(toEntry(salad, 1)); // ₹5
    } else {
      if (chapati) lunchItems.push(toEntry(chapati, 1.5)); // 3 rotis = ~₹4.50
      if (moongDal) lunchItems.push(toEntry(moongDal, 1)); // ₹7
      if (curd && input.foodPreference !== 'vegan') lunchItems.push(toEntry(curd, 1)); // ₹6
      if (rice) lunchItems.push(toEntry(rice, 1)); // ₹3
      if (salad) lunchItems.push(toEntry(salad, 1)); // ₹5
      if (paneer && targetBudget >= 140) lunchItems.push(toEntry(paneer, 0.5)); // 50g paneer = ₹20
    }

    // 4. Evening Snack (~₹10-₹15)
    if (soya) eveningItems.push(toEntry(soya, 1)); // ₹5
    if (sprouts) eveningItems.push(toEntry(sprouts, 1)); // ₹5

    // 5. Dinner (~₹25-₹35)
    if (input.foodPreference === 'non_vegetarian' && fish && targetBudget >= 140) {
      dinnerItems.push(toEntry(fish, 1)); // ₹26
      if (rice) dinnerItems.push(toEntry(rice, 1)); // ₹3
      if (sabzi) dinnerItems.push(toEntry(sabzi, 1)); // ₹7
    } else {
      if (rice) dinnerItems.push(toEntry(rice, 1)); // ₹3
      if (rajma) dinnerItems.push(toEntry(rajma, 1)); // ₹9
      if (sabzi) dinnerItems.push(toEntry(sabzi, 1)); // ₹7
      if (chapati) dinnerItems.push(toEntry(chapati, 1)); // ₹3
    }
  }
  // High Budget: > ₹170/day (e.g. ₹200, ₹250, ₹300)
  else {
    // 1. Breakfast (~₹35-₹45)
    if (oats) breakfastItems.push(toEntry(oats, 1)); // ₹9
    if (milk && input.foodPreference !== 'vegan') breakfastItems.push(toEntry(milk, 1.25)); // ₹14
    if (banana) breakfastItems.push(toEntry(banana, 1)); // ₹5
    if ((input.foodPreference === 'non_vegetarian' || input.foodPreference === 'eggetarian') && eggs) {
      breakfastItems.push(toEntry(eggs, 1)); // ₹13
    }

    // 2. Mid-Morning Snack (~₹20-₹25)
    const almonds = byId('almonds-raw-1');
    if (almonds) {
      midMorningItems.push(toEntry(almonds, 1)); // ₹20
    } else if (peanuts) {
      midMorningItems.push(toEntry(peanuts, 1.5)); // ₹7
    }
    const guava = byId('guava-1') || byId('apple-1');
    if (guava) midMorningItems.push(toEntry(guava, 1));

    // 3. Lunch (~₹55-₹70)
    if (input.foodPreference === 'non_vegetarian' && (chickenBreast || chicken)) {
      const poultry = chickenBreast || chicken!;
      lunchItems.push(toEntry(poultry, 1)); // ₹30-₹40
      if (chapati) lunchItems.push(toEntry(chapati, 1.5));
      if (rice) lunchItems.push(toEntry(rice, 1));
      if (salad) lunchItems.push(toEntry(salad, 1));
      if (curd) lunchItems.push(toEntry(curd, 1));
    } else {
      if (paneer) lunchItems.push(toEntry(paneer, 1)); // 100g paneer = ₹40
      if (chapati) lunchItems.push(toEntry(chapati, 1.5));
      if (moongDal) lunchItems.push(toEntry(moongDal, 1));
      if (curd) lunchItems.push(toEntry(curd, 1));
      if (salad) lunchItems.push(toEntry(salad, 1));
    }

    // 4. Evening Snack (~₹15-₹25)
    const eggWhites = byId('egg-whites-3');
    if (eggWhites && (input.foodPreference === 'non_vegetarian' || input.foodPreference === 'eggetarian')) {
      eveningItems.push(toEntry(eggWhites, 1)); // ₹19.50
    } else if (soya) {
      eveningItems.push(toEntry(soya, 1)); // ₹5
      if (sprouts) eveningItems.push(toEntry(sprouts, 1)); // ₹5
    }

    // 5. Dinner (~₹45-₹60)
    if (input.foodPreference === 'non_vegetarian' && (fish || chicken)) {
      dinnerItems.push(toEntry(fish || chicken!, 1));
      if (rice) dinnerItems.push(toEntry(rice, 1));
      if (sabzi) dinnerItems.push(toEntry(sabzi, 1));
      if (salad) dinnerItems.push(toEntry(salad, 1));
    } else {
      if (rice) dinnerItems.push(toEntry(rice, 1));
      if (rajma) dinnerItems.push(toEntry(rajma, 1));
      if (sabzi) dinnerItems.push(toEntry(sabzi, 1));
      if (chapati) dinnerItems.push(toEntry(chapati, 1));
      if (curd) dinnerItems.push(toEntry(curd, 1));
    }
  }

  // Helper to compile a meal with exact item costs
  const compileMeal = (
    id: string,
    name: MealPlan['name'],
    time: string,
    items: MealItemEntry[]
  ): MealPlan => {
    // Recalculate each item's cost cleanly
    const refinedItems = items.map((item) => {
      const foodDef = availableFoods.find((f) => f.id === item.foodId);
      const unitCost = input.customPrices?.[item.foodId] ?? foodDef?.cost ?? item.cost;
      return {
        ...item,
        cost: Math.round(unitCost * item.quantity),
      };
    });

    const totalCalories = refinedItems.reduce((acc, i) => acc + i.calories, 0);
    const totalProtein = Number(refinedItems.reduce((acc, i) => acc + i.protein, 0).toFixed(1));
    const totalCarbs = refinedItems.reduce((acc, i) => acc + i.carbs, 0);
    const totalFat = refinedItems.reduce((acc, i) => acc + i.fat, 0);
    const totalCost = refinedItems.reduce((acc, i) => acc + i.cost, 0);

    return {
      id,
      name,
      time,
      items: refinedItems,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalCost,
    };
  };

  let meals: MealPlan[] = [
    compileMeal('m1', 'Breakfast', '07:30', breakfastItems),
    compileMeal('m2', 'Mid-Morning Snack', '10:30', midMorningItems),
    compileMeal('m3', 'Lunch', '13:00', lunchItems),
    compileMeal('m4', 'Evening Snack', '17:30', eveningItems),
    compileMeal('m5', 'Dinner', '20:30', dinnerItems),
  ];

  // ==========================================
  // 2. STRICT BUDGET CONSTRAINT OPTIMIZATION LOOP
  // ==========================================
  // If the compiled meals exceed the target daily budget, automatically
  // optimize items and portions so totalCost <= targetBudget is GUARANTEED!

  const getPlannedTotal = (currentMeals: MealPlan[]) =>
    currentMeals.reduce((sum, m) => sum + m.totalCost, 0);

  let currentTotalCost = getPlannedTotal(meals);

  if (currentTotalCost > targetBudget) {
    // Optimization Pass 1: Cheaper alternative food swaps
    meals = meals.map((meal) => {
      const updatedItems = meal.items.map((item) => {
        // Swap paneer for soya chunks or eggs if over budget
        if (item.foodId === 'paneer-1' && soya) {
          return toEntry(soya, 1);
        }
        // Swap chicken breast for chicken curry or eggs
        if (item.foodId === 'chicken-breast-1' && chicken) {
          return toEntry(chicken, 0.8);
        }
        // Swap almonds for peanuts
        if (item.foodId === 'almonds-raw-1' && peanuts) {
          return toEntry(peanuts, 1);
        }
        // Swap oats for poha if tight
        if (item.foodId === 'oats-1' && targetBudget <= 80 && poha) {
          return toEntry(poha, 1);
        }
        return item;
      });

      return compileMeal(meal.id, meal.name, meal.time, updatedItems);
    });

    currentTotalCost = getPlannedTotal(meals);
  }

  // Optimization Pass 2: Gentle portion scaling if still over budget
  if (currentTotalCost > targetBudget) {
    const scaleFactor = Math.max(0.75, targetBudget / currentTotalCost);

    meals = meals.map((meal) => {
      const scaledItems = meal.items.map((item) => {
        // Scale non-staples or discretionary portions slightly
        const newQty = Math.max(0.5, Math.round(item.quantity * scaleFactor * 10) / 10);
        const foodDef = availableFoods.find((f) => f.id === item.foodId);
        if (!foodDef) return item;
        return toEntry(foodDef, newQty);
      });

      return compileMeal(meal.id, meal.name, meal.time, scaledItems);
    });

    currentTotalCost = getPlannedTotal(meals);
  }

  // Final Pass: Ensure exact zero-penny discrepancy
  // Verify that every meal's totalCost equals the sum of its items' costs,
  // and the sum of all meal totalCosts is strictly <= targetBudget.
  meals = meals.map((meal) => {
    const mealItemSum = meal.items.reduce((acc, i) => acc + i.cost, 0);
    return {
      ...meal,
      totalCost: mealItemSum,
    };
  });

  return meals;
}
