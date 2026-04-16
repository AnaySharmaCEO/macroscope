/**
 * Adaptive scoring engine (0–100) with grace period + partial credit.
 * Pure logic. No UI imports.
 */

import type { SleepData, NutritionData, ActivityData, SystemSettings } from '../types';

export type SystemCohesionStatus = "starting" | "building" | "stable" | "optimal";

export interface SystemScoreBreakdown {
  status: SystemCohesionStatus;
  score: number; // 0-100
  components: {
    sleep: number; // 0-100
    nutrition: number; // 0-100
    activity: number; // 0-100
  };
  reason: string;
}

const normalizeDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const sameDay = (a: Date, b: Date) => normalizeDay(a).getTime() === normalizeDay(b).getTime();

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Partial credit: 0..1 for each system
function scoreSleepToday(s: SleepData | undefined, settings: SystemSettings): number {
  if (!s) return 0;
  // Range scoring around target:
  // >=100% target: 1.0
  // 70%: 0.6
  // 50%: 0.3
  const r = s.duration / Math.max(settings.sleepTarget, 1);
  if (r >= 1) return 1;
  if (r >= 0.9) return 0.9;
  if (r >= 0.7) return 0.6;
  if (r >= 0.5) return 0.3;
  return 0.1;
}

function scoreActivityToday(a: ActivityData | undefined, settings: SystemSettings): number {
  if (!a) return 0;
  const r = a.steps / Math.max(settings.activityTarget, 1);
  if (r >= 1) return 1;
  if (r >= 0.85) return 0.85;
  if (r >= 0.7) return 0.6;
  if (r >= 0.5) return 0.35;
  return 0.1;
}

function scoreNutritionToday(n: NutritionData | undefined, settings: SystemSettings): number {
  if (!n) return 0;
  const target = Math.max(settings.calorieTarget, 1);
  const delta = Math.abs(n.calories - target) / target;
  // ±10% full credit, ±25% partial, else low
  if (delta <= 0.10) return 1;
  if (delta <= 0.25) return 0.6;
  if (delta <= 0.40) return 0.35;
  return 0.1;
}

export function computeDailySystemScore(
  sleepData: SleepData[],
  nutritionData: NutritionData[],
  activityData: ActivityData[],
  settings: SystemSettings,
  today: Date = new Date()
): SystemScoreBreakdown {
  const t = normalizeDay(today);

  const sleepToday = sleepData.find(d => sameDay(d.date, t));
  const nutritionToday = nutritionData.find(d => sameDay(d.date, t));
  const activityToday = activityData.find(d => sameDay(d.date, t));

  // Logging completeness: last 7 days with any data
  const windowDays = 7;
  const anyDays = new Set<string>();
  for (const d of sleepData.slice(-30)) anyDays.add(normalizeDay(d.date).toISOString());
  for (const d of nutritionData.slice(-30)) anyDays.add(normalizeDay(d.date).toISOString());
  for (const d of activityData.slice(-30)) anyDays.add(normalizeDay(d.date).toISOString());
  const last7 = [...anyDays].filter(k => {
    const dt = new Date(k);
    const diff = (t.getTime() - dt.getTime()) / (24 * 3600 * 1000);
    return diff >= 0 && diff < windowDays;
  }).length;

  // Grace period: first 3–5 active days we avoid harsh scores
  const graceActiveDays = 5;
  const inGrace = last7 < graceActiveDays;

  const sleep01 = scoreSleepToday(sleepToday, settings);
  const nutrition01 = scoreNutritionToday(nutritionToday, settings);
  const activity01 = scoreActivityToday(activityToday, settings);

  const raw01 = (sleep01 + nutrition01 + activity01) / 3;
  const completeness01 = clamp01(last7 / graceActiveDays); // 0..1

  // Adaptive: during grace, weight completeness higher and floor the score.
  const adapted01 = inGrace
    ? Math.max(0.45, raw01 * 0.7 + completeness01 * 0.3)
    : raw01;

  const score = Math.round(adapted01 * 100);

  let status: SystemCohesionStatus = "building";
  if (last7 < 3) status = "starting";
  else if (score >= 85 && last7 >= 5) status = "optimal";
  else if (score >= 70 && last7 >= 4) status = "stable";
  else status = "building";

  const reason =
    status === "starting"
      ? "Log a few days to personalize scoring."
      : status === "building"
        ? "You’re building consistency — partial wins count."
        : status === "stable"
          ? "Strong consistency — keep the pattern."
          : "Systems are aligned — protect this rhythm.";

  return {
    status,
    score,
    components: {
      sleep: Math.round(sleep01 * 100),
      nutrition: Math.round(nutrition01 * 100),
      activity: Math.round(activity01 * 100),
    },
    reason,
  };
}

