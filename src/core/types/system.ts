/**
 * MACROSCOPE PERFORMANCE OS - CORE TYPES
 * System-level type definitions
 */

// Core system identifiers
export type SystemType = "sleep" | "nutrition" | "activity";

// System health status
export type SystemStatus = "stable" | "imbalanced" | "low" | "unknown";

// Signal definition - system-driven alerts
export interface Signal {
  id: string;
  type: SystemType;
  condition: string;
  effect: string;
  message: string; // "[Condition] is affecting [System Outcome]"
  severity: "high" | "medium" | "low";
  state?: 'NEW' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  timestamp: Date;
}

// Base metric structure
export interface Metric {
  id: string;
  systemType: SystemType;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

// System overview state
export interface SystemOverview {
  sleepStatus: SystemStatus;
  nutritionStatus: SystemStatus;
  activityStatus: SystemStatus;
  systemStatus: "starting" | "building" | "stable" | "optimal";
  dailyScore: number; // 0-100
  signals: Signal[];
  priorityAction: string | null;
  keyMetrics: {
    sleepDuration: number; // hours
    calories: number;
    steps: number;
  };
  streakData?: any; // Will be properly typed
  lastUpdated: Date;
}

// Sleep system data
export interface SleepData {
  id: string;
  date: Date;
  duration: number; // hours
  bedtime: string; // HH:mm
  wakeTime: string; // HH:mm
  quality: number; // 1-10 scale
  consistency: number; // calculated metric 0-100
}

// Nutrition system data
export interface NutritionData {
  id: string;
  date: Date;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  meals: Meal[];
  lastMealTime: string | null; // HH:mm
}

export interface Meal {
  id: string;
  time: string; // HH:mm
  name: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodId?: string;
  quantity?: number;
  quantityUnit?: 'grams' | 'cup' | 'bowl' | 'piece';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Activity system data
export interface ActivityData {
  id: string;
  date: Date;
  steps: number;
  workouts: Workout[];
  intensity: "low" | "moderate" | "high";
  totalDuration: number; // minutes
}

export interface Workout {
  id: string;
  name: string;
  duration: number; // minutes
  intensity: "low" | "moderate" | "high";
  timestamp: Date;
}

// User profile
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  stepTarget: number;
  height: number; // cm
  weight: number; // kg
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bodyfatPercentage?: number;
  targetWeight?: number;
  goalTimelineWeeks?: number;
  goal: "maintain" | "improve" | "lose" | "gain";
  activityLevel: "low" | "moderate" | "high";
  eatingPattern: "light" | "balanced" | "heavy";
  typicalSleepHours: number;
  onboarding_complete?: boolean;
}

// Settings & Configuration
export interface SystemSettings {
  sleepTarget: number; // hours
  calorieTarget: number;
  activityTarget: number; // steps
  goalMode: 'maintain' | 'cut' | 'bulk';
  theme: 'dark' | 'light';
  units: 'metric' | 'imperial';
  notifications: boolean;
}

export interface UserAccount {
  name: string;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
}

// Time range for queries
export type TimeRange = "today" | "week" | "month" | "all";