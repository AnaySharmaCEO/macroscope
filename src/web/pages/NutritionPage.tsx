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

  const getStatusTokens = (st: string) => {
    switch (st) {
      case 'stable': 
        return { color: 'var(--good)', bg: 'var(--good-soft)', label: 'Stable' };
      case 'imbalanced': 
        return { color: 'var(--warn)', bg: 'var(--warn-soft)', label: 'Imbalanced' };
      case 'low': 
        return { color: 'var(--danger)', bg: 'var(--danger-soft)', label: 'Low' };
      default: 
        return { color: 'var(--text-3)', bg: 'var(--surface-2)', label: 'Stable' };
    }
  };

  const statusTokens = getStatusTokens(status);

  // Add Meal Panel
  if (activePanel === 'addMeal') {
    return (
      <PanelLayout title="Log meal" onBack={() => setActivePanel(null)}>
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            <SearchableInput
              label="Meal name"
              value={mealName}
              onChange={setMealName}
              onSearch={handleSearchFood}
              onSelect={handleSelectFood}
              searchResults={searchResults}
              getItemLabel={(item) => item.name}
              getItemDescription={(item) => `${item.calories} kcal • P: ${item.protein}g C: ${item.carbs}g F: ${item.fat}g • ${item.serving}`}
              placeholder="Search for food..."
              searching={searching}
            />
            
            <InputField
              label="Meal time (optional)"
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
              <div className="flex flex-col gap-1.5">
                <label 
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--text-3)',
                    fontWeight: 'var(--weight-medium)',
                  }}
                >
                  Unit
                </label>
                <select
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    borderRadius: 'var(--input-radius)',
                    color: 'var(--input-text)',
                    fontSize: 'var(--input-font-size)',
                    padding: 'var(--input-padding)',
                  }}
                  className="border focus:outline-none focus:border-[var(--input-border-focus)] focus:ring-2 focus:ring-[var(--accent)]/30"
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
              label="Meal type"
              value={mealType}
              onChange={(value) => setMealType(value as MealType)}
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'snack', label: 'Snacks' },
              ]}
            />

            {calories > 0 && (
              <div 
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: 'var(--space-4)',
                }}
              >
                <div 
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--text-3)',
                    fontWeight: 'var(--weight-semibold)',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  Nutrition preview
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-3)',
                    }}
                    className="flex justify-between border"
                  >
                    <span style={{ color: 'var(--text-2)', fontSize: 'var(--text-body-sm)' }}>Calories</span>
                    <span style={{ color: 'var(--text)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-body)' }}>{calories} kcal</span>
                  </div>
                  <div 
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-3)',
                    }}
                    className="flex justify-between border"
                  >
                    <span style={{ color: 'var(--text-2)', fontSize: 'var(--text-body-sm)' }}>Protein</span>
                    <span style={{ color: 'var(--text)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-body)' }}>{protein}g</span>
                  </div>
                  <div 
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-3)',
                    }}
                    className="flex justify-between border"
                  >
                    <span style={{ color: 'var(--text-2)', fontSize: 'var(--text-body-sm)' }}>Carbs</span>
                    <span style={{ color: 'var(--text)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-body)' }}>{carbs}g</span>
                  </div>
                  <div 
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-3)',
                    }}
                    className="flex justify-between border"
                  >
                    <span style={{ color: 'var(--text-2)', fontSize: 'var(--text-body-sm)' }}>Fat</span>
                    <span style={{ color: 'var(--text)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-body)' }}>{fat}g</span>
                  </div>
                </div>
              </div>
            )}

            <ActionButton
              onClick={handleAddMeal}
              disabled={submitting || !mealName || !calories}
              fullWidth
            >
              {submitting ? 'Adding...' : 'Add meal'}
            </ActionButton>
          </div>
        </div>
      </PanelLayout>
    );
  }

  // Meal Type Extended View
  if (activePanel) {
    const stats = getMealTypeStats(activePanel as MealType);
    const label = activePanel === 'snack' ? 'Snacks' : activePanel.charAt(0).toUpperCase() + activePanel.slice(1);

    return (
      <PanelLayout title={label} onBack={() => setActivePanel(null)}>
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
          <div 
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              borderRadius: 'var(--card-radius)',
              padding: 'var(--card-padding-sm)',
            }}
            className="flex justify-between items-center border"
          >
            <div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--text-3)' }}>Total meals</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text)', fontWeight: 'var(--weight-medium)' }}>
                {stats.count}
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--text-3)' }}>Calories</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text)', fontWeight: 'var(--weight-medium)' }}>
                {stats.calories} <span style={{ fontSize: '14px', color: 'var(--text-3)' }}>kcal</span>
              </div>
            </div>
          </div>

          {stats.meals.length === 0 ? (
            <div 
              style={{
                color: 'var(--text-3)',
                padding: 'var(--space-8)',
                textAlign: 'center',
                fontSize: 'var(--text-body)',
              }}
            >
              No {label.toLowerCase()} logged today.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.meals.map((meal) => (
                <div 
                  key={meal.id} 
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-4)',
                  }}
                  className="border flex justify-between items-start"
                >
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-body)' }}>
                      {meal.name}
                    </div>
                    <div style={{ color: 'var(--text-3)', fontSize: 'var(--text-caption)', marginTop: '2px' }}>
                      {meal.time} • {meal.calories} kcal • P: {meal.protein}g C: {meal.carbs}g F: {meal.fat}g
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeal(meal.id)}
                    style={{
                      color: 'var(--danger)',
                      fontSize: 'var(--text-caption)',
                      padding: '4px 8px',
                    }}
                    className="hover:underline focus-visible:outline-none"
                  >
                    Remove
                  </button>
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
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--text)',
              lineHeight: '1.2',
            }}
            className="mb-1"
          >
            Nutrition system
          </h1>
          <p 
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-2)',
            }}
          >
            Monitor macronutrient pacing, caloric thresholds, and metabolic recovery
          </p>
        </div>

        {/* System State Pill */}
        <span 
          style={{
            backgroundColor: statusTokens.bg,
            color: statusTokens.color,
            borderRadius: 'var(--radius-pill)',
            padding: '5px 12px',
            fontSize: '11.5px',
            fontWeight: 'var(--weight-bold)',
          }}
          className="inline-flex items-center gap-1.5"
        >
          <span>●</span>
          <span>{statusTokens.label}</span>
        </span>
      </div>

      {/* 2-Column Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5 items-start">
        {/* LEFT COLUMN: Hero Caloric/Macro Card & Actions */}
        <div className="flex flex-col gap-5">
          {/* Dominant Hero Card */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow)',
              padding: '28px 30px',
            }}
          >
            {/* Primary Calorie Metric */}
            <div className="mb-6">
              <div 
                style={{
                  fontSize: '12px',
                  color: 'var(--text-3)',
                  fontWeight: 'var(--weight-semibold)',
                  marginBottom: '4px',
                }}
              >
                Calories consumed today
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span 
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '36px',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text)',
                    lineHeight: '1.1',
                  }}
                >
                  {todayCalories}
                </span>
                <span 
                  style={{
                    fontSize: '18px',
                    color: 'var(--text-3)',
                  }}
                >
                  / {calorieTarget} kcal
                </span>
              </div>

              {/* Progress Bar */}
              <div 
                style={{
                  backgroundColor: 'var(--progress-track)',
                  height: '6px',
                  borderRadius: 'var(--radius-pill)',
                }}
                className="overflow-hidden"
              >
                <div 
                  style={{ 
                    width: `${Math.min((todayCalories / (calorieTarget || 2000)) * 100, 100)}%`,
                    backgroundColor: 'var(--accent)',
                    borderRadius: 'var(--radius-pill)',
                  }}
                  className="h-full transition-all duration-500 ease-out"
                />
              </div>
            </div>

            {/* Macro Pacing Bars */}
            <div 
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '20px',
              }}
              className="mb-6"
            >
              <div 
                style={{
                  fontSize: '12px',
                  color: 'var(--text-3)',
                  fontWeight: 'var(--weight-semibold)',
                  marginBottom: '14px',
                }}
              >
                Macronutrient breakdown
              </div>

              <div className="space-y-3.5">
                {[
                  { label: "Protein", value: todayProtein, target: proteinTarget, color: 'var(--chart-1)' },
                  { label: "Carbs", value: todayCarbs, target: carbsTarget, color: 'var(--chart-3)' },
                  { label: "Fat", value: todayFat, target: fatTarget, color: 'var(--chart-4)' }
                ].map((macro) => {
                  const progress = Math.min((macro.value / (macro.target || 1)) * 100, 100);

                  return (
                    <div key={macro.label}>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span style={{ color: 'var(--text)', fontWeight: 'var(--weight-medium)' }}>
                          {macro.label}
                        </span>
                        <span style={{ color: 'var(--text)' }}>
                          <b>{macro.value}g</b> <span style={{ color: 'var(--text-3)' }}>/ {macro.target}g</span>
                        </span>
                      </div>

                      <div 
                        style={{
                          backgroundColor: 'var(--progress-track)',
                          height: '4px',
                          borderRadius: 'var(--radius-pill)',
                        }}
                        className="overflow-hidden"
                      >
                        <div
                          style={{
                            width: `${progress}%`,
                            backgroundColor: macro.color,
                            borderRadius: 'var(--radius-pill)',
                          }}
                          className="h-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Signal Block */}
            {signals.length > 0 && (
              <div 
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  fontSize: '13.5px',
                  color: 'var(--text-2)',
                  lineHeight: '1.55',
                  marginBottom: '20px',
                }}
                className="border"
              >
                {signals[0].message}
              </div>
            )}

            {/* Primary Action Button */}
            <ActionButton
              variant="primary"
              onClick={() => setActivePanel('addMeal')}
              fullWidth
            >
              Log a meal
            </ActionButton>
          </div>

          {/* Daily Micronutrient Insights */}
          {dailyInsights && (
            <div 
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow)',
                padding: '24px 26px',
              }}
            >
              <div 
                style={{
                  fontSize: '12px',
                  color: 'var(--text-3)',
                  fontWeight: 'var(--weight-semibold)',
                  marginBottom: '12px',
                }}
              >
                Micronutrient tracking
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Calcium', value: dailyInsights.calcium_percent },
                  { label: 'Iron', value: dailyInsights.iron_percent },
                  { label: 'Magnesium', value: dailyInsights.magnesium_percent },
                ].map((n) => (
                  <div 
                    key={n.label} 
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                    }}
                    className="border"
                  >
                    <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>
                      {n.label}
                    </div>
                    <div 
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '20px',
                        fontWeight: 'var(--weight-medium)',
                        color: 'var(--text)',
                        marginTop: '2px',
                      }}
                    >
                      {Math.round(n.value)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Meals Breakdown & Supporting Cards */}
        <div className="flex flex-col gap-4">
          {/* 1. Today's Meals Summary Card */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ padding: '10px 14px 6px', fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-3)' }}>
              Today's meal timeline
            </div>

            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type, idx) => {
              const stats = getMealTypeStats(type);
              const label = type === 'snack' ? 'Snacks' : type.charAt(0).toUpperCase() + type.slice(1);
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActivePanel(type)}
                  style={{
                    borderTop: idx > 0 ? '1px solid var(--border)' : undefined,
                    borderRadius: '10px',
                  }}
                  className="w-full flex justify-between items-center px-3.5 py-3 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 'var(--weight-semibold)', color: 'var(--text)' }}>
                      {label}
                    </div>
                    <small style={{ color: 'var(--text-2)', fontSize: '11.5px', display: 'block', marginTop: '1px' }}>
                      {stats.count === 0 ? 'Not logged' : `${stats.count} ${stats.count === 1 ? 'item' : 'items'}`}
                    </small>
                  </div>
                  <span 
                    style={{
                      backgroundColor: stats.calories > 0 ? 'var(--accent-soft)' : 'var(--surface-2)',
                      color: stats.calories > 0 ? 'var(--accent)' : 'var(--text-3)',
                      fontSize: '11px',
                      fontWeight: 'var(--weight-bold)',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    {stats.calories > 0 ? `${stats.calories} kcal` : '—'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2. Suggested Foods */}
          {suggestedFoods.length > 0 && (
            <div 
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px 22px',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div 
                style={{
                  fontSize: '12px',
                  color: 'var(--text-3)',
                  fontWeight: 'var(--weight-semibold)',
                  marginBottom: '10px',
                }}
              >
                Suggested nutrient boosters
              </div>
              <div className="space-y-2">
                {suggestedFoods.slice(0, 4).map((f) => (
                  <div 
                    key={f.food_id} 
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                    }}
                    className="border flex items-center justify-between"
                  >
                    <div style={{ fontSize: '12.5px', color: 'var(--text)' }}>
                      {f.food_name}
                    </div>
                    <span 
                      style={{
                        backgroundColor: 'var(--good-soft)',
                        color: 'var(--good)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '2px 7px',
                        fontSize: '10.5px',
                        fontWeight: 'var(--weight-bold)',
                      }}
                    >
                      Optimal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Cross-System Pattern Teaser */}
          <div 
            style={{
              background: 'linear-gradient(160deg, var(--surface), var(--surface-2))',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px 24px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div 
              style={{
                fontSize: '12px',
                color: 'var(--accent)',
                fontWeight: 'var(--weight-bold)',
                marginBottom: '8px',
              }}
            >
              Metabolic pattern
            </div>
            <p 
              style={{
                fontSize: '13.5px',
                color: 'var(--text-2)',
                lineHeight: '1.55',
              }}
            >
              Meeting 80%+ of your daily protein target consistently elevates daytime physical output and steadies resting sleep heart rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}