/**
 * MACROSCOPE PERFORMANCE OS - ACTIVITY PANEL
 * All activity-specific analysis lives here
 */

import type { ActivityData, ViewMode } from '../types';
import { ViewToggle, SectionLabel, MetricCard, KvRow, PanelContent } from '../primitives';
import { PanelLayout } from '../../ui/components/PanelLayout';

interface ActivityPanelProps {
  activityData: ActivityData[];
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onBack: () => void;
}

export function ActivityPanel({
  activityData,
  viewMode,
  setViewMode,
  onBack
}: ActivityPanelProps) {
  const latestEntry = activityData.length > 0 ? activityData[activityData.length - 1] : null;

  // Calculate metrics
  const avgSteps = activityData.length > 0
    ? Math.round(activityData.reduce((sum, d) => sum + d.steps, 0) / activityData.length)
    : 0;

  const activeDays = activityData.filter(d => d.steps >= 7500).length;

  const totalWorkouts = activityData.reduce(
    (sum, d) => sum + d.workouts.length,
    0
  );

  const todayWorkouts = latestEntry?.workouts || [];

  return (
    <PanelLayout title="Activity" onBack={onBack}>
      <PanelContent>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

        {viewMode === 'simple' && (
          <div className="space-y-6">
            {/* Steps Overview */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Today"
                value={latestEntry?.steps.toLocaleString() || 0}
                unit="steps"
              />
              <MetricCard
                label="7-Day Avg"
                value={avgSteps.toLocaleString()}
                unit="steps"
              />
            </div>

            {/* Activity Stats */}
            <div className="space-y-3">
              <SectionLabel>Activity Stats</SectionLabel>
              <KvRow label="Active Days (≥7,500 steps)" value={activeDays} />
              <KvRow label="Total Workouts" value={totalWorkouts} />
            </div>

            {/* Today's Workouts */}
            {todayWorkouts.length > 0 && (
              <div className="space-y-3">
                <SectionLabel>Today's Workouts</SectionLabel>
                {todayWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-[#e5e5e5]">{workout.name}</div>
                      <div className="text-xs text-[#737373]">{workout.duration} min</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <SectionLabel>Steps + Active Minutes (Last 7)</SectionLabel>
              <div className="space-y-2">
                {activityData.slice(-7).map((entry) => {
                  const stepsPct = Math.min((entry.steps / 12000) * 100, 100);
                  const activePct = Math.min((entry.totalDuration / 90) * 100, 100);
                  return (
                    <div key={`viz-${entry.id}`} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#737373]">
                        <span>{entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>{entry.steps.toLocaleString()} steps · {entry.totalDuration} min</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-[#00D4FF]" style={{ width: `${stepsPct}%` }} />
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-[#10b981]" style={{ width: `${activePct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <SectionLabel>Recent Activity</SectionLabel>
              {activityData.slice(-7).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-[#e5e5e5]">
                      {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-[#e5e5e5]">
                      {entry.steps.toLocaleString()} steps
                    </div>
                  </div>
                  <div className="text-xs text-[#737373]">
                    {entry.totalDuration > 0 && `Active: ${entry.totalDuration} min · `}
                    {entry.workouts.length > 0
                      ? `${entry.workouts.length} workout${entry.workouts.length > 1 ? 's' : ''}`
                      : 'No workouts'}
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
