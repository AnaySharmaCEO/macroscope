/**
 * MACROSCOPE PERFORMANCE OS - INSIGHTS PRIMITIVES
 * Shared UI components for insights panels
 */

import type { ViewMode, SystemKey } from './types';

/**
 * View mode toggle button
 */
export function ViewToggle({
  viewMode,
  setViewMode
}: {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setViewMode('simple')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
          viewMode === 'simple'
            ? 'bg-white text-black'
            : 'bg-white/10 text-[#e5e5e5] hover:bg-white/20'
        }`}
      >
        Simple
      </button>
      <button
        onClick={() => setViewMode('detailed')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
          viewMode === 'detailed'
            ? 'bg-white text-black'
            : 'bg-white/10 text-[#e5e5e5] hover:bg-white/20'
        }`}
      >
        Detailed
      </button>
    </div>
  );
}

/**
 * Section label
 */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-wider text-[#737373] mb-3">
      {children}
    </div>
  );
}

/**
 * Metric card
 */
export function MetricCard({
  label,
  value,
  unit,
  accent
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="text-xs text-[#737373] mb-2">{label}</div>
      <div className={`text-2xl font-light ${accent || ''}`}>{value}</div>
      {unit && <div className="text-xs text-[#737373] mt-0.5">{unit}</div>}
    </div>
  );
}

/**
 * Key-value row
 */
export function KvRow({
  label,
  value,
  valueAccent
}: {
  label: string;
  value: string | number;
  valueAccent?: string;
}) {
  return (
    <div className="flex justify-between p-4 rounded-lg bg-white/5 border border-white/10">
      <span className="text-sm text-[#737373]">{label}</span>
      <span className={`text-sm ${valueAccent || 'text-[#e5e5e5]'}`}>{value}</span>
    </div>
  );
}

/**
 * Chart placeholder
 */
export function ChartPlaceholder({
  icon,
  label
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="h-56 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <div className="text-sm text-[#737373]">{label}</div>
      </div>
    </div>
  );
}

/**
 * Score bar with optional bottleneck indicator
 */
export function ScoreBar({
  label,
  score,
  isBottleneck
}: {
  label: string;
  score: number;
  isBottleneck?: boolean;
}) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isBottleneck ? 'text-white font-medium' : 'text-[#737373]'}`}>
            {label}
          </span>
          {isBottleneck && (
            <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-white/10 text-[#737373]">
              bottleneck
            </span>
          )}
        </div>
        <span className="text-sm text-[#e5e5e5]">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/**
 * Panel content wrapper for consistent padding
 */
export function PanelContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6 space-y-6">{children}</div>;
}

/**
 * Data source badge
 */
export function DataSourceBadge({
  sleepCount,
  nutritionCount,
  activityCount
}: {
  sleepCount: number;
  nutritionCount: number;
  activityCount: number;
}) {
  return (
    <div className="p-4 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20">
      <div className="text-xs uppercase tracking-wider text-[#00D4FF] mb-2">
        Data Source
      </div>
      <div className="text-xs text-[#e5e5e5]">
        {sleepCount} sleep entries · {nutritionCount} nutrition logs · {activityCount} activity records
      </div>
    </div>
  );
}

/**
 * Score tag for main page preview card
 */
export function ScoreTag({
  label,
  score
}: {
  label: string;
  score: number;
}) {
  const color = score >= 75 ? 'text-[#10b981]' : score >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]';

  return (
    <div className="flex flex-col">
      <div className="text-[10px] uppercase tracking-wider text-[#737373]">{label}</div>
      <div className={`text-sm font-medium ${color}`}>{score}</div>
    </div>
  );
}

/**
 * System tag pill
 */
export function SystemTag({ system }: { system: SystemKey }) {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-white/10 text-[#737373]">
      {system}
    </span>
  );
}
