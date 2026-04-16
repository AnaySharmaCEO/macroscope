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
      onClick={onClick}
      disabled={!isClickable}
      className={`
        w-full flex items-center justify-between px-6 py-4 border-b border-[#262626] 
        transition-colors
        ${isClickable ? 'hover:bg-[#0a0a0a] cursor-pointer' : 'cursor-default'}
        ${variant === 'danger' ? 'text-[#ef4444]' : 'text-[#e5e5e5]'}
      `}
    >
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {value !== undefined && (
          <span className="text-sm text-[#737373]">{value}</span>
        )}
        {isClickable && (
          <ChevronRight className="w-4 h-4 text-[#737373]" />
        )}
      </div>
    </button>
  );
}
