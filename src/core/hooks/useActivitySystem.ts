/**
 * MACROSCOPE PERFORMANCE OS - ACTIVITY SYSTEM HOOK
 * Manages activity system state and operations
 */

import { useState, useEffect } from 'react';
import type { ActivityData, Workout, SystemStatus, Signal, TimeRange } from '../types';
import { activityService } from '../services';
import { useAuth } from './useAuth';
import type { ActivityInsights } from '../api';

export function useActivitySystem(timeRange: TimeRange = 'week') {
  const { userId } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [status, setStatus] = useState<SystemStatus>('unknown');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [insights, setInsights] = useState<ActivityInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(timeRange);
      if (!userId) throw new Error('Not authenticated');
      const data = await activityService.getActivityData(userId, startDate, endDate);
      const insight = await activityService.getActivityInsights(userId, startDate, endDate).catch(() => null);

      setActivityData(data);
      setStatus(activityService.calculateStatus(data));
      setSignals(activityService.generateSignals(data));
      setInsights(insight);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity data');
    } finally {
      setLoading(false);
    }
  };

  const logWorkout = async (date: Date, workout: Omit<Workout, 'id'>) => {
    try {
      if (!userId) throw new Error('Not authenticated');
      await activityService.logWorkout(userId, date, workout);
      await fetchActivityData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log workout');
      throw err;
    }
  };

  const updateSteps = async (date: Date, steps: number) => {
    try {
      if (!userId) throw new Error('Not authenticated');
      await activityService.updateSteps(userId, date, steps);
      await fetchActivityData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update steps');
      throw err;
    }
  };

  useEffect(() => {
    fetchActivityData();
    
    const handleUpdate = () => fetchActivityData();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('macroscope-api-update', handleUpdate);
      return () => window.removeEventListener('macroscope-api-update', handleUpdate);
    }
  }, [timeRange]);

  return {
    activityData,
    status,
    signals,
    insights,
    loading,
    error,
    logWorkout,
    updateSteps,
    refresh: fetchActivityData,
  };
}

/**
 * Get date range based on time range selection
 */
function getDateRange(timeRange: TimeRange): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'all':
      startDate.setDate(startDate.getDate() - 365);
      break;
  }

  return { startDate, endDate };
}
