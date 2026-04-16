/**
 * MACROSCOPE PERFORMANCE OS - PAGE HEADER COMPONENT
 * Presentational component for page headers
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl mb-1">{title}</h1>
      {subtitle && <div className="text-sm">{subtitle}</div>}
    </div>
  );
}
