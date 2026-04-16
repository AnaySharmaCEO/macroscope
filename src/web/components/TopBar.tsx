/**
 * MACROSCOPE PERFORMANCE OS - TOP BAR
 * Application top bar with streak and alerts
 */

import { useAlerts, useGoals } from '../../core/hooks';

interface TopBarProps {
  onOpenAlerts: () => void;
  onOpenGoals: () => void;
}

export function TopBar({ onOpenAlerts, onOpenGoals }: TopBarProps) {
  const { unacknowledgedCount, loading: alertsLoading } = useAlerts();
  const { currentStreak, loading: goalsLoading } = useGoals();

  return (
    <div className="h-14 border-b border-[#262626] px-6 flex items-center justify-between bg-black">
      {/* Logo */}
      <div className="text-base font-medium tracking-tight">MacroScope</div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Streak Button */}
        <button
          onClick={onOpenGoals}
          disabled={goalsLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <span className="text-lg">🔥</span>
          <span className="text-sm font-medium">{currentStreak}</span>
        </button>

        {/* Alerts Button */}
        <button
          onClick={onOpenAlerts}
          disabled={alertsLoading}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <span className="text-lg">🔔</span>
          <span className="text-sm font-medium">Alerts</span>
          {/* Notification Dot */}
          {!alertsLoading && unacknowledgedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ef4444] rounded-full flex items-center justify-center text-[10px] font-medium text-white">
              {unacknowledgedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}