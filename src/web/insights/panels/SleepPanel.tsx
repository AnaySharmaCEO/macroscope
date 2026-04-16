/**
 * MACROSCOPE PERFORMANCE OS - SLEEP PANEL
 * All sleep-specific analysis lives here
 */

import type { SleepData, ViewMode } from '../types';
import { ViewToggle, SectionLabel, MetricCard, KvRow, PanelContent } from '../primitives';
import { PanelLayout } from '../../ui/components/PanelLayout';

interface SleepPanelProps {
  sleepData: SleepData[];
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onBack: () => void;
}

export function SleepPanel({
  sleepData,
  viewMode,
  setViewMode,
  onBack
}: SleepPanelProps) {
  // Calculate metrics
  const latestEntry = sleepData.length > 0 ? sleepData[sleepData.length - 1] : null;
  const avgDuration = sleepData.length > 0
    ? sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length
    : 0;
  const avgQuality = sleepData.length > 0
    ? sleepData.reduce((sum, d) => sum + d.quality, 0) / sleepData.length
    : 0;

  // Calculate variance (consistency)
  const variance = sleepData.length > 1
    ? sleepData.map(d => Math.abs(d.duration - avgDuration))
        .reduce((sum, dev) => sum + dev, 0) / sleepData.length
    : 0;

  // Calculate trend
  const trend = calculateTrend(sleepData);

  // Generate recommendation
  const recommendation = generateRecommendation(avgDuration, avgQuality, variance);

  return (
    <PanelLayout title="Sleep" onBack={onBack}>
      <PanelContent>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

        {viewMode === 'simple' && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Last Night"
                value={latestEntry ? latestEntry.duration.toFixed(1) : '—'}
                unit="hours"
              />
              <MetricCard
                label="Quality Score"
                value={latestEntry ? `${latestEntry.quality}/5` : '—'}
              />
              <MetricCard
                label="7-Day Avg"
                value={avgDuration.toFixed(1)}
                unit="hours"
              />
              <MetricCard
                label="Consistency"
                value={variance > 0 ? `±${variance.toFixed(1)}h` : '—'}
              />
            </div>

            {/* Summary Stats */}
            <div className="space-y-3">
              <SectionLabel>Summary</SectionLabel>
              <KvRow label="Weekly Trend" value={trend} />
              <KvRow label="Avg Quality" value={`${avgQuality.toFixed(1)}/5`} />
            </div>

            {/* Sleep Recommendation */}
            <div className="space-y-3">
              <SectionLabel>Sleep Recommendation</SectionLabel>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm leading-relaxed text-[#e5e5e5]">
                  {recommendation}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <SectionLabel>Duration + Quality (Last 7)</SectionLabel>
              <div className="space-y-2">
                {sleepData.slice(-7).map((entry) => {
                  const durationPct = Math.min((entry.duration / 10) * 100, 100);
                  const qualityPct = Math.min((entry.quality / 5) * 100, 100);
                  return (
                    <div key={`viz-${entry.id}`} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#737373]">
                        <span>{entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>{entry.duration.toFixed(1)}h · Q{entry.quality}/5</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-[#00D4FF]" style={{ width: `${durationPct}%` }} />
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-[#10b981]" style={{ width: `${qualityPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sleep Log */}
            <div className="space-y-3">
              <SectionLabel>Recent Sleep</SectionLabel>
              {sleepData.slice(-7).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-[#e5e5e5]">
                      {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-[#e5e5e5]">
                      {entry.duration.toFixed(1)}h
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#737373]">
                    <span>Quality: {entry.quality}/5</span>
                    {entry.bedtime && entry.wakeTime && (
                      <span>{entry.bedtime} → {entry.wakeTime}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PanelContent>
    </PanelLayout>
  );
}

/**
 * Calculate sleep trend
 */
function calculateTrend(data: SleepData[]): string {
  if (data.length < 4) return '→ Stable';

  const recent = data.slice(-3);
  const previous = data.slice(-7, -3);

  if (recent.length === 0 || previous.length === 0) return '→ Stable';

  const recentAvg = recent.reduce((sum, d) => sum + d.duration, 0) / recent.length;
  const previousAvg = previous.reduce((sum, d) => sum + d.duration, 0) / previous.length;

  const diff = recentAvg - previousAvg;

  if (diff > 0.3) return '↑ Improving';
  if (diff < -0.3) return '↓ Declining';
  return '→ Stable';
}

/**
 * Generate sleep-specific recommendation
 */
function generateRecommendation(
  avgDuration: number,
  avgQuality: number,
  variance: number
): string {
  // High variance (inconsistency)
  if (variance > 1.2) {
    return 'Your sleep timing shows high variability. Lock in a consistent bedtime and wake time for the next 7 days — even on weekends. Circadian consistency is the foundation for sleep quality and will stabilize your energy levels.';
  }

  // Low duration
  if (avgDuration < 7) {
    return 'Your average sleep duration is below the optimal 7-9 hour range. Prioritize extending your sleep window by going to bed 30-45 minutes earlier. Longer sleep duration directly improves recovery, cognitive performance, and metabolic health.';
  }

  // Low quality
  if (avgQuality < 6) {
    return 'Your sleep quality scores suggest fragmented or shallow sleep. Focus on sleep environment optimization: ensure complete darkness (blackout curtains or eye mask), room temperature 65-68°F, and minimize noise. Consider limiting screen time 1 hour before bed.';
  }

  // Decent duration but room for improvement
  if (avgDuration >= 7 && avgDuration < 8) {
    return 'Sleep duration is adequate but can be optimized. Aim for 8 hours consistently. This extra hour will compound into significant improvements in training recovery, focus, and metabolic efficiency over time.';
  }

  // All good
  return 'Your sleep fundamentals are solid. Continue maintaining consistent timing and duration. Small optimizations: track how different evening routines (meal timing, activity, supplements) affect your quality scores to fine-tune further.';
}
