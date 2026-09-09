/**
 * MACROSCOPE PERFORMANCE OS - SETTINGS ROW COMPONENT
 * Standard row format for settings panels
 */

import { ChevronRight } from 'lucide-react';

interface SettingsRowProps {
  label: string;
  value?: string | number;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

export function SettingsRow({ label, value, onClick, variant = 'default' }: SettingsRowProps) {
  const isClickable = !!onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`
        w-full flex items-center justify-between px-6 py-4 border-b border-[var(--border)] last:border-b-0
        transition-colors text-left
        ${isClickable ? 'hover:bg-[var(--surface-hover)] cursor-pointer' : 'cursor-default'}
      `}
      style={{
        color: variant === 'danger' ? 'var(--danger)' : 'var(--text-1)',
      }}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {value !== undefined && (
          <span className="text-sm text-[var(--text-3)]">{value}</span>
        )}
        {isClickable && (
          <ChevronRight className="w-4 h-4 text-[var(--text-3)]" />
        )}
      </div>
    </button>
  );
}
