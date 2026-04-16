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
  const getStatusColor = () => {
    switch (status) {
      case 'good': return '#10b981';
      case 'low': return '#ef4444';
      case 'high': return '#f59e0b';
      default: return '#737373';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'good': return 'Good';
      case 'low': return 'Low';
      case 'high': return 'High';
      default: return 'Unknown';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '';
  };

  const progressColor = getStatusColor();

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-[#737373]">
          {label}
        </div>
        <div className="text-xs text-[#737373]">
          {getStatusLabel()}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mb-3">
        <div className="text-2xl font-light transition-all duration-300 group-hover:scale-105">
          {value}
        </div>
        {trend && (
          <div 
            className="text-sm transition-transform duration-300 group-hover:scale-110"
            style={{ color: progressColor }}
          >
            {getTrendIcon()}
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${Math.max(0, Math.min(100, progress))}%`,
            backgroundColor: progressColor
          }}
        />
      </div>
    </div>
  );
}
