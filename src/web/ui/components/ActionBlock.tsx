/**
 * MACROSCOPE PERFORMANCE OS - ACTION BLOCK COMPONENT
 * Presentational component for displaying priority action
 */

interface ActionBlockProps {
  action: string | null;
  title?: string;
}

export function ActionBlock({ action, title = "Priority Action" }: ActionBlockProps) {
  if (!action) {
    return null;
  }

  return (
    <div className="border border-zinc-800 p-4">
      <div className="text-sm mb-2">{title}</div>
      <div>{action}</div>
    </div>
  );
}
