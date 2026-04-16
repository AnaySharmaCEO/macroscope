/**
 * MACROSCOPE PERFORMANCE OS - SLEEP SERVICE
 * Handles sleep system data operations
 */

import type { SleepData, SystemStatus, Signal } from '../types';
import * as api from '../api';

class SleepService {
  /**
   * Fetch sleep data for a date range
   */
  async getSleepData(userId: string, startDate: Date, endDate: Date): Promise<SleepData[]> {
    return await api.getSleepData(userId, startDate, endDate);
  }

  /**
   * Get today's sleep data
   */
  async getTodaySleep(userId: string): Promise<SleepData | null> {
    const today = new Date();
    const data = await this.getSleepData(userId, today, today);
    return data.length > 0 ? data[0] : null;
  }

  /**
   * Log new sleep entry
   */
  async logSleep(userId: string, data: Omit<SleepData, 'id'>): Promise<SleepData> {
    return await api.logSleep(userId, data);
  }

  /**
   * Calculate sleep status
   */
  calculateStatus(data: SleepData[]): SystemStatus {
    if (data.length === 0) return 'unknown';

    const recent = data.slice(-7); // Last 7 days
    const avgDuration = recent.reduce((sum, d) => sum + d.duration, 0) / recent.length;
    const avgConsistency = recent.reduce((sum, d) => sum + d.consistency, 0) / recent.length;

    if (avgDuration >= 7 && avgConsistency >= 70) return 'stable';
    if (avgDuration >= 6 && avgConsistency >= 50) return 'imbalanced';
    return 'low';
  }

  /**
   * Generate sleep-related signals
   */
  generateSignals(data: SleepData[]): Signal[] {
    const signals: Signal[] = [];

    if (data.length === 0) return signals;

    const recent = data.slice(-7);
    const avgDuration = recent.reduce((sum, d) => sum + d.duration, 0) / recent.length;
    const avgConsistency = recent.reduce((sum, d) => sum + d.consistency, 0) / recent.length;

    // Duration signal
    if (avgDuration < 6) {
      signals.push({
        id: `signal_sleep_duration_${Date.now()}`,
        type: 'sleep',
        condition: 'Low sleep duration',
        effect: 'reducing recovery capacity',
        message: 'Low sleep duration is reducing recovery capacity',
        severity: 'high',
        timestamp: new Date(),
      });
    }

    // Consistency signal
    if (avgConsistency < 60) {
      signals.push({
        id: `signal_sleep_consistency_${Date.now()}`,
        type: 'sleep',
        condition: 'Irregular sleep timing',
        effect: 'destabilizing system',
        message: 'Irregular sleep timing is destabilizing system',
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    return signals;
  }
}

export const sleepService = new SleepService();
