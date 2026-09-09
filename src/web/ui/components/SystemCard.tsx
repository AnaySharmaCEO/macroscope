/**
 * MACROSCOPE PERFORMANCE OS - SYSTEM CARD
 * Compact horizontal card showing system status with progress bar
 */

interface SystemCardProps {
  label: string;
  value: string;
  status: 'good' | 'low' | 'high';
  trend?: 'up' | 'down' | 'stable';
  progress: number; // 0-100
}

export function SystemCard({ label, value, status, trend, progress }: SystemCardProps) {
  const getStatusTokens = () => {
    switch (status) {
      case 'good': 
        return { color: 'var(--good)', bg: 'var(--good-soft)', label: 'Good' };
      case 'low': 
        return { color: 'var(--danger)', bg: 'var(--danger-soft)', label: 'Low' };
      case 'high': 
        return { color: 'var(--warn)', bg: 'var(--warn-soft)', label: 'High' };
      default: 
        return { color: 'var(--text-3)', bg: 'var(--surface)', label: 'Stable' };
    }
  };

  const statusTokens = getStatusTokens();

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '';
  };

  return (
    <div 
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--card-radius)',
        padding: 'var(--space-4)',
      }}
      className="border transition-colors duration-150"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span 
          style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--text-3)',
            fontWeight: 'var(--weight-medium)' as any,
          }}
        >
          {label}
        </span>
        <span 
          style={{
            backgroundColor: statusTokens.bg,
            color: statusTokens.color,
            borderRadius: 'var(--radius-pill)',
            padding: '2px 8px',
            fontSize: 'var(--text-caption)',
            fontWeight: 'var(--weight-semibold)' as any,
          }}
        >
          {statusTokens.label}
        </span>
      </div>
      
      <div className="flex items-baseline gap-2 mb-3">
        <div 
          style={{
            fontSize: '20px',
            fontWeight: 'var(--weight-medium)' as any,
            color: 'var(--text)',
          }}
        >
          {value}
        </div>
        {trend && (
          <span 
            className="text-xs"
            style={{ color: statusTokens.color }}
          >
            {getTrendIcon()}
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div 
        style={{
          backgroundColor: 'var(--progress-track)',
          height: 'var(--progress-height, 6px)',
          borderRadius: 'var(--progress-radius, var(--radius-pill))',
        }}
        className="overflow-hidden"
      >
        <div 
          style={{ 
            width: `${Math.max(0, Math.min(100, progress))}%`,
            backgroundColor: statusTokens.color,
            borderRadius: 'var(--progress-radius, var(--radius-pill))',
          }}
          className="h-full transition-all duration-500 ease-out"
        />
      </div>
    </div>
  );
}

