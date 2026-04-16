/**
 * MACROSCOPE PERFORMANCE OS - METRICS ROW COMPONENT
 * Presentational component for displaying key metrics
 */

interface Metric {
  label: string;
  value: string | number;
  unit?: string;
}

interface MetricsRowProps {
  metrics: Metric[];
}

export function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="border border-zinc-800 p-4">
          <div className="text-xs mb-1">{metric.label}</div>
          <div className="text-xl">
            {metric.value}
            {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
