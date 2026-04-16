/**
 * MACROSCOPE PERFORMANCE OS - SUPABASE API
 */

import { supabase } from '../lib/supabaseClient';
import { SleepData, NutritionData, ActivityData, Meal, Workout, UserProfile } from './types';

// Profile photo is handled locally to avoid using Supabase storage
const PROFILE_PHOTO_KEY = 'macroscope_profile_photo';
const inMemoryStorage = new Map<string, string>();

const storage = {
  getItem(key: string): string | null {
    const s = typeof window !== 'undefined' ? window.localStorage : undefined;
    if (s) {
      return s.getItem(key);
    }
    return inMemoryStorage.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    const s = typeof window !== 'undefined' ? window.localStorage : undefined;
    if (s) {
      s.setItem(key, value);
      return;
    }
    inMemoryStorage.set(key, value);
  },
  removeItem(key: string) {
    const s = typeof window !== 'undefined' ? window.localStorage : undefined;
    if (s) {
      s.removeItem(key);
      return;
    }
    inMemoryStorage.delete(key);
  },
};

export const saveProfilePhoto = (photo: string) => {
  storage.setItem(PROFILE_PHOTO_KEY, photo);
};

export const getProfilePhoto = () => {
  return storage.getItem(PROFILE_PHOTO_KEY);
};

export const removeProfilePhoto = () => {
  storage.removeItem(PROFILE_PHOTO_KEY);
};

const toDateString = (d: Date) => d.toISOString().split('T')[0];

// --- AUTH --- //

export const login = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({ 
    email,
    options: { shouldCreateUser: true }
  });
  if (error) throw error;
  return { success: true };
};

export const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  
  if (error) throw error;
  return data.session;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// --- SHARED DB HELPERS --- //

export const getProfileTargets = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('calorie_target, protein_target, carb_target, fat_target, step_target, sleep_target')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const setCalorieTarget = async (userId: string, calorieTarget: number) => {
  const { error } = await supabase
    .from('profiles')
    .update({ calorie_target: calorieTarget, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
};

export const searchFoods = async (query: string) => {
  if (!query) return [];
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .ilike('food_name', `%${query}%`)
    .limit(20);
  if (error) throw error;
  return data ?? [];
};

export const getFoodById = async (foodId: string) => {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('id', foodId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
};

// --- PROFILE / ONBOARDING --- //

export const getProfile = async (userId: string, email?: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;

  // If profile row doesn't exist yet, create a minimal one.
  if (!data) {
    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: email ?? 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle();
    if (createError) throw createError;
    return mapDbProfileToUserProfile(created);
  }

  return mapDbProfileToUserProfile(data);
};

type DbProfileRow = {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bodyfat_percentage: number | null;
  goal_type: string | null;
  activity_level: string | null;
  dietary_preference: string | null;
  target_weight: number | null;
  calorie_target: number | null;
  protein_target: number | null;
  carb_target: number | null;
  fat_target: number | null;
  step_target: number | null;
  sleep_target: number | null;
  goal_timeline_weeks?: number | null;
  onboarding_complete: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const mapDbProfileToUserProfile = (row: DbProfileRow): UserProfile => {
  const goalMap: Record<string, UserProfile['goal']> = {
    maintain: 'maintain',
    recomposition: 'improve',
    improve: 'improve',
    fat_loss: 'lose',
    lose: 'lose',
    lean_bulk: 'gain',
    aggressive_bulk: 'gain',
    gain: 'gain',
  };

  const activityMap: Record<string, UserProfile['activityLevel']> = {
    sedentary: 'low',
    light: 'low',
    moderate: 'moderate',
    active: 'high',
    athlete: 'high',
    low: 'low',
    high: 'high',
  };

  const eatingMap: Record<string, UserProfile['eatingPattern']> = {
    light: 'light',
    balanced: 'balanced',
    heavy: 'heavy',
  };

  return {
    id: row.id,
    name: row.full_name ?? 'User',
    avatar: getProfilePhoto() ?? undefined,
    stepTarget: row.step_target ?? 8000,
    height: row.height_cm ?? 0,
    weight: Number(row.weight_kg ?? 0),
    age: row.age ?? undefined,
    gender: (row.gender as any) ?? undefined,
    bodyfatPercentage: Number(row.bodyfat_percentage ?? undefined),
    targetWeight: Number(row.target_weight ?? undefined),
    goalTimelineWeeks: Number(row.goal_timeline_weeks ?? undefined),
    goal: goalMap[String(row.goal_type ?? 'maintain')] ?? 'maintain',
    activityLevel: activityMap[String(row.activity_level ?? 'moderate')] ?? 'moderate',
    eatingPattern: eatingMap[String(row.dietary_preference ?? 'balanced')] ?? 'balanced',
    typicalSleepHours: Number(row.sleep_target ?? 7.5),
  };
};

const mapUserProfileUpdatesToDb = (updates: Partial<UserProfile>): Partial<DbProfileRow> => {
  const db: Partial<DbProfileRow> = {};
  if (updates.name !== undefined) db.full_name = updates.name;
  if (updates.height !== undefined) db.height_cm = updates.height;
  if (updates.weight !== undefined) db.weight_kg = updates.weight;
  if (updates.stepTarget !== undefined) db.step_target = updates.stepTarget;
  if (updates.typicalSleepHours !== undefined) db.sleep_target = updates.typicalSleepHours;
  if (updates.age !== undefined) db.age = updates.age as any;
  if (updates.gender !== undefined) db.gender = updates.gender as any;
  if (updates.bodyfatPercentage !== undefined) db.bodyfat_percentage = updates.bodyfatPercentage as any;
  if (updates.targetWeight !== undefined) db.target_weight = updates.targetWeight as any;
  if (updates.goalTimelineWeeks !== undefined) db.goal_timeline_weeks = updates.goalTimelineWeeks as any;

  if (updates.goal !== undefined) {
    // Map app goal → DB goal_type (best-effort)
    db.goal_type =
      updates.goal === 'lose'
        ? 'fat_loss'
        : updates.goal === 'gain'
          ? 'lean_bulk'
          : updates.goal === 'improve'
            ? 'recomposition'
            : 'maintain';
  }

  if (updates.activityLevel !== undefined) {
    db.activity_level =
      updates.activityLevel === 'low'
        ? 'light'
        : updates.activityLevel === 'high'
          ? 'active'
          : 'moderate';
  }

  if (updates.eatingPattern !== undefined) db.dietary_preference = updates.eatingPattern;

  return db;
};

export const saveProfile = async (userId: string, updates: Partial<UserProfile>) => {
  // Avatar is stored locally by design.
  if (updates.avatar !== undefined) {
    if (updates.avatar) saveProfilePhoto(updates.avatar);
    else removeProfilePhoto();
  }

  const dbUpdates = mapUserProfileUpdatesToDb(updates);
  // Mark onboarding complete if this looks like a full onboarding payload.
  if (
    updates.name &&
    updates.height &&
    updates.weight &&
    updates.stepTarget &&
    updates.typicalSleepHours
  ) {
    (dbUpdates as any).onboarding_complete = true;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, ...dbUpdates, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select('*')
    .maybeSingle();

  if (error) throw error;

  // If physical inputs changed, recalc targets (if the DB function exists).
  const touchedTargets =
    'height' in updates ||
    'weight' in updates ||
    'goal' in updates ||
    'activityLevel' in updates;
  if (touchedTargets) {
    try {
      await supabase.rpc('calculate_targets', { p_user_id: userId });
    } catch {
      // ignore if RPC isn't present yet
    }
  }

  // Re-fetch to return computed targets if RPC updated them.
  const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return mapDbProfileToUserProfile((refreshed ?? data) as DbProfileRow);
};

// --- SLEEP --- //

export const getSleepData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('sleep_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', toDateString(startDate))
    .lte('date', toDateString(endDate));

  if (error) throw error;
  
  return (data || []).map((s: any) => ({ ...s, date: new Date(s.date) })) as SleepData[];
};

export const logSleep = async (userId: string, entry: Omit<SleepData, 'id'>) => {
  const { data, error } = await supabase
    .from('sleep_entries')
    .insert({
      user_id: userId,
      date: toDateString(entry.date),
      duration: entry.duration,
      sleep_time: entry.bedtime,
      wake_time: entry.wakeTime,
      quality: entry.quality,
      consistency: entry.consistency,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  // Return the full object so the UI state remains happy
  return { ...data, date: new Date(data.date) } as SleepData;
};

// --- NUTRITION --- //

export const getNutritionData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data: meals, error } = await supabase
    .from('meals')
    .select('*, meal_items(*, foods(*))')
    .eq('user_id', userId)
    .gte('meal_date', toDateString(startDate))
    .lte('meal_date', toDateString(endDate));

  if (error) throw error;

  const nutritionMap = new Map<string, NutritionData>();

  (meals || []).forEach((meal: any) => {
    const dateStr = String(meal.meal_date).split('T')[0];
    let dayData = nutritionMap.get(dateStr);

    if (!dayData) {
      dayData = {
        id: `nut_${dateStr}`,
        date: new Date(dateStr),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        meals: [],
        lastMealTime: ''
      };
      nutritionMap.set(dateStr, dayData);
    }

    let mealCalories = 0, mealProtein = 0, mealCarbs = 0, mealFat = 0;

    if (meal.meal_items) {
      meal.meal_items.forEach((item: any) => {
        mealCalories += item.calories || 0;
        mealProtein += item.protein || 0;
        mealCarbs += item.carbs || 0;
        mealFat += item.fat || 0;
      });
    }

    const firstFoodName = meal.meal_items?.[0]?.foods?.food_name;
    const transformedMeal: Meal = {
      id: meal.id,
      time: meal.time ?? '',
      calories: mealCalories,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFat,
      name: firstFoodName ?? meal.meal_type ?? 'Meal',
      mealType: meal.meal_type ?? undefined,
    };

    dayData.meals.push(transformedMeal);
    dayData.calories += mealCalories;
    dayData.protein += mealProtein;
    dayData.carbs += mealCarbs;
    dayData.fat += mealFat;
    if (meal.time) dayData.lastMealTime = meal.time;
  });

  return Array.from(nutritionMap.values());
};

export type DailyInsights = {
  calories: number;
  calorie_target: number;
  protein: number;
  protein_target: number;
  carbs: number;
  carb_target: number;
  fat: number;
  fat_target: number;
  calcium_percent: number;
  iron_percent: number;
  magnesium_percent: number;
};

export type FoodSuggestion = {
  food_id: string;
  food_name: string;
  score: number;
};

export type SleepInsights = {
  entries: number;
  avg_duration: number;
  avg_quality: number;
  avg_consistency: number;
  last_night_duration: number;
  last_night_quality: number;
  insight: string;
};

export type ActivityInsights = {
  days: number;
  avg_steps: number;
  workout_days: number;
  total_workouts: number;
  total_duration: number;
  insight: string;
};

export type ControlCenterSnapshot = {
  sleep_duration: number;
  sleep_quality: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
  workouts: number;
  workout_duration: number;
};

export const getDailyInsights = async (userId: string, date: Date) => {
  const { data, error } = await supabase.rpc('get_daily_insights', {
    p_user_id: userId,
    p_date: toDateString(date),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as DailyInsights | null;
};

export const suggestFoods = async (userId: string, date: Date) => {
  const { data, error } = await supabase.rpc('suggest_foods', {
    p_user_id: userId,
    p_date: toDateString(date),
  });
  if (error) throw error;
  return (data ?? []) as FoodSuggestion[];
};

export const getSleepInsights = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_sleep_insights', {
    p_user_id: userId,
    p_start: toDateString(startDate),
    p_end: toDateString(endDate),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as SleepInsights | null;
};

export const getActivityInsights = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_activity_insights', {
    p_user_id: userId,
    p_start: toDateString(startDate),
    p_end: toDateString(endDate),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as ActivityInsights | null;
};

export const getControlCenterSnapshot = async (userId: string, date: Date) => {
  const { data, error } = await supabase.rpc('get_control_center_snapshot', {
    p_user_id: userId,
    p_date: toDateString(date),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as ControlCenterSnapshot | null;
};

export const logMeal = async (userId: string, date: Date, meal: Omit<Meal, 'id'>) => {
  const mealDate = toDateString(date);

  const unitToGrams = (unit: Meal['quantityUnit']): number => {
    switch (unit) {
      case 'cup':
        return 240;
      case 'bowl':
        return 350;
      case 'piece':
        return 80;
      case 'grams':
      default:
        return 1;
    }
  };

  const grams =
    meal.quantityUnit && meal.quantity
      ? meal.quantity * unitToGrams(meal.quantityUnit)
      : 100;

  // 1) Determine food_id
  let foodId = meal.foodId;
  if (!foodId) {
    // Create a custom food per-100g derived from the entered totals for this meal quantity.
    const per100Factor = grams > 0 ? 100 / grams : 1;
    const { data: foodRow, error: foodError } = await supabase
      .from('foods')
      .insert({
        food_code: 'custom',
        food_name: meal.name,
        energy_kcal: meal.calories * per100Factor,
        protein_g: meal.protein * per100Factor,
        carb_g: meal.carbs * per100Factor,
        fat_g: meal.fat * per100Factor,
        is_common: false,
      })
      .select('id')
      .maybeSingle();
    if (foodError) throw foodError;
    if (!foodRow?.id) throw new Error('Failed to create custom food');
    foodId = foodRow.id;
  }

  // 2) Find or create meal row
  let mealRow;
  const { data: existingMeal, error: findError } = await supabase
    .from('meals')
    .select('id')
    .eq('user_id', userId)
    .eq('meal_date', mealDate)
    .eq('meal_type', meal.mealType ?? 'meal')
    .maybeSingle();

  if (findError && findError.code !== 'PGRST116') throw findError;

  if (existingMeal) {
    mealRow = existingMeal;
  } else {
    const { data: created, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: userId,
        meal_date: mealDate,
        meal_type: meal.mealType ?? 'meal',
        time: meal.time ?? new Date().toTimeString().slice(0, 5),
      })
      .select()
      .maybeSingle();

    if (mealError) throw mealError;
    mealRow = created;
  }

  if (!mealRow) throw new Error('Meal record unavailable');

  // 3) Insert meal_items via DB function (handles scaling + micronutrients)
  const { error: logError } = await supabase.rpc('log_food', {
    p_meal_id: mealRow.id,
    p_food_id: foodId,
    p_quantity: grams,
  });
  if (logError) throw logError;

  return { ...meal, id: mealRow.id } as Meal;
};

export const removeMeal = async (mealId: string) => {
  // Delete meal_items first in case FK isn't cascade.
  await supabase.from('meal_items').delete().eq('meal_id', mealId);
  const { error } = await supabase.from('meals').delete().eq('id', mealId);

  if (error) throw error;
};

// --- ACTIVITY --- //

export const getActivityData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('activity_days')
    .select('*, workouts(*)')
    .eq('user_id', userId)
    .gte('date', toDateString(startDate))
    .lte('date', toDateString(endDate));

  if (error) throw error;
  
  return (data || []).map((day: any) => ({
    id: day.id,
    date: new Date(day.date),
    steps: day.steps || 0,
    workouts: day.workouts || [],
    intensity: day.intensity || 'low',
    totalDuration: day.total_duration || 0
  })) as ActivityData[];
};

export const logActivity = async (userId: string, date: Date, workout: Omit<Workout, 'id'>) => {
  const dateStr = toDateString(date);

  // 1. find or create activity_day
  let { data: activityDay, error: findError } = await supabase
    .from('activity_days')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .maybeSingle();

  if (findError && findError.code !== 'PGRST116') throw findError;

  if (!activityDay) {
    const { data: newDay, error: insertError } = await supabase
      .from('activity_days')
      .insert({
        user_id: userId,
        date: dateStr,
        steps: 0,
        intensity: workout.intensity,
        total_duration: workout.duration
      })
      .select()
      .maybeSingle();

    if (insertError) throw insertError;
    activityDay = newDay;
  } else {
    // 3. update duration
    const newDuration = (activityDay.total_duration || 0) + workout.duration;
    let newIntensity = activityDay.intensity;
    if (workout.intensity === 'high') newIntensity = 'high';
    else if (workout.intensity === 'moderate' && activityDay.intensity === 'low') newIntensity = 'moderate';

    await supabase
      .from('activity_days')
      .update({ total_duration: newDuration, intensity: newIntensity })
      .eq('id', activityDay.id);
  }

  // 2. insert workout
  // Strip out timestamp since the DB only uses created_at
  const { timestamp, ...dbWorkout } = workout as any;

  const { data: workoutRow, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      activity_day_id: activityDay.id,
      ...dbWorkout
    })
    .select()
    .maybeSingle();

  if (workoutError) throw workoutError;

  return workoutRow as Workout;
};

export const updateSteps = async (userId: string, date: Date, steps: number) => {
  const dateStr = toDateString(date);

  const { error } = await supabase
    .from('activity_days')
    .upsert({
      user_id: userId,
      date: dateStr,
      steps
    }, { onConflict: 'user_id, date' })
    .select();

  if (error) throw error;
};

// --- SETTINGS / ACCOUNT --- //

export const deleteAccount = async (userId: string) => {
  const email = storage.getItem('macroscope_user_email');
  const { error } = await supabase.rpc('delete_user_account', { p_user_id: userId, p_email: email });
  if (!error) return;

  // Fallback path: keep account deletion functional even if RPC is unavailable.
  await clearData(userId);
  const { error: profileDeleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileDeleteError) throw profileDeleteError;
};

export const clearData = async (userId: string) => {
  // Prefer server-side bulk delete if available.
  const { error } = await supabase.rpc('clear_user_data', { p_user_id: userId });
  if (!error) return;

  // Fallback: client-side deletes (may be slower).
  await supabase.from('sleep_entries').delete().eq('user_id', userId);
  await supabase.from('activity_days').delete().eq('user_id', userId);
  await supabase.from('meals').delete().eq('user_id', userId);
};
