/**
 * MACROSCOPE PERFORMANCE OS - GOALS/STREAK HOOK
 * Manages streak and goals state
 */

import { useState, useEffect } from 'react';
import { useSleepSystem, useNutritionSystem, useActivitySystem, useSettings } from './index';
import { generateStreakData, type StreakData } from '../logic/streakEngine';

export function useGoals() {
  const { sleepData, loading: sleepLoading } = useSleepSystem();
  const { nutritionData, loading: nutritionLoading } = useNutritionSystem();
  const { activityData, loading: activityLoading } = useActivitySystem();
  const { settings, loading: settingsLoading } = useSettings();

  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const loading = sleepLoading || nutritionLoading || activityLoading || settingsLoading;

  // Generate streak data when data changes
  useEffect(() => {
    if (!loading && settings) {
      const data = generateStreakData(
        sleepData,
        nutritionData,
        activityData,
        settings
      );
      setStreakData(data);
    }
  }, [sleepData, nutritionData, activityData, settings, loading]);

  return {
    streakData,
    currentStreak: streakData?.currentStreak ?? 0,
    bestStreak: streakData?.bestStreak ?? 0,
    consistency: streakData?.consistency ?? 0,
    calendar: streakData?.calendar ?? [],
    todayRequirements: streakData?.todayRequirements ?? [],
    todayStatus: streakData?.todayStatus ?? null,
    loading
  };
}
