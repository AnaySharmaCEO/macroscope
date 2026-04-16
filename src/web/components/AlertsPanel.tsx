/**
 * MACROSCOPE PERFORMANCE OS - ALERTS PANEL
 * Full-screen panel for alert management
 */

import { Check } from 'lucide-react';
import { PanelLayout } from '../ui/components/PanelLayout';
import { useAlerts } from '../../core/hooks';

interface AlertsPanelProps {
  onBack: () => void;
}

export function AlertsPanel({ onBack }: AlertsPanelProps) {
  const { unacknowledgedAlerts, acknowledgedAlerts, acknowledgeAlert, loading } = useAlerts();

  if (loading) {
    return (
      <PanelLayout title="Alerts" onBack={onBack}>
        <div className="p-6">
          <div className="text-sm text-[#737373]">Loading alerts...</div>
        </div>
      </PanelLayout>
    );
  }

  const hasUnacknowledged = unacknowledgedAlerts.length > 0;
  const hasAcknowledged = acknowledgedAlerts.length > 0;

  return (
    <PanelLayout title="Alerts" onBack={onBack}>
      <div className="p-6 space-y-8">
        {/* No alerts state */}
        {!hasUnacknowledged && !hasAcknowledged && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✓</div>
            <div className="text-sm text-[#737373]">No active alerts</div>
            <div className="text-xs text-[#737373] mt-2">All systems operating normally</div>
          </div>
        )}

        {/* Unacknowledged Alerts */}
        {hasUnacknowledged && (
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-[#737373]">
              Active Alerts ({unacknowledgedAlerts.length})
            </div>
            {unacknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alert.severity === 'high'
                            ? 'bg-[#ef4444]'
                            : alert.severity === 'medium'
                            ? 'bg-[#f59e0b]'
                            : 'bg-[#3b82f6]'
                        }`}
                      />
                      <span className="text-xs uppercase tracking-wider text-[#737373]">
                        {alert.type}
                      </span>
                    </div>
                    <div className="text-base font-medium text-[#e5e5e5]">{alert.message}</div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                    aria-label="Acknowledge alert"
                  >
                    <Check className="w-4 h-4 text-[#e5e5e5]" />
                  </button>
                </div>

                {/* Impact */}
                {alert.impact && (
                  <div className="text-sm text-[#737373] leading-relaxed">{alert.impact}</div>
                )}

                {/* Action */}
                {alert.action && (
                  <div className="pt-3 border-t border-white/10">
                    <div className="text-xs uppercase tracking-wider text-[#00D4FF] mb-2">
                      Recommended Action
                    </div>
                    <div className="text-sm text-[#e5e5e5] leading-relaxed">{alert.action}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Acknowledged Alerts */}
        {hasAcknowledged && (
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-[#737373]">
              Acknowledged ({acknowledgedAlerts.length})
            </div>
            {acknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-xl bg-white/5 border border-white/10 opacity-60 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  <span className="text-xs uppercase tracking-wider text-[#737373]">
                    {alert.type}
                  </span>
                </div>
                <div className="text-sm text-[#e5e5e5]">{alert.message}</div>
                {alert.acknowledgedAt && (
                  <div className="text-xs text-[#737373]">
                    Acknowledged {alert.acknowledgedAt.toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
