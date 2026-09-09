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
        <div className="text-sm text-[var(--text-3)]">Loading insights...</div>
      </div>
    );
  }

  // No data state
  if (!insight) {
    return (
      <div className="p-8">
        <div className="text-sm text-[var(--text-3)]">Not enough data to generate insights.</div>
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
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--text)',
            lineHeight: '1.2',
          }}
          className="mb-1"
        >
          Insights
        </h1>
        <p 
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-2)',
          }}
        >
          Cross-system performance analysis, correlation patterns, and weekly synthesis
        </p>
      </div>

      {/* 2-Column Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5 items-start">
        {/* LEFT COLUMN: Dominant Weekly Insight Card */}
        <div className="flex flex-col gap-5">
          <InsightCard
            title="Weekly cross-system insight"
            onClick={() => openPanel('weeklyInsight')}
          >
            {/* Score Tags Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <ScoreTag label="Sleep" score={insight.scores.sleep} />
              <ScoreTag label="Activity" score={insight.scores.activity} />
              <ScoreTag label="Nutrition" score={insight.scores.nutrition} />
            </div>

            {/* Hairline Divider */}
            <div className="border-b border-[var(--border)] mb-4" />

            {/* Summary Body */}
            <p 
              style={{
                fontSize: '14px',
                color: 'var(--text-2)',
                lineHeight: '1.6',
              }}
              className="mb-5"
            >
              {insight.summary}
            </p>

            {/* Action Preview */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--accent)',
                  borderBottom: '1px solid var(--accent)',
                  paddingBottom: '1px',
                }}
              >
                Deep dive {insight.action.focus.charAt(0).toUpperCase() + insight.action.focus.slice(1)} →
              </span>
              <div 
                style={{
                  fontSize: '12px',
                  color: 'var(--text-3)',
                }}
              >
                Composite score: <strong style={{ color: 'var(--text)' }}>{insight.overallScore}</strong>
              </div>
            </div>
          </InsightCard>

          {/* Cross-System Connection Spotlight */}
          <div 
            style={{
              background: 'linear-gradient(160deg, var(--surface), var(--surface-2))',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px 26px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div 
              style={{
                fontSize: '12px',
                color: 'var(--accent)',
                fontWeight: 'var(--weight-bold)',
                marginBottom: '8px',
              }}
            >
              Multi-week correlation
            </div>
            <p 
              style={{
                fontSize: '13.5px',
                color: 'var(--text-2)',
                lineHeight: '1.55',
                marginBottom: '12px',
              }}
            >
              Your sleep duration shifts by up to 48 minutes depending on whether meal pacing concludes 3 hours before sleep. Tracking these cross-system relationships reveals the levers behind your recovery.
            </p>
            <span 
              style={{
                fontSize: '13px',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text)',
                borderBottom: '1.5px solid var(--live)',
                paddingBottom: '2px',
              }}
            >
              Explore sleep-nutrition synergy
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Specific Subsystem Panels Stack */}
        <div className="flex flex-col gap-4">
          {/* Sleep Preview */}
          <InsightCard
            title="Sleep"
            onClick={() => openPanel('sleep')}
          >
            <div className="flex justify-between items-center">
              <div>
                <div 
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text)',
                  }}
                >
                  {latestSleep?.duration.toFixed(1) || '—'}h
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>
                  Last night's duration
                </div>
              </div>
              <div className="text-right">
                <span 
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--text)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '3px 9px',
                    fontSize: '11px',
                    fontWeight: 'var(--weight-bold)',
                  }}
                >
                  Quality {latestSleep?.quality || '—'} / 5
                </span>
              </div>
            </div>
          </InsightCard>

          {/* Nutrition Preview */}
          <InsightCard
            title="Nutrition"
            onClick={() => openPanel('nutrition')}
          >
            <div className="flex justify-between items-center">
              <div>
                <div 
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text)',
                  }}
                >
                  {avgCalories}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>
                  Daily average calories
                </div>
              </div>
              <span 
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-2)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '3px 9px',
                  fontSize: '11px',
                  fontWeight: 'var(--weight-bold)',
                }}
              >
                Pacing stable
              </span>
            </div>
          </InsightCard>

          {/* Activity Preview */}
          <InsightCard
            title="Activity"
            onClick={() => openPanel('activity')}
          >
            <div className="flex justify-between items-center">
              <div>
                <div 
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text)',
                  }}
                >
                  {avgSteps.toLocaleString()}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>
                  Daily average steps
                </div>
              </div>
              <span 
                style={{
                  backgroundColor: 'var(--good-soft)',
                  color: 'var(--good)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '3px 9px',
                  fontSize: '11px',
                  fontWeight: 'var(--weight-bold)',
                }}
              >
                Active
              </span>
            </div>
          </InsightCard>

          {/* Weight Preview */}
          <InsightCard
            title="Weight"
            onClick={() => openPanel('weight')}
          >
            <div className="flex justify-between items-center">
              <div>
                <div 
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text)',
                  }}
                >
                  {displayWeight.toFixed(1)} {unitLabel}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>
                  Current trend
                </div>
              </div>
              <span 
                style={{
                  backgroundColor: displayDelta < 0 ? 'var(--good-soft)' : 'var(--live-soft)',
                  color: displayDelta < 0 ? 'var(--good)' : 'var(--live)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '3px 9px',
                  fontSize: '11px',
                  fontWeight: 'var(--weight-bold)',
                }}
              >
                {displayDelta > 0 ? '+' : ''}{displayDelta.toFixed(1)} {unitLabel}
              </span>
            </div>
          </InsightCard>
        </div>
      </div>
    </div>
  );
}