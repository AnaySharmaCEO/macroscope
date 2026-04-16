/**
 * MACROSCOPE PERFORMANCE OS - INSIGHTS PAGE
 * Thin router for insights system - business logic lives in engine and panels
 */

import { useState, useEffect } from 'react';
import { useSleepSystem, useNutritionSystem, useActivitySystem } from '../../core/hooks';
import { InsightCard } from '../ui/components/InsightCard';
import { generateWeeklyInsight } from '../insights/engine';
import { ScoreTag } from '../insights/primitives';
import type { ActivePanel, ViewMode, WeeklyInsightData } from '../insights/types';

// Panels
import { WeeklyInsightPanel } from '../insights/panels/WeeklyInsightPanel';
import { SleepPanel } from '../insights/panels/SleepPanel';
import { NutritionPanel } from '../insights/panels/NutritionPanel';
import { ActivityPanel } from '../insights/panels/ActivityPanel';
import { WeightPanel } from '../insights/panels/WeightPanel';
import { formatWeight, kgToLb } from '../../core/utils/units';

export function InsightsPage() {
  const { sleepData, loading: sleepLoading } = useSleepSystem();
  const { nutritionData, loading: nutritionLoading } = useNutritionSystem();
  const { activityData, loading: activityLoading } = useActivitySystem();

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [insight, setInsight] = useState<WeeklyInsightData | null>(null);

  const loading = sleepLoading || nutritionLoading || activityLoading;

  // Generate insight when data is ready
  useEffect(() => {
    if (!loading && sleepData.length > 0 && nutritionData.length > 0 && activityData.length > 0) {
      const weeklyInsight = generateWeeklyInsight(sleepData, nutritionData, activityData);
      setInsight(weeklyInsight);
    }
  }, [loading, sleepData, nutritionData, activityData]);

  // Open panel handler - always resets to simple view
  const openPanel = (panel: ActivePanel) => {
    setActivePanel(panel);
    setViewMode('simple');
  };

  // Back handler - returns to main overview
  const handleBack = () => {
    setActivePanel(null);
    setViewMode('simple');
  };

  // Handle navigation from WeeklyInsightPanel action button
  const handleNavigateToPanel = (panel: ActivePanel) => {
    setActivePanel(panel);
    setViewMode('simple');
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[#737373]">Loading insights...</div>
      </div>
    );
  }

  // No data state
  if (!insight) {
    return (
      <div className="p-8">
        <div className="text-sm text-[#737373]">Not enough data to generate insights.</div>
      </div>
    );
  }

  // Panel routing
  if (activePanel === 'weeklyInsight') {
    return (
      <WeeklyInsightPanel
        insight={insight}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onBack={handleBack}
        onNavigateToPanel={handleNavigateToPanel}
        sleepCount={sleepData.length}
        nutritionCount={nutritionData.length}
        activityCount={activityData.length}
      />
    );
  }

  if (activePanel === 'sleep') {
    return (
      <SleepPanel
        sleepData={sleepData}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onBack={handleBack}
      />
    );
  }

  if (activePanel === 'nutrition') {
    return (
      <NutritionPanel
        nutritionData={nutritionData}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onBack={handleBack}
      />
    );
  }

  if (activePanel === 'activity') {
    return (
      <ActivityPanel
        activityData={activityData}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onBack={handleBack}
      />
    );
  }

  if (activePanel === 'weight') {
    return (
      <WeightPanel
        viewMode={viewMode}
        setViewMode={setViewMode}
        onBack={handleBack}
      />
    );
  }

  // Main overview - calculate preview data
  const latestSleep = sleepData.length > 0 ? sleepData[sleepData.length - 1] : null;
  const avgCalories = nutritionData.length > 0
    ? Math.round(nutritionData.reduce((sum, d) => sum + d.calories, 0) / nutritionData.length)
    : 0;
  const avgSteps = activityData.length > 0
    ? Math.round(activityData.reduce((sum, d) => sum + d.steps, 0) / activityData.length)
    : 0;

  // Mock weight data for preview
  const currentWeight = 70.0;
  const weightChange = -0.5;
  const units = (localStorage.getItem('macroscope_units') as any) || 'metric';
  const displayWeight = units === 'imperial' ? kgToLb(currentWeight) : currentWeight;
  const displayDelta = units === 'imperial' ? kgToLb(weightChange) : weightChange;
  const unitLabel = units === 'imperial' ? 'lb' : 'kg';

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl tracking-tight mb-2">Insights</h1>
        <div className="text-sm text-[#737373]">Understand what's changing</div>
      </div>

      {/* Weekly Insight Preview */}
      <InsightCard
        title="Weekly Insight"
        onClick={() => openPanel('weeklyInsight')}
      >
        {/* Score Tags Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <ScoreTag label="Sleep" score={insight.scores.sleep} />
          <ScoreTag label="Activity" score={insight.scores.activity} />
          <ScoreTag label="Nutrition" score={insight.scores.nutrition} />
        </div>

        {/* Divider */}
        <div className="border-b border-white/10 mb-4" />

        {/* Summary */}
        <div className="text-sm text-[#e5e5e5] line-clamp-2 leading-relaxed mb-4">
          {insight.summary}
        </div>

        {/* Action Preview */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#00D4FF]">
            Fix: {insight.action.focus} → {insight.action.panelLink} panel
          </div>
          <div className="text-xs text-[#737373]">
            Score: {insight.overallScore}
          </div>
        </div>
      </InsightCard>

      {/* Sleep Preview */}
      <InsightCard
        title="Sleep"
        onClick={() => openPanel('sleep')}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-light">{latestSleep?.duration.toFixed(1) || '—'}h</div>
            <div className="text-xs text-[#737373] mt-1">last night</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#e5e5e5]">
              Quality: {latestSleep?.quality || '—'}/5
            </div>
          </div>
        </div>
      </InsightCard>

      {/* Nutrition Preview */}
      <InsightCard
        title="Nutrition"
        onClick={() => openPanel('nutrition')}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#737373]">Avg Calories</span>
          <span className="text-2xl font-light">{avgCalories}</span>
        </div>
      </InsightCard>

      {/* Activity Preview */}
      <InsightCard
        title="Activity"
        onClick={() => openPanel('activity')}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#737373]">Avg Steps</span>
          <span className="text-2xl font-light">{avgSteps.toLocaleString()}</span>
        </div>
      </InsightCard>

      {/* Weight Preview */}
      <InsightCard
        title="Weight"
        onClick={() => openPanel('weight')}
      >
        <div className="flex justify-between items-center">
          <span className="text-2xl font-light">{displayWeight.toFixed(1)} {unitLabel}</span>
          <span className={`text-sm ${displayDelta < 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {displayDelta > 0 ? '+' : ''}{displayDelta.toFixed(1)} {unitLabel}
          </span>
        </div>
      </InsightCard>
    </div>
  );
}