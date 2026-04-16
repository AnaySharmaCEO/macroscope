/**
 * MACROSCOPE PERFORMANCE OS - DAILY SCORE GAUGE
 * Speedometer-style gauge showing daily performance score (0-100)
 */

interface DailyScoreGaugeProps {
  score: number; // 0-100
}

export function DailyScoreGauge({ score }: DailyScoreGaugeProps) {
  // Clamp score between 0-100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Calculate rotation angle for needle (-90 to 90 degrees)
  const angle = -90 + (clampedScore / 100) * 180;
  
  // Determine color based on score
  const getColor = () => {
    if (clampedScore >= 70) return '#10b981'; // green
    if (clampedScore >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Arc background */}
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Red zone */}
        <path
          d="M 20 100 A 80 80 0 0 1 66.4 36.4"
          fill="none"
          stroke="#ef4444"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.2"
        />
        {/* Yellow zone */}
        <path
          d="M 66.4 36.4 A 80 80 0 0 1 133.6 36.4"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.2"
        />
        {/* Green zone */}
        <path
          d="M 133.6 36.4 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.2"
        />
        
        {/* Active arc based on score */}
        <path
          d="M 20 100 A 80 80 0 0 1 66.4 36.4"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          opacity={clampedScore < 33 ? "1" : "0"}
          className="transition-opacity duration-500"
        />
        <path
          d="M 66.4 36.4 A 80 80 0 0 1 133.6 36.4"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          opacity={clampedScore >= 33 && clampedScore < 70 ? "1" : "0"}
          className="transition-opacity duration-500"
        />
        <path
          d="M 133.6 36.4 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          opacity={clampedScore >= 70 ? "1" : "0"}
          className="transition-opacity duration-500"
        />
        
        {/* Needle */}
        <g transform={`rotate(${angle} 100 100)`} className="transition-transform duration-700 ease-out">
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke={getColor()}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={getColor()} />
        </g>
        
        {/* Center circle */}
        <circle cx="100" cy="100" r="3" fill="#e5e5e5" />
      </svg>
      
      {/* Score display */}
      <div className="absolute inset-0 flex items-center justify-center mt-8">
        <div className="text-center">
          <div className="text-4xl font-light tabular-nums transition-all duration-700">
            {clampedScore}
          </div>
          <div className="text-xs text-[#737373] uppercase tracking-wider mt-1">
            Daily Score
          </div>
        </div>
      </div>
    </div>
  );
}
