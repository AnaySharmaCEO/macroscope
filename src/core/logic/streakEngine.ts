/**
 * MACROSCOPE PERFORMANCE OS - STREAK ENGINE
 * Pure logic for streak/goals calculation
 * NO UI IMPORTS - Pure TypeScript only
 */

import type { SleepData, NutritionData, ActivityData, SystemSettings } from '../types';
import type { Alert } from './alertEngine';

export interface DayStatus {
  date: Date;
  score: number; // 0 to 1
  isGraceDay: boolean;
  state: 'success' | 'missed' | 'no_data';
  sleep: number; // 0 to 1
  nutrition: number; // 0 to 1
  activity: number; // 0 to 1
}

export interface StreakData {
  currentStreak: number; // can be fractional
  bestStreak: number;
  consistency: number; // 0-100 based on fractional score
  calendar: DayStatus[];
  todayRequirements: string[];
  todayStatus: DayStatus | null;
}

/**
 * Check a day's partial credit score
 */
function checkDayScore(
  sleep: SleepData | undefined,
  nutrition: NutritionData | undefined,
  activity: ActivityData | undefined,
  settings: SystemSettings
): { score: number; sleep: number; nutrition: number; activity: number } {
  
  let sleepScore = 0;
  if (sleep) {
    if (sleep.duration >= settings.sleepTarget * 0.9) sleepScore = 1;
    else if (sleep.duration >= settings.sleepTarget * 0.7) sleepScore = 0.5;
  }

  let activityScore = 0;
  if (activity) {
    const targetSteps = settings.activityTarget;
    if (activity.steps >= targetSteps * 0.9) activityScore = 1;
    else if (activity.steps >= targetSteps * 0.7) activityScore = 0.5;
  }

  let nutritionScore = 0;
  if (nutrition) {
    const calTarget = settings.calorieTarget;
    // 10% bound for 1.0
    if (nutrition.calories >= calTarget * 0.9 && nutrition.calories <= calTarget * 1.1) {
      nutritionScore = 1;
    } 
    // 25% bound for 0.5
    else if (nutrition.calories >= calTarget * 0.75 && nutrition.calories <= calTarget * 1.25) {
      nutritionScore = 0.5;
    }
  }

  const score = (sleepScore + activityScore + nutritionScore) / 3;

  return {
    score,
    sleep: sleepScore,
    nutrition: nutritionScore,
    activity: activityScore
  };
}

/**
 * Normalize date to midnight for comparison
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function toLocalDateKey(date: Date): string {
  const d = normalizeDate(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Generate calendar of last N days
 */
function generateCalendar(
  sleepData: SleepData[],
  nutritionData: NutritionData[],
  activityData: ActivityData[],
  settings: SystemSettings,
  days: number = 30
): DayStatus[] {
  const calendar: DayStatus[] = [];
  const today = normalizeDate(new Date());

  const sleepMap = new Map<string, SleepData>();
  const nutritionMap = new Map<string, NutritionData>();
  const activityMap = new Map<string, ActivityData>();

  sleepData.forEach(d => sleepMap.set(toLocalDateKey(d.date), d));
  nutritionData.forEach(d => nutritionMap.set(toLocalDateKey(d.date), d));
  activityData.forEach(d => activityMap.set(toLocalDateKey(d.date), d));

  // Determine grace days (max 1 per 7 days rolling)
  let graceDaysUsed = 0;
  let lastGraceDayIdx = -1;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = toLocalDateKey(date);

    const sleep = sleepMap.get(dateKey);
    const nutrition = nutritionMap.get(dateKey);
    const activity = activityMap.get(dateKey);

    const status = checkDayScore(sleep, nutrition, activity, settings);
    let isGraceDay = false;

    // Grace day mechanic (if score < 0.5, see if we can use a grace day)
    // Only looking back from the perspective of processing forwards in time:
    // We are generating backwards... wait, loop is from i = days-1 down to 0, which means oldest to newest! Correct.
    if (status.score < 0.5) {
      if (lastGraceDayIdx === -1 || (i - lastGraceDayIdx > 7)) {
        isGraceDay = true;
        lastGraceDayIdx = i; // Save index relative to calendar (wait i is counting down...)
        // Fix: Just record the actual calendar push index
      }
    }

    calendar.push({
      date,
      score: status.score,
      isGraceDay: false, // Wait! We populate grace day on a separate pass or track calendar length
      state: (!sleep && !nutrition && !activity) ? 'no_data' : (status.score >= 0.5 ? 'success' : 'missed'),
      sleep: status.sleep,
      nutrition: status.nutrition,
      activity: status.activity
    });
  }

  // Refine grace days with correct index tracking
  let lastGraceIndex = -10;
  for (let j = 0; j < calendar.length; j++) {
    if (calendar[j].score < 0.5) {
      if (j - lastGraceIndex >= 7) {
        calendar[j].isGraceDay = true;
        calendar[j].state = 'success';
        lastGraceIndex = j;
      }
    }
  }

  return calendar;
}

/**
 * Calculate current streak with fractional accumulation
 */
function calculateCurrentStreak(calendar: DayStatus[]): number {
  // Production rule: streak counts only if thresholds met.
  // One grace day per 7-day rolling window.
  let streak = 0;
  for (let i = calendar.length - 1; i >= 0; i--) {
    const day = calendar[i];
    if (day.state === 'no_data') break;
    if (day.score >= 0.5 || day.isGraceDay) streak += 1;
    else break;
  }
  return streak;
}

/**
 * Calculate best streak in calendar period
 */
function calculateBestStreak(calendar: DayStatus[]): number {
  let bestStreak = 0;
  let current = 0;
  for (const day of calendar) {
    if (day.state === 'no_data') {
      current = 0;
      continue;
    }
    if (day.score >= 0.5 || day.isGraceDay) {
      current += 1;
      bestStreak = Math.max(bestStreak, current);
    } else {
      current = 0;
    }
  }
  return bestStreak;
}

/**
 * Calculate consistency percentage
 */
function calculateConsistency(calendar: DayStatus[]): number {
  if (calendar.length === 0) return 0;
  const totalScore = calendar.reduce((sum, d) => sum + d.score, 0);
  return Math.round((totalScore / calendar.length) * 100);
}

/**
 * Generate today's requirements based on current gaps
 */
function generateTodayRequirements(
  todayStatus: DayStatus | null,
  sleepData: SleepData[],
  nutritionData: NutritionData[],
  activityData: ActivityData[],
  settings: SystemSettings,
  primaryAlert?: Alert | null
): string[] {
  const requirements: string[] = [];

  // Priority 1: Top Alert Action (Direct system warning)
  if (primaryAlert && primaryAlert.action) {
    requirements.push(primaryAlert.action);
  }

  const today = normalizeDate(new Date());
  const isToday = (date: Date) => normalizeDate(date).getTime() === today.getTime();

  // 1. Sleep Requirement (Threshold: 90% of target)
  const latestSleep = sleepData.find(d => isToday(d.date));
  const sleepThreshold = settings.sleepTarget * 0.9;
  if (!latestSleep || latestSleep.duration < sleepThreshold) {
    const current = latestSleep?.duration || 0;
    const needed = Math.max(0, Math.ceil((sleepThreshold - current) * 10) / 10);
    // If it's daytime, user can't "sleep more" right now, but we remind them of tonight's goal.
    if (needed > 0) {
      requirements.push(`Target: ${needed}h more sleep for system restoration`);
    }
  }

  // 2. Activity Requirement (Threshold: 90% of target)
  const latestActivity = activityData.find(d => isToday(d.date));
  const activityThreshold = settings.activityTarget * 0.9;
  if (!latestActivity || latestActivity.steps < activityThreshold) {
    const current = latestActivity?.steps || 0;
    const needed = Math.max(0, Math.ceil(activityThreshold - current));
    if (needed > 0) {
      requirements.push(`Target: ${needed.toLocaleString()} more steps for system activity`);
    }
  }

  // 3. Nutrition Requirement (Threshold: ±10% of target)
  const latestNutrition = nutritionData.find(d => isToday(d.date));
  const nutritionTarget = settings.calorieTarget;
  const lowerBound = nutritionTarget * 0.9;
  const upperBound = nutritionTarget * 1.1;
  const currentCals = latestNutrition?.calories || 0;

  if (currentCals < lowerBound) {
    const needed = Math.round(lowerBound - currentCals);
    requirements.push(`Target: ${needed} more kcal to reach energy floor`);
  } else if (currentCals > upperBound) {
    requirements.push(`Limit: Exceeded calorie ceiling by ${Math.round(currentCals - upperBound)} kcal`);
  }

  if (requirements.length === 0) {
    requirements.push('System optimal — maintain current performance rhythm');
  }

  return Array.from(new Set(requirements)).slice(0, 3);
}

/**
 * Main function: Generate complete streak data
 */
export function generateStreakData(
  sleepData: SleepData[],
  nutritionData: NutritionData[],
  activityData: ActivityData[],
  settings: SystemSettings,
  primaryAlert?: Alert | null
): StreakData {
  const calendar = generateCalendar(sleepData, nutritionData, activityData, settings, 30);
  const currentStreak = calculateCurrentStreak(calendar);
  const bestStreak = calculateBestStreak(calendar);
  const consistency = calculateConsistency(calendar);
  const todayStatus = calendar[calendar.length - 1] || null;

  const todayRequirements = generateTodayRequirements(
    todayStatus,
    sleepData,
    nutritionData,
    activityData,
    settings,
    primaryAlert
  );

  return {
    currentStreak,
    bestStreak,
    consistency,
    calendar,
    todayRequirements,
    todayStatus
  };
}
