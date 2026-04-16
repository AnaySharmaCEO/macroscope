/**
 * MACROSCOPE PERFORMANCE OS - NUTRITION SYSTEM HOOK
 * Manages nutrition system state and operations
 */

import { useState, useEffect } from 'react';
import type { NutritionData, Meal, SystemStatus, Signal, TimeRange } from '../types';
import { nutritionService } from '../services';
import type { DailyInsights, FoodSuggestion } from '../api';
import { useAuth } from './useAuth';

export function useNutritionSystem(timeRange: TimeRange = 'week') {
  const { userId } = useAuth();
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
  const [status, setStatus] = useState<SystemStatus>('unknown');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [dailyInsights, setDailyInsights] = useState<DailyInsights | null>(null);
  const [suggestedFoods, setSuggestedFoods] = useState<FoodSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(timeRange);
      if (!userId) throw new Error('Not authenticated');
      const data = await nutritionService.getNutritionData(userId, startDate, endDate);
      const [insights, suggestions] = await Promise.all([
        nutritionService.getDailyInsights(userId, new Date()).catch(() => null),
        nutritionService.suggestFoods(userId, new Date()).catch(() => []),
      ]);

      setNutritionData(data);
      setStatus(nutritionService.calculateStatus(data));
      setSignals(nutritionService.generateSignals(data));
      setDailyInsights(insights);
      setSuggestedFoods(suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async (date: Date, meal: Omit<Meal, 'id'>) => {
    try {
      if (!userId) throw new Error('Not authenticated');
      await nutritionService.logMeal(userId, date, meal);
      await fetchNutritionData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log meal');
      throw err;
    }
  };

  const removeMeal = async (mealId: string) => {
    try {
      await nutritionService.removeMeal(mealId);
      await fetchNutritionData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove meal');
      throw err;
    }
  };

  useEffect(() => {
    fetchNutritionData();
    
    const handleUpdate = () => fetchNutritionData();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('macroscope-api-update', handleUpdate);
      return () => window.removeEventListener('macroscope-api-update', handleUpdate);
    }
  }, [timeRange]);

  return {
    nutritionData,
    status,
    signals,
    dailyInsights,
    suggestedFoods,
    loading,
    error,
    logMeal,
    removeMeal,
    refresh: fetchNutritionData,
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