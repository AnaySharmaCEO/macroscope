/**
 * MACROSCOPE PERFORMANCE OS - ALERT ENGINE
 * Pure logic for alert generation and management
 * NO UI IMPORTS - Pure TypeScript only
 */

import type { SleepData, NutritionData, ActivityData, SystemSettings } from '../types';

export type AlertType = 'sleep' | 'nutrition' | 'activity' | 'system';
export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertState = 'NEW' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  state: AlertState;
  message: string;
  impact: string;
  action: string;
  createdAt: Date;
  acknowledgedAt?: Date;
}

export interface AlertPriority {
  primary: Alert | null;
  secondary: Alert[];
}

interface AlertCondition {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  check: (data: AlertEngineInput) => boolean;
  message: string;
  impact: string;
  action: string;
}

interface AlertEngineInput {
  sleepData: SleepData[];
  nutritionData: NutritionData[];
  activityData: ActivityData[];
  settings: SystemSettings;
}

/**
 * Alert condition definitions
 */
const ALERT_CONDITIONS: AlertCondition[] = [
  // SLEEP ALERTS
  {
    id: 'sleep-low-duration',
    type: 'sleep',
    severity: 'high',
    check: ({ sleepData }) => {
      const recent = sleepData.slice(-3);
      if (recent.length === 0) return false;
      const avgDuration = recent.reduce((sum, d) => sum + d.duration, 0) / recent.length;
      return avgDuration < 6;
    },
    message: 'Sleep duration critically low',
    impact: 'Insufficient sleep is degrading cognitive performance, recovery capacity, and metabolic health.',
    action: 'Extend sleep window by going to bed 60 minutes earlier tonight.'
  },
  {
    id: 'sleep-inconsistent-timing',
    type: 'sleep',
    severity: 'medium',
    check: ({ sleepData }) => {
      if (sleepData.length < 5) return false;
      const recent = sleepData.slice(-7);
      
      // Calculate bedtime variance
      const bedtimes = recent
        .filter(d => d.bedtime)
        .map(d => {
          const [hours, minutes] = d.bedtime.split(':').map(Number);
          return hours * 60 + minutes;
        });
      
      if (bedtimes.length < 4) return false;
      
      const avgBedtime = bedtimes.reduce((sum, t) => sum + t, 0) / bedtimes.length;
      const variance = bedtimes.reduce((sum, t) => sum + Math.abs(t - avgBedtime), 0) / bedtimes.length;
      
      // Variance > 60 minutes average deviation
      return variance > 60;
    },
    message: 'Sleep timing highly inconsistent',
    impact: 'Circadian disruption is preventing deep sleep cycles and reducing daytime alertness.',
    action: 'Lock in a consistent bedtime (±30 min) for the next 5 nights.'
  },

  // NUTRITION ALERTS
  {
    id: 'nutrition-calorie-surplus',
    type: 'nutrition',
    severity: 'medium',
    check: ({ nutritionData, settings }) => {
      const recent = nutritionData.slice(-3);
      if (recent.length === 0) return false;
      const avgCalories = recent.reduce((sum, d) => sum + d.calories, 0) / recent.length;
      return avgCalories > settings.calorieTarget * 1.2;
    },
    message: 'Calorie intake significantly above target',
    impact: 'Sustained surplus is affecting body composition and metabolic efficiency.',
    action: 'Reduce portion sizes by 20% and track intake more carefully for the next 3 days.'
  },
  {
    id: 'nutrition-low-protein',
    type: 'nutrition',
    severity: 'medium',
    check: ({ nutritionData, settings }) => {
      const recent = nutritionData.slice(-5);
      if (recent.length === 0) return false;
      
      // Estimate protein target based on calorie target (assume 25% protein)
      const proteinTarget = (settings.calorieTarget * 0.25) / 4; // grams
      const avgProtein = recent.reduce((sum, d) => sum + d.protein, 0) / recent.length;
      
      return avgProtein < proteinTarget * 0.7;
    },
    message: 'Protein intake below optimal range',
    impact: 'Insufficient protein is limiting muscle recovery, satiety, and training adaptation.',
    action: 'Add 30-40g protein to daily intake (e.g., extra serving of lean meat or protein shake).'
  },

  // ACTIVITY ALERTS
  {
    id: 'activity-low-steps',
    type: 'activity',
    severity: 'medium',
    check: ({ activityData, settings }) => {
      const recent = activityData.slice(-3);
      if (recent.length === 0) return false;
      const avgSteps = recent.reduce((sum, d) => sum + d.steps, 0) / recent.length;
      // settings.activityTarget is in steps (e.g., 8000)
      return avgSteps < settings.activityTarget * 0.5;
    },
    message: 'Daily step count critically low',
    impact: 'Minimal movement is reducing metabolic rate, cardiovascular health, and sleep quality.',
    action: 'Add a 20-minute walk after each meal for the next 3 days.'
  },
  {
    id: 'activity-consistency-gap',
    type: 'activity',
    severity: 'low',
    check: ({ activityData, settings }) => {
      const recent = activityData.slice(-3);
      if (recent.length < 3) return false;
      
      const threshold = settings.activityTarget * 0.6;
      const lowActivityDays = recent.filter(d => d.steps < threshold).length;
      
      return lowActivityDays === 3;
    },
    message: '3-day activity consistency gap',
    impact: 'Prolonged inactivity is breaking momentum and affecting system-wide energy regulation.',
    action: 'Break the pattern: hit step target for the next 2 days consecutively.'
  },

  // SYSTEM-LEVEL ALERTS
  {
    id: 'system-multi-degraded',
    type: 'system',
    severity: 'high',
    check: ({ sleepData, nutritionData, activityData, settings }) => {
      const recentSleep = sleepData.slice(-3);
      const recentNutrition = nutritionData.slice(-3);
      const recentActivity = activityData.slice(-3);
      
      if (recentSleep.length === 0 || recentNutrition.length === 0 || recentActivity.length === 0) {
        return false;
      }
      
      // Check if multiple systems are underperforming
      const avgSleep = recentSleep.reduce((sum, d) => sum + d.duration, 0) / recentSleep.length;
      const avgSteps = recentActivity.reduce((sum, d) => sum + d.steps, 0) / recentActivity.length;
      const avgCalories = recentNutrition.reduce((sum, d) => sum + d.calories, 0) / recentNutrition.length;
      
      const sleepBad = avgSleep < 6.5;
      const activityBad = avgSteps < settings.activityTarget * 0.6;
      const nutritionBad = avgCalories < settings.calorieTarget * 0.7 || avgCalories > settings.calorieTarget * 1.3;
      
      // 2+ systems degraded
      return [sleepBad, activityBad, nutritionBad].filter(Boolean).length >= 2;
    },
    message: 'Multiple systems degraded',
    impact: 'Cross-system instability is creating negative feedback loops across recovery, energy, and performance.',
    action: 'Prioritize sleep consistency for 48 hours — this will stabilize the entire system.'
  },
  {
    id: 'system-late-meals-sleep',
    type: 'system',
    severity: 'medium',
    check: ({ nutritionData, sleepData }) => {
      if (nutritionData.length === 0 || sleepData.length === 0) return false;
      
      const recentNutrition = nutritionData.slice(-3);
      const recentSleep = sleepData.slice(-3);
      
      // Check if last meal is consistently late (after 21:00) AND sleep quality is low
      const lateMeals = recentNutrition.filter(d => {
        if (!d.lastMealTime) return false;
        const [hours] = d.lastMealTime.split(':').map(Number);
        return hours >= 21 || hours < 3; // After 9pm or early morning
      }).length;
      
      const poorSleep = recentSleep.filter(d => d.quality < 6).length;
      
      return lateMeals >= 2 && poorSleep >= 2;
    },
    message: 'Late meals affecting sleep quality',
    impact: 'Eating close to bedtime is disrupting sleep architecture and overnight recovery processes.',
    action: 'Move last meal to at least 3 hours before bed for the next 5 nights.'
  }
];

/**
 * Generate alerts based on current system data
 */
const ALERTS_STORAGE_KEY = 'macroscope_alerts_history';

function loadAlertHistory(): Alert[] {
  try {
    const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
    if (!storage) return [];
    
    const raw = storage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      acknowledgedAt: a.acknowledgedAt ? new Date(a.acknowledgedAt) : undefined
    }));
  } catch {
    return [];
  }
}

function saveAlertHistory(alerts: Alert[]) {
  try {
    const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
    if (storage) {
      storage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    }
  } catch (e) {
    console.error('Failed to save alert history', e);
  }
}

export function generateAlerts(
  sleepData: SleepData[],
  nutritionData: NutritionData[],
  activityData: ActivityData[],
  settings: SystemSettings,
  providedExistingAlerts?: Alert[]
): Alert[] {
  const input: AlertEngineInput = {
    sleepData,
    nutritionData,
    activityData,
    settings
  };

  const existingAlerts = providedExistingAlerts || loadAlertHistory();
  const activeConditions = ALERT_CONDITIONS.filter(condition => 
    condition.check(input)
  );

  const newAlerts: Alert[] = [];
  const now = new Date();
  const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

  // Process each active condition
  for (const condition of activeConditions) {
    const existing = existingAlerts.find(a => a.id === condition.id);

    if (existing) {
      if (existing.state !== 'RESOLVED') {
        newAlerts.push(existing);
      } else {
        // It was resolved. Check cooldown.
        const timeSinceCreation = now.getTime() - existing.createdAt.getTime();
        const timeSinceAck = existing.acknowledgedAt ? now.getTime() - existing.acknowledgedAt.getTime() : Infinity;
        
        // Cooldown based on creation or ack time
        if (timeSinceCreation > COOLDOWN_MS && timeSinceAck > COOLDOWN_MS) {
           // We can re-trigger it
           newAlerts.push({
             id: condition.id,
             type: condition.type,
             severity: condition.severity,
             state: 'NEW',
             message: condition.message,
             impact: condition.impact,
             action: condition.action,
             createdAt: now
           });
        } else {
          // Still in cooldown, push the resolved historically but it won't be active? Or don't push it so it's not active
          newAlerts.push(existing);
        }
      }
    } else {
      // Create new alert
      newAlerts.push({
        id: condition.id,
        type: condition.type,
        severity: condition.severity,
        state: 'NEW',
        message: condition.message,
        impact: condition.impact,
        action: condition.action,
        createdAt: now
      });
    }
  }

  // Mark resolved alerts (conditions no longer met)
  const activeIds = new Set(activeConditions.map(c => c.id));
  for (const alert of existingAlerts) {
    if (!activeIds.has(alert.id) && alert.state !== 'RESOLVED') {
      newAlerts.push({ ...alert, state: 'RESOLVED' });
    } else if (!activeIds.has(alert.id)) {
      newAlerts.push(alert);
    }
  }

  // Save full history, but keep it pruned to last 50
  const prunedHistory = [...newAlerts]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50);

  saveAlertHistory(prunedHistory);
  
  // Return only ACTIVE/NEW/ACKNOWLEDGED to the UI, capped to avoid spam
  const active = newAlerts.filter(a => a.state !== 'RESOLVED');
  const severityOrder = { high: 3, medium: 2, low: 1 };
  return [...active]
    .sort((a, b) => {
      const s = severityOrder[b.severity] - severityOrder[a.severity];
      if (s !== 0) return s;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, 3);
}

/**
 * Prioritize alerts: 1 primary + up to 2 secondary
 */
export function prioritizeAlerts(alerts: Alert[]): AlertPriority {
  // Filter out acknowledged alerts for prioritization
  const unacknowledged = alerts.filter(a => a.state !== 'ACKNOWLEDGED');

  if (unacknowledged.length === 0) {
    return { primary: null, secondary: [] };
  }

  // Sort by severity (high > medium > low) then by creation date
  const sorted = [...unacknowledged].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return {
    primary: sorted[0],
    secondary: sorted.slice(1, 3)
  };
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(alerts: Alert[], alertId: string): Alert[] {
  return alerts.map(alert => 
    alert.id === alertId && alert.state !== 'RESOLVED'
      ? { ...alert, state: 'ACKNOWLEDGED' as AlertState, acknowledgedAt: new Date() }
      : alert
  );
}

/**
 * Get unacknowledged alert count
 */
export function getUnacknowledgedCount(alerts: Alert[]): number {
  return alerts.filter(a => a.state === 'NEW' || a.state === 'ACTIVE').length;
}
