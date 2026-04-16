/**
 * MACROSCOPE PERFORMANCE OS - SYSTEM OVERVIEW HOOK
 * Orchestrates all systems and provides unified state
 */

import { useState, useEffect } from 'react';
import type { SystemOverview, Signal, SystemType } from '../types';
import { sleepService, nutritionService, activityService, settingsService } from '../services';
import { generateAlerts, prioritizeAlerts, acknowledgeAlert } from '../logic/alertEngine';
import { generateStreakData } from '../logic/streakEngine';
import { useAuth } from './useAuth';
import { computeDailySystemScore } from '../logic/scoringEngine';
import { isSameDay } from '../utils/dateUtils';
import { notificationService } from '../services/notificationService';

export function useSystemOverview() {
  const { userId } = useAuth();
  const [overview, setOverview] = useState<SystemOverview>({
    sleepStatus: 'unknown',
    nutritionStatus: 'unknown',
    activityStatus: 'unknown',
    systemStatus: 'starting',
    dailyScore: 0,
    signals: [],
    priorityAction: null,
    keyMetrics: {
      sleepDuration: 0,
      calories: 0,
      steps: 0,
    },
    lastUpdated: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) throw new Error('Not authenticated');

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Fetch data from all systems
      const [sleepData, nutritionData, activityData] = await Promise.all([
        sleepService.getSleepData(userId, weekAgo, today),
        nutritionService.getNutritionData(userId, weekAgo, today),
        activityService.getActivityData(userId, weekAgo, today),
      ]);

      // Calculate system statuses
      const sleepStatus = sleepService.calculateStatus(sleepData);
      const nutritionStatus = nutritionService.calculateStatus(nutritionData);
      const activityStatus = activityService.calculateStatus(activityData);

      // Fetch settings
      const settings = await settingsService.getSettings(userId);

      // Adaptive score + system status (production-grade, grace-aware)
      const score = computeDailySystemScore(sleepData, nutritionData, activityData, settings, today);

      // Generate alerts and prioritize
      const alerts = generateAlerts(sleepData, nutritionData, activityData, settings);
      const priorityAlerts = prioritizeAlerts(alerts);
      
      // Calculate streak data
      const streakData = generateStreakData(sleepData, nutritionData, activityData, settings);

      // Map alerts to signals for SystemOverview compatibility
      const allSignals: Signal[] = alerts.map(a => ({
        id: a.id,
        type: a.type as SystemType,
        condition: a.impact,
        effect: a.action,
        message: a.message,
        severity: a.severity,
        state: a.state,
        timestamp: a.createdAt
      })).slice(0, 3); // Top 3 signals

      // Push notifications for NEW high-severity alerts
      alerts.forEach(a => {
        if (a.state === 'NEW' && a.severity === 'high') {
          notificationService.notifySignal(a.message, a.action, a.severity);
        }
      });

      // Determine priority action based on structured alerts
      const priorityAction = priorityAlerts.primary ? priorityAlerts.primary.action : determinePriorityAction(
        sleepStatus,
        nutritionStatus,
        activityStatus,
        allSignals
      );

      // Get today's metrics
      const todaySleep = sleepData.find(d => isSameDay(d.date, today));
      const todayNutrition = nutritionData.find(d => isSameDay(d.date, today));
      const todayActivity = activityData.find(d => isSameDay(d.date, today));

      setOverview({
        sleepStatus,
        nutritionStatus,
        activityStatus,
        systemStatus: score.status,
        dailyScore: score.score,
        signals: allSignals,
        priorityAction,
        keyMetrics: {
          sleepDuration: todaySleep?.duration || 0,
          calories: todayNutrition?.calories || 0,
          steps: todayActivity?.steps || 0,
        },
        streakData,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system overview');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeSignal = async (signalId: string) => {
    try {
      const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
      if (!storage) return;

      const raw = storage.getItem('macroscope_alerts_history');
      if (!raw) return;

      const rawAlerts = JSON.parse(raw);
      const updated = acknowledgeAlert(rawAlerts, signalId);
      
      storage.setItem('macroscope_alerts_history', JSON.stringify(updated));
      await fetchOverview();
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  };

  useEffect(() => {
    fetchOverview();

    const handleUpdate = () => fetchOverview();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('macroscope-api-update', handleUpdate);
      return () => window.removeEventListener('macroscope-api-update', handleUpdate);
    }
  }, []);

  return {
    overview,
    loading,
    error,
    refresh: fetchOverview,
    acknowledgeSignal,
  };
}

/**
 * Determine the single most important action to take
 */
function determinePriorityAction(
  sleepStatus: string,
  nutritionStatus: string,
  activityStatus: string,
  signals: Signal[]
): string | null {
  // Priority: High severity signals > System status
  const highSeveritySignal = signals.find(s => s.severity === 'high');
  if (highSeveritySignal) {
    // Convert signal to actionable advice
    if (highSeveritySignal.type === 'sleep') {
      return 'Prioritize 7+ hours of sleep tonight to stabilize system';
    }
    if (highSeveritySignal.type === 'nutrition') {
      return 'Increase calorie intake today to restore energy levels';
    }
    if (highSeveritySignal.type === 'activity') {
      return 'Add 30 minutes of activity today to improve system stability';
    }
  }

  // Fallback to worst system status
  if (sleepStatus === 'low') return 'Focus on improving sleep consistency this week';
  if (activityStatus === 'low') return 'Increase activity today to stabilize system';
  if (nutritionStatus === 'low') return 'Balance nutrition to support recovery';

  return 'System stable - maintain current patterns';
}
