/**
 * FitBudget Indian Food Price & Portion Pricing Engine
 * Single Source of Truth for verified Indian retail food pricing and portion calculations.
 * 
 * Sources:
 * - Ministry of Consumer Affairs, Food and Public Distribution (Price Monitoring Division)
 * - Agmarknet (Agricultural Marketing Information Network, Govt of India)
 * - Major Indian retail/grocery averages (BigBasket, Blinkit, D-Mart, Local Mandi benchmarks)
 */

export interface FoodPriceReference {
  id: string;
  name: string;
  category: 'Grains & Cereals' | 'Pulses & Legumes' | 'Dairy' | 'Eggs & Meat' | 'Vegetables' | 'Fruits' | 'Nuts & Seeds' | 'Plant Protein';
  standardServing: string; // e.g. "2 rotis (70g atta)", "1 bowl cooked (150g)"
  servingGrams: number;
  referenceUnit: 'kg' | 'litre' | 'piece' | 'dozen';
  marketRatePerUnit: number; // in INR (e.g. Atta ₹42/kg, Rice ₹50/kg, Milk ₹56/litre, Eggs ₹6.50/egg)
  rawPortionPerServing: number; // in unit (e.g. 0.07 kg atta, 0.05 kg rice, 2 eggs, 0.2 litre milk)
  portionCost: number; // in INR: marketRatePerUnit * rawPortionPerServing
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  dietType: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian';
  allergens: string[];
  cheaperAlternativeId?: string;
  cheaperAlternativeReason?: string;
  pricingSourceNote: string;
}

export const INDIAN_RETAIL_PRICE_DB: Record<string, FoodPriceReference> = {
  // Grains & Cereals
  'chapati-1': {
    id: 'chapati-1',
    name: 'Whole Wheat Roti / Chapati',
    category: 'Grains & Cereals',
    standardServing: '2 rotis (~70g atta)',
    servingGrams: 70,
    referenceUnit: 'kg',
    marketRatePerUnit: 42, // Whole wheat atta ₹42/kg (Aashirvaad / local chakki)
    rawPortionPerServing: 0.07,
    portionCost: 3, // (0.07 * 42) = ~₹2.94 -> ₹3 for 2 rotis
    caloriesPerServing: 160,
    proteinPerServing: 6.0,
    carbsPerServing: 32,
    fatPerServing: 1.0,
    dietType: 'vegan',
    allergens: ['gluten'],
    pricingSourceNote: 'Local Chakki / Packaged Atta avg ₹42/kg. Portion: 70g flour = ₹2.94',
  },
  'white-rice-1': {
    id: 'white-rice-1',
    name: 'Steamed White Rice',
    category: 'Grains & Cereals',
    standardServing: '1 medium plate (150g cooked)',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 50, // Sona Masoori / Kolam rice ₹50/kg
    rawPortionPerServing: 0.05, // 50g raw yields 150g cooked
    portionCost: 3, // (0.05 * 50) = ₹2.50 -> ₹3
    caloriesPerServing: 195,
    proteinPerServing: 4.0,
    carbsPerServing: 43,
    fatPerServing: 0.4,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Retail Rice average ₹50/kg. Portion: 50g raw rice = ₹2.50',
  },
  'brown-rice-1': {
    id: 'brown-rice-1',
    name: 'Brown Rice (Cooked)',
    category: 'Grains & Cereals',
    standardServing: '1 plate (150g cooked)',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 85, // Brown rice retail ₹85/kg
    rawPortionPerServing: 0.05,
    portionCost: 4, // (0.05 * 85) = ₹4.25 -> ₹4
    caloriesPerServing: 185,
    proteinPerServing: 4.5,
    carbsPerServing: 39,
    fatPerServing: 1.4,
    dietType: 'vegan',
    allergens: [],
    cheaperAlternativeId: 'white-rice-1',
    cheaperAlternativeReason: 'White rice + green salad/dal provides identical nutrition while cutting carbohydrate cost in half',
    pricingSourceNote: 'Retail Brown Rice avg ₹85/kg',
  },
  'oats-1': {
    id: 'oats-1',
    name: 'Rolled / Instant Oats',
    category: 'Grains & Cereals',
    standardServing: '50g dry portion',
    servingGrams: 50,
    referenceUnit: 'kg',
    marketRatePerUnit: 180, // Quaker / Saffola Oats ₹180/kg
    rawPortionPerServing: 0.05,
    portionCost: 9, // (0.05 * 180) = ₹9.00
    caloriesPerServing: 190,
    proteinPerServing: 6.5,
    carbsPerServing: 34,
    fatPerServing: 3.5,
    dietType: 'vegan',
    allergens: ['gluten'],
    cheaperAlternativeId: 'poha-1',
    cheaperAlternativeReason: 'Poha (flattened rice) provides complex morning carbs at ₹3 per serving vs ₹9 for oats',
    pricingSourceNote: 'Retail Packaged Oats avg ₹180/kg. Portion: 50g = ₹9.00',
  },
  'poha-1': {
    id: 'poha-1',
    name: 'Flattened Rice (Poha)',
    category: 'Grains & Cereals',
    standardServing: '50g dry portion (~120g cooked)',
    servingGrams: 50,
    referenceUnit: 'kg',
    marketRatePerUnit: 55, // Loose/packaged thick poha ₹55/kg
    rawPortionPerServing: 0.05,
    portionCost: 3, // (0.05 * 55) = ₹2.75 -> ₹3
    caloriesPerServing: 175,
    proteinPerServing: 3.3,
    carbsPerServing: 38,
    fatPerServing: 0.8,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Retail Poha avg ₹55/kg. Portion: 50g = ₹2.75',
  },

  // Pulses & Legumes
  'moong-dal-1': {
    id: 'moong-dal-1',
    name: 'Yellow Moong Dal (Tadka)',
    category: 'Pulses & Legumes',
    standardServing: '1 medium bowl (150g cooked)',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 125, // Yellow Moong dal ₹125/kg (Agmarknet benchmark)
    rawPortionPerServing: 0.04, // 40g raw yields 150g cooked bowl
    portionCost: 7, // (0.04 * 125) + ₹2 tadka/spices = ₹7.00
    caloriesPerServing: 165,
    proteinPerServing: 10.5,
    carbsPerServing: 25,
    fatPerServing: 3.0,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Agmarknet / Dept Consumer Affairs Moong Dal avg ₹125/kg + spices',
  },
  'toor-dal-1': {
    id: 'toor-dal-1',
    name: 'Toor / Arhar Dal (Cooked)',
    category: 'Pulses & Legumes',
    standardServing: '1 medium bowl (150g cooked)',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 155, // Toor dal ₹155/kg
    rawPortionPerServing: 0.04,
    portionCost: 8, // (0.04 * 155) + ₹2 = ₹8.20 -> ₹8
    caloriesPerServing: 175,
    proteinPerServing: 11.0,
    carbsPerServing: 26,
    fatPerServing: 3.5,
    dietType: 'vegan',
    allergens: [],
    cheaperAlternativeId: 'chana-dal-1',
    cheaperAlternativeReason: 'Chana dal or Moong dal delivers comparable protein at ₹5.50–₹7 per bowl vs ₹8 for Toor dal',
    pricingSourceNote: 'Dept of Consumer Affairs Toor Dal avg ₹155/kg',
  },
  'chana-dal-1': {
    id: 'chana-dal-1',
    name: 'Chana Dal (Bengal Gram)',
    category: 'Pulses & Legumes',
    standardServing: '1 bowl (150g cooked)',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 95, // Chana dal ₹95/kg
    rawPortionPerServing: 0.04,
    portionCost: 5.5, // (0.04 * 95) + ₹1.70 = ₹5.50
    caloriesPerServing: 180,
    proteinPerServing: 12.0,
    carbsPerServing: 27,
    fatPerServing: 3.2,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Agmarknet Chana Dal avg ₹95/kg. Extremely affordable pulse',
  },
  'rajma-1': {
    id: 'rajma-1',
    name: 'Kidney Beans / Rajma Curry',
    category: 'Pulses & Legumes',
    standardServing: '1 bowl (180g with gravy)',
    servingGrams: 180,
    referenceUnit: 'kg',
    marketRatePerUnit: 140, // Red Rajma ₹140/kg
    rawPortionPerServing: 0.05, // 50g raw rajma
    portionCost: 9, // (0.05 * 140) + ₹2 tomato/onion gravy = ₹9.00
    caloriesPerServing: 220,
    proteinPerServing: 12.5,
    carbsPerServing: 34,
    fatPerServing: 4.0,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Retail Rajma avg ₹140/kg + onion/tomato gravy base',
  },
  'chickpeas-chhole-1': {
    id: 'chickpeas-chhole-1',
    name: 'Spiced Chickpeas (Chhole Curry)',
    category: 'Pulses & Legumes',
    standardServing: '1 bowl (160g cooked)',
    servingGrams: 160,
    referenceUnit: 'kg',
    marketRatePerUnit: 130, // Kabuli chana ₹130/kg
    rawPortionPerServing: 0.05,
    portionCost: 8.5, // (0.05 * 130) + ₹2 = ₹8.50
    caloriesPerServing: 230,
    proteinPerServing: 13.0,
    carbsPerServing: 36,
    fatPerServing: 4.2,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Kabuli Chana retail avg ₹130/kg',
  },
  'sprouts-moong-1': {
    id: 'sprouts-moong-1',
    name: 'Sprouted Green Moong Salad',
    category: 'Pulses & Legumes',
    standardServing: '1 bowl (100g sprouted)',
    servingGrams: 100,
    referenceUnit: 'kg',
    marketRatePerUnit: 120, // Whole green moong ₹120/kg
    rawPortionPerServing: 0.04, // 40g raw whole moong yields 100g fresh sprouts
    portionCost: 5, // (0.04 * 120) = ₹4.80 -> ₹5
    caloriesPerServing: 105,
    proteinPerServing: 7.5,
    carbsPerServing: 19,
    fatPerServing: 0.8,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Whole Green Moong ₹120/kg yields 2.5x weight in homemade sprouts',
  },

  // Plant Protein
  'soya-chunks-1': {
    id: 'soya-chunks-1',
    name: 'Soya Chunks / Mealmaker',
    category: 'Plant Protein',
    standardServing: '40g dry (~120g rehydrated)',
    servingGrams: 40,
    referenceUnit: 'kg',
    marketRatePerUnit: 130, // Fortune / Nutrela Soya chunks ₹130/kg (₹26 per 200g box)
    rawPortionPerServing: 0.04,
    portionCost: 5, // (0.04 * 130) = ₹5.20 -> ₹5 for massive 21g protein!
    caloriesPerServing: 140,
    proteinPerServing: 21.0,
    carbsPerServing: 13,
    fatPerServing: 0.4,
    dietType: 'vegan',
    allergens: ['soy'],
    cheaperAlternativeReason: 'Unmatched 52% protein density at ₹5 per 21g protein (best value in India)',
    pricingSourceNote: 'Retail 200g pack ₹26 = ₹130/kg. 40g dry portion = ₹5.20',
  },
  'tofu-1': {
    id: 'tofu-1',
    name: 'Fresh Firm Tofu',
    category: 'Plant Protein',
    standardServing: '100g block portion',
    servingGrams: 100,
    referenceUnit: 'kg',
    marketRatePerUnit: 250, // Retail firm tofu ₹250/kg
    rawPortionPerServing: 0.1,
    portionCost: 25, // 100g = ₹25
    caloriesPerServing: 125,
    proteinPerServing: 13.0,
    carbsPerServing: 3.0,
    fatPerServing: 7.0,
    dietType: 'vegan',
    allergens: ['soy'],
    cheaperAlternativeId: 'soya-chunks-1',
    cheaperAlternativeReason: 'Soya chunks deliver 21g protein for ₹5 vs Tofu delivering 13g protein for ₹25 (save ₹20)',
    pricingSourceNote: 'Retail Firm Tofu 200g pack ₹50 = ₹250/kg',
  },

  // Dairy
  'milk-cow-1': {
    id: 'milk-cow-1',
    name: 'Toned Cow Milk (Amul / Mother Dairy)',
    category: 'Dairy',
    standardServing: '1 glass (200ml)',
    servingGrams: 200,
    referenceUnit: 'litre',
    marketRatePerUnit: 56, // Amul Taaza / Mother Dairy Toned Milk ₹56/litre (₹28/500ml)
    rawPortionPerServing: 0.2, // 200ml
    portionCost: 11, // (0.2 * 56) = ₹11.20 -> ₹11
    caloriesPerServing: 120,
    proteinPerServing: 6.5,
    carbsPerServing: 9.5,
    fatPerServing: 6.0,
    dietType: 'vegetarian',
    allergens: ['milk'],
    pricingSourceNote: 'Amul Taaza / Mother Dairy Toned Milk MRP ₹28 per 500ml pouch (₹56/litre)',
  },
  'curd-1': {
    id: 'curd-1',
    name: 'Fresh Plain Curd / Dahi',
    category: 'Dairy',
    standardServing: '1 bowl (100g)',
    servingGrams: 100,
    referenceUnit: 'kg',
    marketRatePerUnit: 60, // Amul Masti Dahi ₹30/400g = ₹75/kg, homemade from ₹56 milk = ₹56/kg
    rawPortionPerServing: 0.1,
    portionCost: 6, // 100g portion = ₹6.00
    caloriesPerServing: 65,
    proteinPerServing: 3.5,
    carbsPerServing: 4.5,
    fatPerServing: 3.2,
    dietType: 'vegetarian',
    allergens: ['milk'],
    pricingSourceNote: 'Homemade curd from toned milk (₹56/litre) or retail pouch (₹30/400g)',
  },
  'paneer-1': {
    id: 'paneer-1',
    name: 'Fresh Paneer (Cottage Cheese)',
    category: 'Dairy',
    standardServing: '100g portion',
    servingGrams: 100,
    referenceUnit: 'kg',
    marketRatePerUnit: 400, // Loose dairy paneer ₹380-₹420/kg (Amul Malai ₹450/kg)
    rawPortionPerServing: 0.1,
    portionCost: 40, // 100g = ₹40.00
    caloriesPerServing: 265,
    proteinPerServing: 18.0,
    carbsPerServing: 4.0,
    fatPerServing: 20.0,
    dietType: 'vegetarian',
    allergens: ['milk'],
    cheaperAlternativeId: 'soya-chunks-1',
    cheaperAlternativeReason: 'Swap Paneer (₹40) with Soya Chunks (₹5) or Eggs (₹13) to save ₹27–35 per meal while gaining more protein',
    pricingSourceNote: 'Local Dairy Paneer avg ₹380-₹400/kg; Packaged ₹440/kg',
  },

  // Eggs & Meat
  'whole-eggs-2': {
    id: 'whole-eggs-2',
    name: 'Fresh Whole Eggs (Boiled / Omelette)',
    category: 'Eggs & Meat',
    standardServing: '2 large eggs (~100g)',
    servingGrams: 100,
    referenceUnit: 'piece',
    marketRatePerUnit: 6.5, // Indian retail egg rate ₹6.00 - ₹7.00/egg (NECC average)
    rawPortionPerServing: 2,
    portionCost: 13, // 2 eggs * ₹6.50 = ₹13.00
    caloriesPerServing: 145,
    proteinPerServing: 12.6,
    carbsPerServing: 1.0,
    fatPerServing: 10.0,
    dietType: 'eggetarian',
    allergens: ['eggs'],
    pricingSourceNote: 'NECC / Indian Retail daily egg price avg ₹6.50/egg',
  },
  'egg-whites-3': {
    id: 'egg-whites-3',
    name: 'Boiled Egg Whites Only',
    category: 'Eggs & Meat',
    standardServing: '3 egg whites (~100g)',
    servingGrams: 100,
    referenceUnit: 'piece',
    marketRatePerUnit: 6.5,
    rawPortionPerServing: 3,
    portionCost: 19.5, // 3 * ₹6.50 = ₹19.50
    caloriesPerServing: 52,
    proteinPerServing: 11.0,
    carbsPerServing: 0.7,
    fatPerServing: 0.2,
    dietType: 'eggetarian',
    allergens: ['eggs'],
    cheaperAlternativeId: 'whole-eggs-2',
    cheaperAlternativeReason: 'Eating whole eggs keeps cholesterol in check when active, provides healthy fats & choline, and avoids yolk waste',
    pricingSourceNote: '3 retail eggs at ₹6.50/egg = ₹19.50',
  },
  'chicken-curry-1': {
    id: 'chicken-curry-1',
    name: 'Homestyle Chicken Curry',
    category: 'Eggs & Meat',
    standardServing: '120g bone-in chicken + gravy',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 230, // Dressed broiler chicken ₹220-₹240/kg
    rawPortionPerServing: 0.12,
    portionCost: 30, // (0.12 * 230) + ₹2.40 gravy = ₹30.00
    caloriesPerServing: 220,
    proteinPerServing: 24.0,
    carbsPerServing: 5.0,
    fatPerServing: 11.0,
    dietType: 'non_vegetarian',
    allergens: [],
    cheaperAlternativeId: 'whole-eggs-2',
    cheaperAlternativeReason: '2 Whole Eggs (₹13) or Soya Chunks (₹5) save ₹17–25/meal with comparable protein',
    pricingSourceNote: 'Retail Broiler Chicken ₹230/kg. Portion: 120g = ₹27.60 + cooking base',
  },
  'chicken-breast-1': {
    id: 'chicken-breast-1',
    name: 'Boneless Chicken Breast (Grilled/Cooked)',
    category: 'Eggs & Meat',
    standardServing: '100g cooked (~120g raw boneless)',
    servingGrams: 100,
    referenceUnit: 'kg',
    marketRatePerUnit: 340, // Boneless chicken breast ₹320-₹360/kg
    rawPortionPerServing: 0.12,
    portionCost: 40, // (0.12 * 340) = ₹40.80 -> ₹40
    caloriesPerServing: 165,
    proteinPerServing: 31.0,
    carbsPerServing: 0.0,
    fatPerServing: 3.6,
    dietType: 'non_vegetarian',
    allergens: [],
    cheaperAlternativeId: 'chicken-curry-1',
    cheaperAlternativeReason: 'Regular curry cut chicken costs ₹30 vs ₹40 for boneless breast, saving ₹10/meal',
    pricingSourceNote: 'Retail Boneless Chicken Breast avg ₹340/kg',
  },
  'fish-rohu-1': {
    id: 'fish-rohu-1',
    name: 'Fresh Local Fish (Rohu / Catla Pan-seared)',
    category: 'Eggs & Meat',
    standardServing: '120g portion',
    servingGrams: 120,
    referenceUnit: 'kg',
    marketRatePerUnit: 220, // Local freshwater fish ₹200-₹240/kg
    rawPortionPerServing: 0.12,
    portionCost: 26, // (0.12 * 220) = ₹26.40 -> ₹26
    caloriesPerServing: 150,
    proteinPerServing: 23.0,
    carbsPerServing: 0.0,
    fatPerServing: 5.5,
    dietType: 'non_vegetarian',
    allergens: ['fish'],
    cheaperAlternativeId: 'whole-eggs-2',
    cheaperAlternativeReason: 'Swap fish for eggs or lentils on tight-budget days to save ₹13/meal',
    pricingSourceNote: 'Wholesale / Retail Mandi Rohu Fish avg ₹220/kg',
  },

  // Vegetables
  'mixed-veg-curry-1': {
    id: 'mixed-veg-curry-1',
    name: 'Seasonal Mixed Veggie Sabzi',
    category: 'Vegetables',
    standardServing: '1 bowl (150g)',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 45, // Seasonal Indian sabzi vegetables avg ₹40-₹50/kg
    rawPortionPerServing: 0.15,
    portionCost: 7, // (0.15 * 45) = ₹6.75 -> ₹7
    caloriesPerServing: 90,
    proteinPerServing: 3.0,
    carbsPerServing: 12.0,
    fatPerServing: 3.5,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Agmarknet Seasonal Indian Vegetables avg ₹45/kg',
  },
  'spinach-palak-1': {
    id: 'spinach-palak-1',
    name: 'Sautéed Spinach / Palak Sabzi',
    category: 'Vegetables',
    standardServing: '1 bowl (120g)',
    servingGrams: 120,
    referenceUnit: 'kg',
    marketRatePerUnit: 40, // Fresh Palak bunches avg ₹15-20 per bunch (~400g) = ₹40/kg
    rawPortionPerServing: 0.15,
    portionCost: 6, // (0.15 * 40) = ₹6.00
    caloriesPerServing: 45,
    proteinPerServing: 3.5,
    carbsPerServing: 4.5,
    fatPerServing: 1.5,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Local Mandi Palak bunch avg ₹15 per 400g',
  },
  'cucumber-tomato-salad-1': {
    id: 'cucumber-tomato-salad-1',
    name: 'Fresh Cucumber & Tomato Salad',
    category: 'Vegetables',
    standardServing: '1 large bowl (150g)',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 35, // Cucumber ₹35/kg, Tomato ₹30/kg
    rawPortionPerServing: 0.15,
    portionCost: 5, // (0.15 * 35) = ₹5.25 -> ₹5
    caloriesPerServing: 35,
    proteinPerServing: 1.5,
    carbsPerServing: 7.0,
    fatPerServing: 0.3,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Retail Cucumber/Tomato weighted avg ₹35/kg',
  },

  // Fruits
  'banana-1': {
    id: 'banana-1',
    name: 'Fresh Banana (Robusta / Yelakki)',
    category: 'Fruits',
    standardServing: '1 medium fruit (100g)',
    servingGrams: 100,
    referenceUnit: 'dozen',
    marketRatePerUnit: 60, // ₹50-₹60 per dozen = ₹5.00 per banana
    rawPortionPerServing: 1 / 12,
    portionCost: 5, // ₹5.00 per fruit
    caloriesPerServing: 90,
    proteinPerServing: 1.1,
    carbsPerServing: 23.0,
    fatPerServing: 0.3,
    dietType: 'vegan',
    allergens: [],
    cheaperAlternativeReason: 'Most cost-effective healthy carbohydrate & potassium source in India (₹5)',
    pricingSourceNote: 'Retail Banana rate ₹60/dozen = ₹5.00 per piece',
  },
  'guava-1': {
    id: 'guava-1',
    name: 'Local Guava (Amrood)',
    category: 'Fruits',
    standardServing: '1 medium fruit (120g)',
    servingGrams: 120,
    referenceUnit: 'kg',
    marketRatePerUnit: 60, // Local Indian guava ₹50-₹70/kg
    rawPortionPerServing: 0.12,
    portionCost: 7, // (0.12 * 60) = ₹7.20 -> ₹7
    caloriesPerServing: 68,
    proteinPerServing: 2.6,
    carbsPerServing: 14.0,
    fatPerServing: 1.0,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Retail Guava avg ₹60/kg. High Vitamin C and fiber',
  },
  'papaya-1': {
    id: 'papaya-1',
    name: 'Fresh Papaya Slices',
    category: 'Fruits',
    standardServing: '1 bowl (150g)',
    servingGrams: 150,
    referenceUnit: 'kg',
    marketRatePerUnit: 50, // Whole papaya ₹40-₹50/kg
    rawPortionPerServing: 0.15,
    portionCost: 7.5, // (0.15 * 50) = ₹7.50
    caloriesPerServing: 60,
    proteinPerServing: 0.8,
    carbsPerServing: 15.0,
    fatPerServing: 0.4,
    dietType: 'vegan',
    allergens: [],
    pricingSourceNote: 'Retail Papaya avg ₹50/kg',
  },

  // Nuts & Seeds
  'roasted-peanuts-1': {
    id: 'roasted-peanuts-1',
    name: 'Roasted Peanuts (Groundnuts)',
    category: 'Nuts & Seeds',
    standardServing: '30g portion',
    servingGrams: 30,
    referenceUnit: 'kg',
    marketRatePerUnit: 150, // Raw/roasted groundnut ₹140-₹160/kg
    rawPortionPerServing: 0.03,
    portionCost: 4.5, // (0.03 * 150) = ₹4.50
    caloriesPerServing: 170,
    proteinPerServing: 7.8,
    carbsPerServing: 5.0,
    fatPerServing: 14.0,
    dietType: 'vegan',
    allergens: ['peanuts'],
    cheaperAlternativeReason: 'Delivers healthy mono-unsaturated fats & 7.8g protein for less than ₹5',
    pricingSourceNote: 'Wholesale/Retail Groundnuts avg ₹150/kg',
  },
  'roasted-chana-1': {
    id: 'roasted-chana-1',
    name: 'Roasted Bengal Gram (Bhuna Chana)',
    category: 'Nuts & Seeds',
    standardServing: '40g portion',
    servingGrams: 40,
    referenceUnit: 'kg',
    marketRatePerUnit: 150, // Roasted chana ₹140-₹160/kg
    rawPortionPerServing: 0.04,
    portionCost: 6, // (0.04 * 150) = ₹6.00
    caloriesPerServing: 150,
    proteinPerServing: 8.5,
    carbsPerServing: 22.0,
    fatPerServing: 2.5,
    dietType: 'vegan',
    allergens: [],
    cheaperAlternativeReason: 'Clean high-fiber roasted pulse snack with 8.5g protein for ₹6',
    pricingSourceNote: 'Retail Bhuna Chana avg ₹150/kg',
  },
};

/**
 * Calculates portion cost for a food item given quantity multiplier and optional user overrides.
 */
export function getFoodPortionCost(
  foodId: string,
  quantity: number = 1,
  customPrices?: Record<string, number>
): number {
  if (customPrices && customPrices[foodId] !== undefined) {
    return Math.round(customPrices[foodId] * quantity * 10) / 10;
  }
  const ref = INDIAN_RETAIL_PRICE_DB[foodId];
  if (ref) {
    return Math.round(ref.portionCost * quantity * 10) / 10;
  }
  return 10 * quantity;
}
