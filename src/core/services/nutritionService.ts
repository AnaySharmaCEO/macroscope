/**
 * MACROSCOPE PERFORMANCE OS - NUTRITION SERVICE
 * Handles nutrition system data operations
 */

import type { NutritionData, SystemStatus, Signal, Meal } from '../types';
import * as api from '../api';

class NutritionService {
  /**
   * Fetch nutrition data for a date range
   */
  async getNutritionData(userId: string, startDate: Date, endDate: Date): Promise<NutritionData[]> {
    return await api.getNutritionData(userId, startDate, endDate);
  }

  /**
   * Get today's nutrition data
   */
  async getTodayNutrition(userId: string): Promise<NutritionData | null> {
    const today = new Date();
    const data = await this.getNutritionData(userId, today, today);
    return data.length > 0 ? data[0] : null;
  }

  /**
   * Log new meal
   */
  async logMeal(userId: string, date: Date, meal: Omit<Meal, 'id'>): Promise<Meal> {
    return await api.logMeal(userId, date, meal);
  }

  async getDailyInsights(userId: string, date: Date) {
    return await api.getDailyInsights(userId, date);
  }

  async suggestFoods(userId: string, date: Date) {
    return await api.suggestFoods(userId, date);
  }

  /**
   * Remove meal
   */
  async removeMeal(mealId: string): Promise<void> {
    return await api.removeMeal(mealId);
  }

  /**
   * Calculate nutrition status
   */
  calculateStatus(data: NutritionData[]): SystemStatus {
    if (data.length === 0) return 'unknown';

    const recent = data.slice(-7); // Last 7 days
    const avgCalories = recent.reduce((sum, d) => sum + d.calories, 0) / recent.length;

    // Simple calorie-based status (to be enhanced with macro balance)
    if (avgCalories >= 1800 && avgCalories <= 2500) return 'stable';
    if (avgCalories >= 1500 && avgCalories <= 3000) return 'imbalanced';
    return 'low';
  }

  /**
   * Generate nutrition-related signals
   */
  generateSignals(data: NutritionData[], sleepData?: any): Signal[] {
    const signals: Signal[] = [];

    if (data.length === 0) return signals;

    const recent = data.slice(-7);
    const avgCalories = recent.reduce((sum, d) => sum + d.calories, 0) / recent.length;

    // Calorie deficit signal
    if (avgCalories < 1500) {
      signals.push({
        id: `signal_nutrition_calories_${Date.now()}`,
        type: 'nutrition',
        condition: 'Low calorie intake',
        effect: 'reducing energy availability',
        message: 'Low calorie intake is reducing energy availability',
        severity: 'high',
        timestamp: new Date(),
      });
    }

    // Late meal timing signal (cross-system)
    const lateMeals = recent.filter(d => {
      if (!d.lastMealTime) return false;
      const [hours] = d.lastMealTime.split(':').map(Number);
      return hours >= 21; // After 9 PM
    });

    if (lateMeals.length >= 3) {
      signals.push({
        id: `signal_nutrition_timing_${Date.now()}`,
        type: 'nutrition',
        condition: 'Late meals',
        effect: 'reducing sleep consistency',
        message: 'Late meals are reducing sleep consistency',
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    return signals;
  }
}

export const nutritionService = new NutritionService();