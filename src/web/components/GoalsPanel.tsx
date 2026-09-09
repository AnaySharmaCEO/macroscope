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
          <div className="text-sm text-[var(--text-3)]">Loading goals...</div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title="Goals" onBack={onBack}>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
        {/* G2: Current Streak - Fraunces hero, no emoji */}
        <div 
          className="text-center py-8 p-6 border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <div className="font-serif text-6xl font-semibold text-[var(--text-1)] tracking-tight mb-2">
            {currentStreak}
          </div>
          <div className="text-sm text-[var(--text-3)] font-medium">
            Day streak
          </div>
          {bestStreak > currentStreak && (
            <div className="text-xs text-[var(--text-3)] mt-2 font-mono">
              Best: {bestStreak} days
            </div>
          )}
        </div>

        {/* G3: Today's Requirements */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-[var(--text-3)]">
            Today's requirements
          </div>
          <div className="space-y-2">
            {todayRequirements.map((requirement, i) => (
              <div
                key={i}
                className="p-4 border text-sm text-[var(--text-2)]"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {requirement}
              </div>
            ))}
          </div>
        </div>

        {/* G4: Today's Status */}
        {todayStatus && (
          <div className="space-y-3">
            <div className="text-xs font-medium text-[var(--text-3)]">Today's status</div>
            <div className="grid grid-cols-3 gap-3">
              <StatusPill label="Sleep" success={todayStatus.sleep >= 0.5} />
              <StatusPill label="Nutrition" success={todayStatus.nutrition >= 0.5} />
              <StatusPill label="Activity" success={todayStatus.activity >= 0.5} />
            </div>
          </div>
        )}

        {/* Consistency Stats */}
        <div 
          className="p-6 border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <div className="text-xs font-medium text-[var(--text-3)] mb-2">
            30-day consistency
          </div>
          <div className="flex items-baseline gap-2">
            <div className="font-serif text-3xl font-semibold text-[var(--text-1)]">{consistency}%</div>
            <div className="text-xs text-[var(--text-3)]">success rate</div>
          </div>
        </div>

        {/* G1: Calendar View 30-day grid */}
        <div 
          className="p-6 border space-y-5"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <div className="text-xs font-medium text-[var(--text-3)]">Last 30 days</div>
          <div className="grid grid-cols-7 gap-2">
            {calendar.map((day, i) => {
              const isToday = i === calendar.length - 1;
              const isSuccess = day.state === 'success';
              const isMissed = day.state === 'missed';

              let cellBg = 'var(--surface-2)';
              let cellBorder = 'var(--border)';
              let cellText = 'var(--text-3)';

              if (isSuccess) {
                cellBg = 'var(--good-soft)';
                cellBorder = 'var(--good-border)';
                cellText = 'var(--good)';
              } else if (isMissed) {
                cellBg = 'var(--surface-2)';
                cellBorder = 'var(--border)';
                cellText = 'var(--text-3)';
              }

              if (isToday) {
                cellBg = 'var(--accent-soft)';
                cellBorder = 'var(--accent)';
                cellText = 'var(--accent)';
              }

              return (
                <div
                  key={i}
                  className="aspect-square flex items-center justify-center text-xs font-semibold transition-colors border"
                  style={{
                    backgroundColor: cellBg,
                    borderColor: cellBorder,
                    color: cellText,
                    borderRadius: 'var(--radius-sm)',
                    borderWidth: isToday ? '2px' : '1px',
                  }}
                  title={`${day.date.toLocaleDateString()} — ${day.state} (score: ${(day.score * 100).toFixed(0)}%)`}
                >
                  {isSuccess ? '✓' : isMissed ? '—' : '·'}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-3)] pt-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3.5 h-3.5 border flex items-center justify-center text-[10px] text-[var(--good)]" 
                style={{ 
                  backgroundColor: 'var(--good-soft)', 
                  borderColor: 'var(--good-border)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                ✓
              </div>
              <span>Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3.5 h-3.5 border" 
                style={{ 
                  backgroundColor: 'var(--surface-2)', 
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)'
                }} 
              />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3.5 h-3.5 border-2" 
                style={{ 
                  backgroundColor: 'var(--accent-soft)', 
                  borderColor: 'var(--accent)',
                  borderRadius: 'var(--radius-sm)'
                }} 
              />
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}

/**
 * G4: Status pill component
 */
function StatusPill({ label, success }: { label: string; success: boolean }) {
  return (
    <div
      className="p-3.5 border text-center transition-colors"
      style={{
        backgroundColor: success ? 'var(--good-soft)' : 'var(--surface-2)',
        borderColor: success ? 'var(--good-border)' : 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div className="text-xs text-[var(--text-3)] mb-1">{label}</div>
      <div 
        className="font-serif text-lg font-semibold"
        style={{ color: success ? 'var(--good)' : 'var(--text-3)' }}
      >
        {success ? '✓' : '—'}
      </div>
    </div>
  );
}
