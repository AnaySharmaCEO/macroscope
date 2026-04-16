/**
 * MACROSCOPE PERFORMANCE OS - TRENDS PLACEHOLDER COMPONENT
 * Placeholder for future graph/chart implementations
 */

interface TrendsPlaceholderProps {
  title?: string;
}

export function TrendsPlaceholder({ title = "Trends" }: TrendsPlaceholderProps) {
  return (
    <div className="border border-zinc-800 p-4">
      <div className="text-sm mb-4">{title}</div>
      <div className="h-48 border border-dashed border-zinc-700 flex items-center justify-center">
        <span className="text-sm">Chart visualization placeholder</span>
      </div>
    </div>
  );
}
