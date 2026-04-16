/**
 * MACROSCOPE PERFORMANCE OS - SIGNALS LIST COMPONENT
 * Presentational component for displaying system signals
 */

import type { Signal } from '../../../core/types';

interface SignalsListProps {
  signals: Signal[];
  title?: string;
}

export function SignalsList({ signals, title = "Active Signals" }: SignalsListProps) {
  if (signals.length === 0) {
    return null;
  }

  return (
    <div className="border border-zinc-800 p-4">
      <div className="text-sm mb-4">{title}</div>
      <div className="space-y-3">
        {signals.map((signal) => (
          <div key={signal.id} className="border-l-2 border-zinc-700 pl-3">
            <div className="text-sm">{signal.message}</div>
            <div className="text-xs mt-1 capitalize">
              {signal.type} • {signal.severity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
