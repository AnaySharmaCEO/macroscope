/**
 * MACROSCOPE PERFORMANCE OS - ACTIVITY SERVICE
 * Handles activity system data operations
 */

import type { ActivityData, Workout, SystemStatus, Signal } from '../types';
import * as api from '../api';

class ActivityService {
  /**
   * Fetch activity data for a date range
   */
  async getActivityData(userId: string, startDate: Date, endDate: Date): Promise<ActivityData[]> {
    return await api.getActivityData(userId, startDate, endDate);
  }

  /**
   * Get today's activity data
   */
  async getTodayActivity(userId: string): Promise<ActivityData | null> {
    const today = new Date();
    const data = await this.getActivityData(userId, today, today);
    return data.length > 0 ? data[0] : null;
  }

  /**
   * Log workout
   */
  async logWorkout(userId: string, date: Date, workout: Omit<Workout, 'id'>): Promise<Workout> {
    return await api.logActivity(userId, date, workout);
  }

  /**
   * Update steps
   */
  async updateSteps(userId: string, date: Date, steps: number): Promise<void> {
    return await api.updateSteps(userId, date, steps);
  }

  async getActivityInsights(userId: string, startDate: Date, endDate: Date) {
    return await api.getActivityInsights(userId, startDate, endDate);
  }

  /**
   * Calculate activity status
   */
  calculateStatus(data: ActivityData[]): SystemStatus {
    if (data.length === 0) return 'unknown';

    const recent = data.slice(-7); // Last 7 days
    const avgSteps = recent.reduce((sum, d) => sum + d.steps, 0) / recent.length;
    const workoutDays = recent.filter(d => (Array.isArray(d.workouts) ? d.workouts.length : 0) > 0).length;

    // If we have strong data: stable
    if (avgSteps >= 8000 && workoutDays >= 3) return 'stable';
    // Decent activity: imbalanced
    if (avgSteps >= 5000 || workoutDays >= 2) return 'imbalanced';
    // Check today specifically — if they logged a workout today, don't show red
    const today = recent[recent.length - 1];
    if (today && (today.steps >= 5000 || (Array.isArray(today.workouts) && today.workouts.length > 0))) return 'imbalanced';
    return 'low';
  }

  /**
   * Generate activity-related signals
   */
  generateSignals(data: ActivityData[]): Signal[] {
    const signals: Signal[] = [];

    if (data.length === 0) return signals;

    const recent = data.slice(-7);
    const avgSteps = recent.reduce((sum, d) => sum + d.steps, 0) / recent.length;
    const workoutDays = recent.filter(d => d.workouts.length > 0).length;

    // Low activity signal
    if (avgSteps < 5000) {
      signals.push({
        id: `signal_activity_steps_${Date.now()}`,
        type: 'activity',
        condition: 'Low activity',
        effect: 'weakening recovery',
        message: 'Low activity is weakening recovery',
        severity: 'high',
        timestamp: new Date(),
      });
    }

    // Workout frequency signal
    if (workoutDays < 2) {
      signals.push({
        id: `signal_activity_workouts_${Date.now()}`,
        type: 'activity',
        condition: 'Infrequent workouts',
        effect: 'reducing system stability',
        message: 'Infrequent workouts are reducing system stability',
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    return signals;
  }
}

export const activityService = new ActivityService();
