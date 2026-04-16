/**
 * MACROSCOPE PERFORMANCE OS - SYSTEM STATUS BLOCK COMPONENT
 * Presentational component for displaying system status
 */

import type { SystemStatus } from '../../../core/types';

interface SystemStatusBlockProps {
  title: string;
  status: SystemStatus;
}

export function SystemStatusBlock({ title, status }: SystemStatusBlockProps) {
  return (
    <div className="border border-zinc-800 p-4">
      <div className="text-sm mb-2">{title}</div>
      <div className="text-lg capitalize">{status}</div>
    </div>
  );
}
