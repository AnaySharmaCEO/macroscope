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
          <div className="text-sm text-[var(--text-3)]">Loading alerts...</div>
        </div>
      </PanelLayout>
    );
  }

  // AL1: Deduplicate by ID to prevent ghost duplicate render bug
  const uniqueUnack = Array.from(
    new Map(unacknowledgedAlerts.map(a => [a.id, a])).values()
  );
  const uniqueAck = Array.from(
    new Map(acknowledgedAlerts.map(a => [a.id, a])).values()
  );

  const hasUnacknowledged = uniqueUnack.length > 0;
  const hasAcknowledged = uniqueAck.length > 0;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bg: 'var(--danger-soft)', text: 'var(--danger)', border: 'var(--danger-border)' };
      case 'medium':
        return { bg: 'var(--warn-soft)', text: 'var(--warn)', border: 'var(--warn-border)' };
      default:
        return { bg: 'var(--surface-2)', text: 'var(--text-2)', border: 'var(--border)' };
    }
  };

  return (
    <PanelLayout title="Alerts" onBack={onBack}>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
        {/* No alerts state */}
        {!hasUnacknowledged && !hasAcknowledged && (
          <div 
            className="text-center py-16 p-8 border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              borderRadius: 'var(--card-radius)',
            }}
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center bg-[var(--good-soft)] text-[var(--good)] border border-[var(--good-border)]">
              <Check className="w-5 h-5" />
            </div>
            <div className="text-base font-semibold text-[var(--text-1)]">No active alerts</div>
            <div className="text-xs text-[var(--text-3)] mt-1">All systems operating within nominal baseline</div>
          </div>
        )}

        {/* AL2: Unacknowledged Alerts with sentence case and pill badge */}
        {hasUnacknowledged && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-3)]">Active alerts</span>
              <span 
                className="px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-2)',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border)',
                }}
              >
                {uniqueUnack.length}
              </span>
            </div>

            {uniqueUnack.map((alert) => {
              const badge = getSeverityBadge(alert.severity);
              const systemTitle = alert.type.charAt(0).toUpperCase() + alert.type.slice(1);

              return (
                <div
                  key={alert.id}
                  className="p-6 border space-y-4"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    borderRadius: 'var(--card-radius)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* AL3: Severity and System Pill Chip */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            borderRadius: 'var(--radius-pill)',
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {systemTitle}
                        </span>
                        <span className="text-xs text-[var(--text-3)] capitalize">
                          {alert.severity} priority
                        </span>
                      </div>
                      <div className="text-base font-semibold text-[var(--text-1)]">{alert.message}</div>
                    </div>

                    {/* AL5: Acknowledge button with focus ring and token styles */}
                    <button
                      type="button"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-1)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      title="Acknowledge alert"
                      aria-label="Acknowledge alert"
                    >
                      <Check className="w-4 h-4 text-[var(--text-1)]" />
                    </button>
                  </div>

                  {/* Impact */}
                  {alert.impact && (
                    <div className="text-sm text-[var(--text-2)] leading-relaxed">{alert.impact}</div>
                  )}

                  {/* AL4: Recommended action in sentence case var(--text-3), body in var(--text-2) */}
                  {alert.action && (
                    <div className="pt-3 border-t border-[var(--border)]">
                      <div className="text-xs font-medium text-[var(--text-3)] mb-1">
                        Recommended action
                      </div>
                      <div className="text-sm text-[var(--text-2)] leading-relaxed">{alert.action}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Acknowledged Alerts */}
        {hasAcknowledged && (
          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-3)]">Acknowledged</span>
              <span 
                className="px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-3)',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {uniqueAck.length}
              </span>
            </div>
            {uniqueAck.map((alert) => (
              <div
                key={alert.id}
                className="p-4 border opacity-75 space-y-1.5"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--good)]" />
                    <span className="text-xs font-medium text-[var(--text-2)] capitalize">
                      {alert.type}
                    </span>
                  </div>
                  {alert.acknowledgedAt && (
                    <div className="text-xs text-[var(--text-3)] font-mono">
                      {new Date(alert.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                <div className="text-sm text-[var(--text-2)]">{alert.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
