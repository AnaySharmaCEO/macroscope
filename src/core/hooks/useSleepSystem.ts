/**
 * MACROSCOPE PERFORMANCE OS - SLEEP SYSTEM HOOK
 * Manages sleep system state and operations
 */

import { useState, useEffect } from 'react';
import type { SleepData, SystemStatus, Signal, TimeRange } from '../types';
import { sleepService } from '../services';
import { useAuth } from './useAuth';

export function useSleepSystem(timeRange: TimeRange = 'week') {
  const { userId } = useAuth();
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [status, setStatus] = useState<SystemStatus>('unknown');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSleepData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(timeRange);
      if (!userId) throw new Error('Not authenticated');
      const data = await sleepService.getSleepData(userId, startDate, endDate);

      setSleepData(data);
      setStatus(sleepService.calculateStatus(data));
      setSignals(sleepService.generateSignals(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sleep data');
    } finally {
      setLoading(false);
    }
  };

  const logSleep = async (entry: Omit<SleepData, 'id'>) => {
    try {
      if (!userId) throw new Error('Not authenticated');
      await sleepService.logSleep(userId, entry);
      await fetchSleepData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log sleep');
      throw err;
    }
  };

  useEffect(() => {
    fetchSleepData();
    
    const handleUpdate = () => fetchSleepData();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('macroscope-api-update', handleUpdate);
      return () => window.removeEventListener('macroscope-api-update', handleUpdate);
    }
  }, [timeRange]);

  return {
    sleepData,
    status,
    signals,
    loading,
    error,
    logSleep,
    refresh: fetchSleepData,
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
