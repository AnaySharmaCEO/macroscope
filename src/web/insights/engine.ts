/**
 * MACROSCOPE PERFORMANCE OS - INSIGHTS ENGINE
 * Pure logic functions for generating weekly insights
 * NO UI IMPORTS - Pure TypeScript only
 */

import type { SleepData, NutritionData, ActivityData, SystemKey, SystemScores, CrossSystemPattern, PriorityAction, WeeklyInsightData } from './types';

/**
 * Score sleep system 0-100
 */
export function scoreSleep(data: SleepData[]): number {
  if (data.length === 0) return 50;

  // Average duration vs 8h target (50% weight)
  const avgDuration = data.reduce((sum, d) => sum + d.duration, 0) / data.length;
  const durationScore = Math.min(100, (avgDuration / 8) * 100);

  // Average quality score (convert 1-10 to 0-100, 50% weight)
  const avgQuality = data.reduce((sum, d) => sum + d.quality, 0) / data.length;
  const qualityScore = (avgQuality / 10) * 100;

  // Base score
  let score = (durationScore * 0.5) + (qualityScore * 0.5);

  // Variance penalty: mean absolute deviation from avg duration × 10, capped at 30 points
  const deviations = data.map(d => Math.abs(d.duration - avgDuration));
  const meanDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
  const variancePenalty = Math.min(30, meanDeviation * 10);

  score = Math.max(0, score - variancePenalty);

  return Math.round(score);
}

/**
 * Calculate sleep variance (mean absolute deviation)
 */
export function calculateSleepVariance(data: SleepData[]): number {
  if (data.length === 0) return 0;
  const avgDuration = data.reduce((sum, d) => sum + d.duration, 0) / data.length;
  const deviations = data.map(d => Math.abs(d.duration - avgDuration));
  return deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
}

/**
 * Score activity system 0-100
 */
export function scoreActivity(data: ActivityData[]): number {
  if (data.length === 0) return 30;

  // Average steps vs 10,000 target
  const avgSteps = data.reduce((sum, d) => sum + d.steps, 0) / data.length;
  const stepsScore = Math.min(100, (avgSteps / 10000) * 100);

  // Check if we have activeMinutes data (via totalDuration)
  const hasActiveMinutes = data.some(d => d.totalDuration > 0);

  if (hasActiveMinutes) {
    // 60% steps + 40% active minutes (30 min target)
    const avgActiveMinutes = data.reduce((sum, d) => sum + d.totalDuration, 0) / data.length;
    const activeMinutesScore = Math.min(100, (avgActiveMinutes / 30) * 100);
    return Math.round(stepsScore * 0.6 + activeMinutesScore * 0.4);
  }

  return Math.round(stepsScore);
}

/**
 * Score nutrition system 0-100
 */
export function scoreNutrition(data: NutritionData[]): number {
  if (data.length === 0) return 40;

  const avgCalories = data.reduce((sum, d) => sum + d.calories, 0) / data.length;
  const avgProtein = data.reduce((sum, d) => sum + d.protein, 0) / data.length;

  // Calorie score: 80pts if avg calories in 1600–2500 range; proportional penalties outside
  let calScore = 80;
  if (avgCalories < 1600) {
    const deficit = 1600 - avgCalories;
    calScore = Math.max(0, 80 - (deficit / 1600) * 80);
  } else if (avgCalories > 2500) {
    const excess = avgCalories - 2500;
    calScore = Math.max(0, 80 - (excess / 2500) * 80);
  }

  // Protein score: avg protein / 120g × 100, capped at 100
  const proteinScore = Math.min(100, (avgProtein / 120) * 100);

  // Final: calScore × 0.55 + proteinScore × 0.45
  return Math.round(calScore * 0.55 + proteinScore * 0.45);
}

/**
 * Detect cross-system patterns
 */
export function detectPatterns(
  scores: SystemScores,
  sleepData: SleepData[],
  activityData: ActivityData[],
  nutritionData: NutritionData[]
): CrossSystemPattern[] {
  const patterns: CrossSystemPattern[] = [];
  const sleepVariance = calculateSleepVariance(sleepData);

  // Pattern 1: sleep < 65 AND activity < 65
  if (scores.sleep < 65 && scores.activity < 65) {
    patterns.push({
      systems: ['sleep', 'activity'],
      message: 'Poor sleep and low activity are creating a negative feedback loop — insufficient recovery limits energy output, which further degrades sleep pressure and quality.'
    });
  }

  // Pattern 2: sleep < 65 AND activity >= 65
  else if (scores.sleep < 65 && scores.activity >= 65) {
    patterns.push({
      systems: ['sleep', 'activity'],
      message: 'Sleep quality is acting as a ceiling on activity performance — despite consistent movement, inadequate recovery is preventing full adaptation and energy optimization.'
    });
  }

  // Pattern 3: activity >= 75 AND sleep < 60 AND nutrition < 65
  if (scores.activity >= 75 && scores.sleep < 60 && scores.nutrition < 65) {
    patterns.push({
      systems: ['activity', 'sleep', 'nutrition'],
      message: 'High training load combined with poor nutritional support is degrading sleep architecture — the body lacks resources for proper overnight repair and nervous system recovery.'
    });
  }

  // Pattern 4: nutrition < 60 AND (sleep < 70 OR activity < 70)
  if (scores.nutrition < 60 && (scores.sleep < 70 || scores.activity < 70)) {
    patterns.push({
      systems: ['nutrition', 'sleep', 'activity'],
      message: 'Nutritional gaps are limiting recovery capacity across systems — insufficient protein and caloric support constrains both sleep quality and activity adaptation.'
    });
  }

  // Pattern 5: sleepVariance > 1.2 AND activity < 75
  if (sleepVariance > 1.2 && scores.activity < 75) {
    patterns.push({
      systems: ['sleep', 'activity'],
      message: 'Circadian disruption from inconsistent sleep timing is suppressing daytime energy output — irregular sleep-wake patterns prevent optimal cortisol and alertness cycles.'
    });
  }

  // Pattern 6: activity >= 70 AND nutrition >= 70 AND sleep < 60
  if (scores.activity >= 70 && scores.nutrition >= 70 && scores.sleep < 60) {
    patterns.push({
      systems: ['sleep', 'activity', 'nutrition'],
      message: 'Sleep stands out as the primary drag on an otherwise well-aligned system — activity and nutrition fundamentals are solid, but poor sleep prevents full system integration.'
    });
  }

  // Pattern 7: all systems strong
  if (scores.sleep >= 75 && scores.activity >= 75 && scores.nutrition >= 75) {
    patterns.push({
      systems: ['sleep', 'activity', 'nutrition'],
      message: 'All systems are compounding positively — consistent sleep drives training adaptation, sufficient nutrition supports recovery, and activity reinforces circadian rhythm and sleep pressure.'
    });
  }

  // Fallback: no strong patterns matched
  if (patterns.length === 0) {
    patterns.push({
      systems: ['sleep', 'nutrition'],
      message: 'No strong negative feedback loops detected — small consistency improvements to sleep timing and protein intake could unlock incremental gains across the system.'
    });
  }

  // Return max 4 patterns
  return patterns.slice(0, 4);
}

/**
 * Build priority action based on bottleneck
 */
export function buildPriorityAction(
  bottleneck: SystemKey,
  scores: SystemScores,
  sleepData: SleepData[],
  activityData: ActivityData[],
  nutritionData: NutritionData[]
): PriorityAction {
  const sleepVariance = calculateSleepVariance(sleepData);

  if (bottleneck === 'sleep') {
    if (sleepVariance > 1.2) {
      return {
        focus: 'sleep',
        message: 'Lock in a fixed bedtime for the next 5 nights. Circadian consistency will improve recovery quality and raise daytime energy — which directly lifts activity output and metabolic function.',
        panelLink: 'sleep'
      };
    }

    const avgDuration = sleepData.length > 0
      ? sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length
      : 0;

    if (avgDuration < 7) {
      return {
        focus: 'sleep',
        message: 'Extend sleep duration by 30-45 minutes for the next 7 nights. Longer sleep windows enhance deep sleep cycles — improving muscle recovery, cognitive performance, and metabolic regulation across all systems.',
        panelLink: 'sleep'
      };
    }

    return {
      focus: 'sleep',
      message: 'Optimize sleep environment (darkness, temperature, noise) for the next week. Better sleep architecture directly translates to improved training response and nutrient partitioning.',
      panelLink: 'sleep'
    };
  }

  if (bottleneck === 'activity') {
    const avgSteps = activityData.length > 0
      ? activityData.reduce((sum, d) => sum + d.steps, 0) / activityData.length
      : 0;

    if (avgSteps < 7500) {
      return {
        focus: 'activity',
        message: 'Add a 20-minute walk after dinner for the next 5 days. Low-intensity movement signals the body to regulate sleep pressure — improving both sleep depth and metabolic health.',
        panelLink: 'activity'
      };
    }

    return {
      focus: 'activity',
      message: 'Increase daily step count by 2,000 steps for the next 7 days. Higher NEAT (non-exercise activity) improves insulin sensitivity and cardiovascular efficiency — supporting better recovery and nutrient utilization.',
      panelLink: 'activity'
    };
  }

  // bottleneck === 'nutrition'
  const avgProtein = nutritionData.length > 0
    ? nutritionData.reduce((sum, d) => sum + d.protein, 0) / nutritionData.length
    : 0;

  if (avgProtein < 100) {
    return {
      focus: 'nutrition',
      message: 'Add 30–40g of protein to your daily intake for the next 7 days. Protein drives overnight muscle repair — this directly upgrades recovery quality, training adaptation, and satiety regulation.',
      panelLink: 'nutrition'
    };
  }

  return {
    focus: 'nutrition',
    message: 'Tighten calorie consistency to within ±200 kcal daily for the next week. Metabolic stability from consistent energy intake improves sleep quality and training performance predictability.',
    panelLink: 'nutrition'
  };
}

/**
 * Build weekly summary
 */
export function buildSummary(
  bottleneck: SystemKey,
  scores: SystemScores,
  overallScore: number
): string {
  const sortedSystems = (Object.entries(scores) as [SystemKey, number][])
    .sort((a, b) => a[1] - b[1]);
  
  const secondLowest = sortedSystems[1][0];

  if (overallScore >= 75) {
    return `Overall system performance is strong (${overallScore}/100). ${capitalizeFirst(bottleneck)} remains the marginal constraint at ${scores[bottleneck]}/100, with ${secondLowest} at ${scores[secondLowest]}/100. Small optimizations to ${bottleneck} timing and consistency could push the system into elite territory.`;
  }

  if (overallScore >= 55) {
    return `${capitalizeFirst(bottleneck)} is the primary limiting factor at ${scores[bottleneck]}/100. Fixing ${bottleneck} will unlock latent potential in ${secondLowest} (${scores[secondLowest]}/100) and activity systems — they're being held back by upstream constraints.`;
  }

  return `Multi-system weakness detected (overall ${overallScore}/100). ${capitalizeFirst(bottleneck)} at ${scores[bottleneck]}/100 is the highest-leverage fix. Addressing ${bottleneck} first will create positive cascades into ${secondLowest} and the broader system.`;
}

/**
 * Main engine export - generates weekly insight
 */
export function generateWeeklyInsight(
  sleepData: SleepData[],
  nutritionData: NutritionData[],
  activityData: ActivityData[]
): WeeklyInsightData {
  // Calculate scores
  const scores: SystemScores = {
    sleep: scoreSleep(sleepData),
    activity: scoreActivity(activityData),
    nutrition: scoreNutrition(nutritionData)
  };

  // Find bottleneck (lowest score)
  const bottleneck = (Object.entries(scores) as [SystemKey, number][])
    .reduce((min, [key, val]) => val < scores[min] ? key : min, 'sleep' as SystemKey);

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (scores.sleep * 0.35) + (scores.activity * 0.3) + (scores.nutrition * 0.35)
  );

  // Detect patterns
  const patterns = detectPatterns(scores, sleepData, activityData, nutritionData);

  // Build priority action
  const action = buildPriorityAction(bottleneck, scores, sleepData, activityData, nutritionData);

  // Build summary
  const summary = buildSummary(bottleneck, scores, overallScore);

  // Calculate confidence based on data volume
  const totalEntries = sleepData.length + nutritionData.length + activityData.length;
  const confidence = 0.55 + Math.min(1, totalEntries / 21) * 0.45;

  return {
    summary,
    scores,
    bottleneck,
    patterns,
    action,
    confidence,
    overallScore
  };
}

/**
 * Helper: capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
