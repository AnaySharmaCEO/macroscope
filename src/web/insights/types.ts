/**
 * MACROSCOPE PERFORMANCE OS - INSIGHTS TYPES
 * Type definitions for the insights engine
 */

import type { SleepData, NutritionData, ActivityData } from '../../core/types';

// Re-export core types for convenience
export type { SleepData, NutritionData, ActivityData };

export type SystemKey = 'sleep' | 'activity' | 'nutrition';

export interface SystemScores {
  sleep: number;
  activity: number;
  nutrition: number;
}

export interface CrossSystemPattern {
  systems: SystemKey[];   // MUST have ≥ 2 entries
  message: string;
}

export interface PriorityAction {
  focus: SystemKey;
  message: string;
  panelLink: string;      // which panel to navigate to
}

export interface WeeklyInsightData {
  summary: string;
  scores: SystemScores;
  bottleneck: SystemKey;
  patterns: CrossSystemPattern[];
  action: PriorityAction;
  confidence: number;
  overallScore: number;
}

export type ViewMode = 'simple' | 'detailed';

export type ActivePanel =
  | null
  | 'weeklyInsight'
  | 'sleep'
  | 'nutrition'
  | 'activity'
  | 'weight';
