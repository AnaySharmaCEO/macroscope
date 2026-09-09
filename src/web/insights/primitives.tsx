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
    <div 
      className="inline-flex p-1 border"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <button
        type="button"
        onClick={() => setViewMode('simple')}
        className={`px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
          viewMode === 'simple'
            ? 'bg-[var(--accent)] text-[var(--accent-ink)] font-semibold shadow-xs'
            : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
        }`}
        style={{ borderRadius: 'calc(var(--radius-sm) - 2px)' }}
      >
        Simple
      </button>
      <button
        type="button"
        onClick={() => setViewMode('detailed')}
        className={`px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
          viewMode === 'detailed'
            ? 'bg-[var(--accent)] text-[var(--accent-ink)] font-semibold shadow-xs'
            : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
        }`}
        style={{ borderRadius: 'calc(var(--radius-sm) - 2px)' }}
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
    <div className="text-xs font-medium text-[var(--text-2)] mb-3">
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
    <div 
      className="p-4 border"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div className="text-xs text-[var(--text-2)] mb-1">{label}</div>
      <div className={`font-serif text-2xl font-semibold text-[var(--text-1)] ${accent || ''}`}>{value}</div>
      {unit && <div className="text-xs text-[var(--text-3)] mt-0.5">{unit}</div>}
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
    <div 
      className="flex justify-between items-center p-3 border"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <span className="text-sm text-[var(--text-2)]">{label}</span>
      <span className={`text-sm font-medium ${valueAccent || 'text-[var(--text-1)]'}`}>{value}</span>
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
    <div 
      className="h-56 border flex items-center justify-center"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <div className="text-sm text-[var(--text-2)]">{label}</div>
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
  const color = score >= 75 ? 'var(--good)' : score >= 50 ? 'var(--warn)' : 'var(--danger)';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isBottleneck ? 'text-[var(--text-1)] font-medium' : 'text-[var(--text-2)]'}`}>
            {label}
          </span>
          {isBottleneck && (
            <span 
              className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
              style={{
                backgroundColor: 'var(--warn-soft)',
                color: 'var(--warn)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--warn-border)',
              }}
            >
              Bottleneck
            </span>
          )}
        </div>
        <span className="font-serif text-sm font-semibold text-[var(--text-1)]">{score}</span>
      </div>
      <div 
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--surface-3)' }}
      >
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
    <div 
      className="p-4 border"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div className="text-xs font-semibold text-[var(--accent)] mb-1">
        Data sources
      </div>
      <div className="text-xs text-[var(--text-2)]">
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
  const color = score >= 75 ? 'var(--good)' : score >= 50 ? 'var(--warn)' : 'var(--danger)';

  return (
    <div className="flex flex-col">
      <div className="text-xs text-[var(--text-3)] mb-0.5">{label}</div>
      <div className="font-serif text-lg font-semibold" style={{ color }}>{score}</div>
    </div>
  );
}

/**
 * System tag pill
 */
export function SystemTag({ system }: { system: SystemKey }) {
  return (
    <span 
      className="px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{
        backgroundColor: 'var(--surface-2)',
        color: 'var(--text-2)',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--border)',
      }}
    >
      {system}
    </span>
  );
}
