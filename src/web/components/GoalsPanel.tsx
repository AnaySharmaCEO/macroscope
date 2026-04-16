/**
 * MACROSCOPE PERFORMANCE OS - GOALS PANEL
 * Full-screen panel for streak and goals tracking
 */

import { PanelLayout } from '../ui/components/PanelLayout';
import { useGoals } from '../../core/hooks';

interface GoalsPanelProps {
  onBack: () => void;
}

export function GoalsPanel({ onBack }: GoalsPanelProps) {
  const { currentStreak, bestStreak, consistency, calendar, todayRequirements, todayStatus, loading } = useGoals();

  if (loading) {
    return (
      <PanelLayout title="Goals" onBack={onBack}>
        <div className="p-6">
          <div className="text-sm text-[#737373]">Loading goals...</div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Goals" onBack={onBack}>
      <div className="p-6 space-y-8">
        {/* Current Streak - Dominant */}
        <div className="text-center py-8">
          <div className="text-6xl font-light mb-2">🔥</div>
          <div className="text-5xl font-light mb-2">{currentStreak}</div>
          <div className="text-sm text-[#737373]">day streak</div>
          {bestStreak > currentStreak && (
            <div className="text-xs text-[#737373] mt-2">Best: {bestStreak} days</div>
          )}
        </div>

        {/* Today's Requirements */}
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wider text-[#737373]">
            Today's Requirements
          </div>
          <div className="space-y-3">
            {todayRequirements.map((requirement, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-[#e5e5e5]"
              >
                {requirement}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Status */}
        {todayStatus && (
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-[#737373]">Today's Status</div>
            <div className="grid grid-cols-3 gap-3">
              <StatusPill label="Sleep" success={todayStatus.sleep >= 0.5} />
              <StatusPill label="Nutrition" success={todayStatus.nutrition >= 0.5} />
              <StatusPill label="Activity" success={todayStatus.activity >= 0.5} />
            </div>
          </div>
        )}

        {/* Consistency Stats */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs uppercase tracking-wider text-[#737373] mb-3">
            30-Day Consistency
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-light">{consistency}%</div>
            <div className="text-xs text-[#737373]">success rate</div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wider text-[#737373]">Last 30 Days</div>
          <div className="grid grid-cols-7 gap-2">
            {calendar.map((day, i) => {
              const isToday = i === calendar.length - 1;
              const isSuccess = day.state === 'success';
              const isMissed = day.state === 'missed';
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-colors ${
                    isSuccess
                      ? 'bg-[#10b981] text-black'
                      : isMissed
                      ? 'bg-white/5 border border-white/10 text-[#737373]'
                      : 'bg-white/5 border border-white/5 text-[#404040]'
                  } ${isToday ? 'ring-2 ring-[#00D4FF]' : ''}`}
                  title={`${day.date.toLocaleDateString()} — ${day.state} (score: ${(day.score * 100).toFixed(0)}%)`}
                >
                  {isSuccess ? '✓' : isMissed ? '—' : '·'}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-[#737373]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#10b981]" />
              <span>Success</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded ring-2 ring-[#00D4FF]" />
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}

/**
 * Status pill component
 */
function StatusPill({ label, success }: { label: string; success: boolean }) {
  return (
    <div
      className={`p-3 rounded-lg text-center ${
        success
          ? 'bg-[#10b981]/20 border border-[#10b981]/40'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className="text-xs text-[#737373] mb-1">{label}</div>
      <div className={`text-lg ${success ? 'text-[#10b981]' : 'text-[#737373]'}`}>
        {success ? '✓' : '—'}
      </div>
    </div>
  );
}
