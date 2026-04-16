/**
 * MACROSCOPE PERFORMANCE OS - WEEKLY INSIGHT PANEL
 * Cross-system strategist - never contains single-system content
 */

import type { WeeklyInsightData, ViewMode, ActivePanel } from '../types';
import { ViewToggle, SectionLabel, ScoreBar, PanelContent, DataSourceBadge, ChartPlaceholder, SystemTag } from '../primitives';
import { PanelLayout } from '../../ui/components/PanelLayout';

interface WeeklyInsightPanelProps {
  insight: WeeklyInsightData;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onBack: () => void;
  onNavigateToPanel: (panel: ActivePanel) => void;
  sleepCount: number;
  nutritionCount: number;
  activityCount: number;
}

export function WeeklyInsightPanel({
  insight,
  viewMode,
  setViewMode,
  onBack,
  onNavigateToPanel,
  sleepCount,
  nutritionCount,
  activityCount
}: WeeklyInsightPanelProps) {
  return (
    <PanelLayout title="Weekly Insight" onBack={onBack}>
      <PanelContent>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

        {viewMode === 'simple' && (
          <div className="space-y-6">
            {/* System Scores */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <SectionLabel>System Scores</SectionLabel>
                <div className="text-sm text-[#e5e5e5]">
                  Overall: <span className="font-medium">{insight.overallScore}</span>
                </div>
              </div>
              <ScoreBar
                label="Sleep"
                score={insight.scores.sleep}
                isBottleneck={insight.bottleneck === 'sleep'}
              />
              <ScoreBar
                label="Activity"
                score={insight.scores.activity}
                isBottleneck={insight.bottleneck === 'activity'}
              />
              <ScoreBar
                label="Nutrition"
                score={insight.scores.nutrition}
                isBottleneck={insight.bottleneck === 'nutrition'}
              />
            </div>

            {/* System Analysis */}
            <div className="space-y-3">
              <SectionLabel>System Analysis</SectionLabel>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm leading-relaxed text-[#e5e5e5]">
                  {insight.summary}
                </div>
              </div>
            </div>

            {/* Cross-System Patterns */}
            <div className="space-y-3">
              <SectionLabel>Cross-System Patterns</SectionLabel>
              {insight.patterns.map((pattern, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {pattern.systems.map((sys) => (
                      <SystemTag key={sys} system={sys} />
                    ))}
                  </div>
                  <div className="text-sm leading-relaxed text-[#e5e5e5]">
                    {pattern.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Priority Action */}
<div className="p-5 rounded-xl bg-gradient-to-br from-[#E5E7EB] to-[#9CA3AF] border-2 border-white text-black space-y-4">
              <div className="flex items-center justify-between">
                <div className="uppercase tracking-wider text-black/60 font-bold text-[#b71818] text-[15px] text-[14px]">
                  Priority Action
                </div>
                <div className="text-xs text-black/60 text-[#000000] font-bold">
                  Confidence: {Math.round(insight.confidence * 100)}%
                </div>
              </div>
              <div className="text-xs uppercase tracking-wider text-black/60 text-[#000000] font-bold">
                Focus: {insight.action.focus}
              </div>
              <div className="text-sm leading-relaxed font-medium">
                {insight.action.message}
              </div>
              <button
                onClick={() => onNavigateToPanel(insight.action.panelLink as ActivePanel)}
                className="w-full py-3 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors"
              >
                Open {insight.action.focus} panel →
              </button>
            </div>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-6">
            {/* Combined System Trend */}
            <ChartPlaceholder
              icon="📊"
              label="7-day combined system trend (Sleep · Activity · Nutrition)"
            />

            {/* Daily Combined Signals */}
            <div className="space-y-3">
              <SectionLabel>Daily Combined Signals</SectionLabel>
              {generateMockDailySignals().map((day, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-[#e5e5e5]">{day.date}</div>
                    <div className={`text-xs font-medium ${day.statusColor}`}>
                      {day.status}
                    </div>
                  </div>
                  <div className="text-xs text-[#737373]">
                    Sleep: {day.sleepH}h · Steps: {day.steps.toLocaleString()} · Calories: {day.kcal}
                  </div>
                </div>
              ))}
            </div>

            {/* Data Source Badge */}
            <DataSourceBadge
              sleepCount={sleepCount}
              nutritionCount={nutritionCount}
              activityCount={activityCount}
            />
          </div>
        )}
      </PanelContent>
    </PanelLayout>
  );
}

/**
 * Generate mock daily signals for detailed view
 */
function generateMockDailySignals() {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  return dates.map((date) => {
    const sleepH = 6 + Math.random() * 2.5;
    const steps = Math.round(6000 + Math.random() * 6000);
    const kcal = Math.round(1800 + Math.random() * 800);

    let status = 'Weak';
    let statusColor = 'text-[#ef4444]';

    if (sleepH >= 7.5 && steps >= 9000 && kcal >= 2000) {
      status = 'Strong';
      statusColor = 'text-[#10b981]';
    } else if (sleepH >= 6.5 && steps >= 7000 && kcal >= 1800) {
      status = 'Moderate';
      statusColor = 'text-[#f59e0b]';
    }

    return {
      date,
      sleepH: sleepH.toFixed(1),
      steps,
      kcal,
      status,
      statusColor
    };
  });
}
