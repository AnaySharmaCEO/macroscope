/**
 * MACROSCOPE PERFORMANCE OS - NUTRITION PAGE
 * Nutrition system monitoring and control
 */

import { useState } from 'react';
import { useNutritionSystem } from '../../core/hooks';
import { useSettings } from '../../core/hooks/useSettings';
import { foodDatabaseService, FoodItem } from '../../core/services';
import { PanelLayout } from '../ui/components/PanelLayout';
import { InputField } from '../ui/components/InputField';
import { SearchableInput } from '../ui/components/SearchableInput';
import { SegmentedControl } from '../ui/components/SegmentedControl';
import { ActionButton } from '../ui/components/ActionButton';
import type { Meal } from '../../core/types';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type ActivePanel = null | 'addMeal' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function NutritionPage() {
  const { nutritionData, status, signals, dailyInsights, suggestedFoods, loading, error, logMeal, removeMeal } = useNutritionSystem();
  const { settings } = useSettings();

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  // Form state
  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [quantity, setQuantity] = useState<number>(100);
  const [quantityUnit, setQuantityUnit] = useState<'grams' | 'cup' | 'bowl' | 'piece'>('grams');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearchFood = async (query: string) => {
    try {
      setSearching(true);
      const results = await foodDatabaseService.searchFood(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search food:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleManualEdit = () => {
    // If user edits macros/calories manually, treat as custom entry rather than DB food.
    setSelectedFoodId(null);
  };

  const handleSelectFood = (food: FoodItem) => {
    setMealName(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
    setSelectedFoodId(food.id);
    setQuantity(100);
    setQuantityUnit('grams');
  };

  const handleAddMeal = async () => {
    if (!mealName || !calories) return;

    try {
      setSubmitting(true);
      await logMeal(new Date(), {
        name: mealName,
        time: mealTime || new Date().toTimeString().slice(0, 5),
        mealType,
        foodId: selectedFoodId ?? undefined,
        quantity: Number(quantity) || 100,
        quantityUnit,
        // If a food was selected from DB, values are per-100g (as returned by search).
        // For manual entry, treat values as totals for the entered quantity.
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      // Reset form and close panel
      setMealName('');
      setMealTime('');
      setMealType('breakfast');
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);
      setSelectedFoodId(null);
      setQuantity(100);
      setQuantityUnit('grams');
      setActivePanel(null);
    } catch (err) {
      console.error('Failed to add meal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMeal = async (mealId: string) => {
    try {
      await removeMeal(mealId);
    } catch (err) {
      console.error('Failed to remove meal:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[#737373]">Loading nutrition data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-sm text-[#dc2626]">Error: {error}</div>
      </div>
    );
  }

  // Calculate today's metrics
  const todayData = nutritionData.length > 0 ? nutritionData[nutritionData.length - 1] : null;
  const todayCalories = todayData?.calories || 0;
  const todayProtein = todayData?.protein || 0;
  const todayCarbs = todayData?.carbs || 0;
  const todayFat = todayData?.fat || 0;
  const todayMeals = todayData?.meals || [];

  // Targets from settings
  const calorieTarget = settings?.calorieTarget || 2200;
  const proteinTarget = Math.round(calorieTarget * 0.30 / 4); // 30% of calories from protein
  const carbsTarget = Math.round(calorieTarget * 0.40 / 4); // 40% from carbs
  const fatTarget = Math.round(calorieTarget * 0.30 / 9); // 30% from fat

  // Group meals by type
  const getMealsByType = (type: MealType) => {
    const typeMap: Record<MealType, string[]> = {
      breakfast: ['breakfast'],
      lunch: ['lunch'],
      dinner: ['dinner'],
      snack: ['snack', 'snacks']
    };
    
    // Prefer explicit mealType from DB, fallback to time heuristic for legacy rows.
    return todayMeals.filter(meal => {
      if (meal.mealType) {
        if (type === 'snack') return meal.mealType === 'snack';
        return meal.mealType === type;
      }
      const hour = parseInt(meal.time.split(':')[0]);
      if (type === 'breakfast') return hour >= 5 && hour < 11;
      if (type === 'lunch') return hour >= 11 && hour < 15;
      if (type === 'dinner') return hour >= 15 && hour < 22;
      return hour >= 22 || hour < 5; // snacks
    });
  };

  const getMealTypeStats = (type: MealType) => {
    const meals = getMealsByType(type);
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    return {
      count: meals.length,
      calories: totalCalories,
      meals
    };
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return '#10b981';
      case 'imbalanced': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#737373';
    }
  };

  // Add Meal Panel
  if (activePanel === 'addMeal') {
    return (
      <PanelLayout title="Log Meal" onBack={() => setActivePanel(null)}>
        <div className="p-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            <SearchableInput
              label="Meal Name"
              value={mealName}
              onChange={setMealName}
              onSearch={handleSearchFood}
              onSelect={handleSelectFood}
              searchResults={searchResults}
              getItemLabel={(item) => item.name}
              getItemDescription={(item) => `${item.calories} cal • P: ${item.protein}g C: ${item.carbs}g F: ${item.fat}g • ${item.serving}`}
              placeholder="Search for food..."
              searching={searching}
            />
            
            <InputField
              label="Meal Time (Optional)"
              value={mealTime}
              onChange={setMealTime}
              type="time"
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Quantity"
                value={quantity}
                onChange={(v) => setQuantity(Number(v))}
                type="number"
              />
              <div>
                <div className="text-xs tracking-wider uppercase text-[#737373] mb-2">Unit</div>
                <select
                  className="w-full p-3 rounded bg-[#0a0a0a] border border-[#262626] text-sm"
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value as any)}
                >
                  <option value="grams">grams</option>
                  <option value="cup">cup (~240g)</option>
                  <option value="bowl">bowl (~350g)</option>
                  <option value="piece">piece (~80g)</option>
                </select>
              </div>
            </div>

            <SegmentedControl
              label="Meal Type"
              value={mealType}
              onChange={(value) => setMealType(value as MealType)}
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'snack', label: 'Snacks' },
              ]}
            />

            {/* Auto-filled nutrition preview */}
            {calories > 0 && (
              <div className="pt-6 border-t border-[#262626]">
                <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">Nutrition Preview</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#737373]">Calories</span>
                    <span className="text-sm">{calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#737373]">Protein</span>
                    <span className="text-sm">{protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#737373]">Carbs</span>
                    <span className="text-sm">{carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#737373]">Fat</span>
                    <span className="text-sm">{fat}g</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              <ActionButton
                onClick={handleAddMeal}
                disabled={submitting || !mealName || !calories}
                fullWidth
              >
                {submitting ? 'Adding...' : 'Add Meal'}
              </ActionButton>
            </div>
          </div>
        </div>
      </PanelLayout>
    );
  }

  // Meal Type Panel (Breakfast, Lunch, Dinner, Snack)
  if (activePanel && activePanel !== 'addMeal') {
    const mealType = activePanel as MealType;
    const mealTypeLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    const stats = getMealTypeStats(mealType);

    return (
      <PanelLayout title={mealTypeLabel} onBack={() => setActivePanel(null)}>
        <div className="p-8 max-w-2xl mx-auto">
          {stats.meals.length === 0 ? (
            <div className="text-sm text-[#737373]">No meals logged for {mealTypeLabel.toLowerCase()}.</div>
          ) : (
            <div className="space-y-4">
              {stats.meals.map((meal) => (
                <div key={meal.id} className="pb-6 border-b border-[#262626] last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-lg">{meal.name}</div>
                    <ActionButton
                      onClick={() => handleRemoveMeal(meal.id)}
                      variant="danger"
                    >
                      Remove
                    </ActionButton>
                  </div>
                  <div className="text-sm text-[#737373]">
                    {meal.time} • {meal.calories} cal • P: {meal.protein}g C: {meal.carbs}g F: {meal.fat}g
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PanelLayout>
    );
  }

  // Main Nutrition Page
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl tracking-tight mb-2">Nutrition System</h1>
        <div className="text-sm text-[#737373]">Monitor nutrition and meal timing</div>
      </div>

      {/* System State */}
      <div className="mb-12">
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: getStatusColor(status) }}
          />
          <span className="text-sm uppercase tracking-wider text-[#737373]">
            {status}
          </span>
        </div>
      </div>

      {/* Primary Metric - CALORIES (DOMINANT) */}
      <div className="mb-12">
        <div className="text-xs tracking-wider uppercase mb-3 text-[#ffffff]">CALORIES</div>
        <div className="text-6xl tracking-tight mb-1">
          {todayCalories}<span className="text-3xl text-[#737373]"> / {calorieTarget}</span>
        </div>
        {/* Subtle progress bar */}
        <div className="mt-4 h-1 bg-[#262626] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00D4FF] transition-all duration-300"
            style={{ width: `${Math.min((todayCalories / calorieTarget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Secondary Metrics - MACROS */}
      <div className="mb-16">
  <div className="text-xs tracking-wider uppercase mb-4 text-[#a4a4a4]">MACROS</div>
  <div className="space-y-3">

    {[
      { label: "Protein", value: todayProtein, target: proteinTarget },
      { label: "Carbs", value: todayCarbs, target: carbsTarget },
      { label: "Fat", value: todayFat, target: fatTarget }
    ].map((macro) => {
      const progress = Math.min((macro.value / macro.target) * 100, 100);
      const hue = (progress / 100) * 120; // 0 = red, 60 = yellow, 120 = green

      return (
        <div key={macro.label}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[#ffffff]">{macro.label}</span>
            <span className="text-lg">
              {macro.value}g{" "}
              <span className="text-sm text-[#737373]">
                / {macro.target}g
              </span>
            </span>
          </div>

          <div className="h-0.5 bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: `hsl(${hue}, 80%, 50%)`
              }}
            />
          </div>
        </div>
      );
    })}

  </div>
</div>

      {/* Primary Signal */}
      {signals.length > 0 && (
        <div className="mb-16">
          <div className="text-xl leading-relaxed">
            {signals[0].message}
          </div>
        </div>
      )}

      {/* Daily Insights (DB) */}
      {dailyInsights && (
        <div className="mb-16">
          <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">DAILY INSIGHTS</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Calcium', value: dailyInsights.calcium_percent },
              { label: 'Iron', value: dailyInsights.iron_percent },
              { label: 'Magnesium', value: dailyInsights.magnesium_percent },
            ].map((n) => (
              <div key={n.label} className="p-4 border border-[#262626] rounded bg-[#0a0a0a]">
                <div className="text-sm text-[#737373]">{n.label} (RDA)</div>
                <div className="text-2xl mt-1">{Math.round(n.value)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Foods (DB) */}
      {suggestedFoods.length > 0 && (
        <div className="mb-16">
          <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">SUGGESTED FOODS</div>
          <div className="space-y-2">
            {suggestedFoods.slice(0, 6).map((f) => (
              <div key={f.food_id} className="p-4 border border-[#262626] rounded bg-[#0a0a0a] flex items-center justify-between">
                <div className="text-sm">{f.food_name}</div>
                <div className="text-xs text-[#737373]">score {Number(f.score).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Meal Card */}
      <div className="mb-8">
        <button
          onClick={() => setActivePanel('addMeal')}
          className="w-full text-left p-6 border border-[#262626] rounded bg-[#004D61] hover:border-[#404040] transition-colors"
        >
          <div className="text-3xl mb-1 text-center text-[#F0F0F0]">Add Meal</div>
          <div className="text-base text-center text-[#F0F0F0]">Tap to log a meal</div>
        </button>
      </div>

      {/* Meal Type Cards */}
      <div className="mb-16">
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">TODAY'S MEALS</div>
        <div className="grid grid-cols-2 gap-4">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
            const stats = getMealTypeStats(type);
            const label = type === 'snack' ? 'Snacks' : type.charAt(0).toUpperCase() + type.slice(1);
            
            return (
              <button
                key={type}
                onClick={() => setActivePanel(type)}
                className="text-left p-6 border border-[#262626] rounded bg-[#0a0a0a] hover:border-[#404040] transition-colors"
              >
                <div className="text-lg mb-2">{label}</div>
                <div className="text-sm text-[#737373]">
                  {stats.count} meal{stats.count !== 1 ? 's' : ''}
                  {stats.calories > 0 && ` • ~${stats.calories} kcal`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Signals */}
      {signals.length > 1 && (
        <div className="mb-12">
          <div className="text-xs tracking-wider uppercase text-[#737373] mb-3">ADDITIONAL SIGNALS</div>
          <div className="space-y-2">
            {signals.slice(1).map((signal) => (
              <div key={signal.id} className="text-sm text-[#737373]">
                {signal.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}