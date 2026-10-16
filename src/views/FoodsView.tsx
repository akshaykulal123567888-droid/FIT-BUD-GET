import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_FOOD_DATABASE, FoodItem } from '../data/foodDatabase';

export const FoodsView: React.FC = () => {
  const { user, updateFoodPrice, currency } = useApp();

  const customPrices = user?.customPrices || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietFilter, setDietFilter] = useState<string>('All');

  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);

  const categories = [
    'All',
    'Grains & Cereals',
    'Pulses & Legumes',
    'Plant Protein',
    'Dairy',
    'Eggs & Meat',
    'Vegetables',
    'Fruits',
    'Nuts & Seeds',
  ];

  const filteredFoods = INITIAL_FOOD_DATABASE.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;

    const matchesDiet =
      dietFilter === 'All' ||
      (dietFilter === 'Veg' && (food.dietType === 'vegetarian' || food.dietType === 'vegan')) ||
      (dietFilter === 'Vegan' && food.dietType === 'vegan') ||
      (dietFilter === 'Egg' && food.dietType === 'eggetarian') ||
      (dietFilter === 'Non-Veg' && food.dietType === 'non_vegetarian');

    return matchesSearch && matchesCategory && matchesDiet;
  });

  const handleStartEdit = (food: FoodItem) => {
    setEditingFoodId(food.id);
    setEditPriceValue(customPrices[food.id] ?? food.cost);
  };

  const handleSavePrice = async (foodId: string) => {
    await updateFoodPrice(foodId, editPriceValue);
    setEditingFoodId(null);
  };

  const handleResetPrice = async (foodId: string) => {
    const defaultCost = INITIAL_FOOD_DATABASE.find((f) => f.id === foodId)?.cost || 10;
    await updateFoodPrice(foodId, defaultCost);
    setEditingFoodId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Food Database & Local Prices</span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
              {INITIAL_FOOD_DATABASE.length} Staples Loaded
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prices vary across local grocery stores. Customize costs to match your exact neighborhood market rates.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#0d1736] rounded-3xl p-5 border border-[#1b2b54] shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search staples (e.g. Oats, Moong dal, Eggs, Soya, Peanuts)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="All">All Diets</option>
              <option value="Veg">Vegetarian & Vegan</option>
              <option value="Vegan">Vegan Only</option>
              <option value="Egg">Eggetarian</option>
              <option value="Non-Veg">Non-Vegetarian</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#0a1329] text-slate-400 hover:text-white hover:bg-[#0e1a3a] border border-[#1b2b54]/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map((food) => {
          const currentCost = customPrices[food.id] ?? food.cost;
          const isCustom = customPrices[food.id] !== undefined && customPrices[food.id] !== food.cost;
          const isEditing = editingFoodId === food.id;

          return (
            <div
              key={food.id}
              className="bg-[#0d1736] rounded-3xl p-5 border border-[#1b2b54] shadow-md flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                      {food.category}
                    </span>
                    <h3 className="font-extrabold text-white text-sm mt-1">{food.name}</h3>
                    <p className="text-[11px] text-slate-400">{food.servingSize}</p>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      food.dietType === 'vegan'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : food.dietType === 'vegetarian'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : food.dietType === 'eggetarian'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {food.dietType.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 p-2 bg-[#070d1e]/80 rounded-xl text-center text-xs border border-[#1b2b54]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Kcal</span>
                    <span className="font-bold text-white">{food.calories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Prot</span>
                    <span className="font-bold text-emerald-400">{food.protein}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Carbs</span>
                    <span className="font-bold text-slate-300">{food.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Fat</span>
                    <span className="font-bold text-slate-300">{food.fat}g</span>
                  </div>
                </div>

                {food.allergens.length > 0 && (
                  <p className="text-[10px] text-slate-500">
                    Contains: {food.allergens.join(', ')}
                  </p>
                )}
              </div>

              {/* Price & Edit Section */}
              <div className="pt-3 border-t border-[#1b2b54] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Local Store Cost:</span>
                  {!isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black text-amber-400">
                        {currency}{currentCost}
                      </span>
                      {isCustom && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                          Custom
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-slate-400 font-bold">{currency}</span>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={editPriceValue}
                        onChange={(e) => setEditPriceValue(parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-1.5 py-0.5 bg-[#070d1e] border border-blue-500 rounded font-bold text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(food)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#0e1a3a] hover:bg-blue-600 hover:text-white text-slate-200 font-bold text-xs rounded-xl border border-[#1b2b54] transition"
                    >
                      <Edit2 className="w-3 h-3 text-blue-400" />
                      <span>Edit Price</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSavePrice(food.id)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-bold shadow-sm shadow-blue-600/30"
                        title="Save price"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetPrice(food.id)}
                        className="p-1.5 bg-[#0e1a3a] hover:bg-[#16254c] text-slate-400 rounded-lg transition border border-[#1b2b54]"
                        title="Reset to default"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
