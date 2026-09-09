/**
 * MACROSCOPE PERFORMANCE OS - DAILY SCORE GAUGE
 * Speedometer-style gauge showing daily performance score (0-100)
 */

interface DailyScoreGaugeProps {
  score: number; // 0-100
  size?: number; // diameter in px, default 104
  variant?: 'ring' | 'arc';
}

export function DailyScoreGauge({ score, size = 104, variant = 'ring' }: DailyScoreGaugeProps) {
  // Clamp score between 0-100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine color based on score using tokens
  const getColor = () => {
    if (clampedScore >= 70) return 'var(--good)';
    if (clampedScore >= 40) return 'var(--warn)';
    return 'var(--danger)';
  };

  if (variant === 'ring') {
    // Radius 46 in 104x104 viewBox (circumference = 2 * PI * 46 ~= 289.026)
    const radius = 46;
    const circumference = 2 * Math.PI * radius; // ~289
    const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

    return (
      <div 
        className="relative shrink-0"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg 
          viewBox="0 0 104 104" 
          role="img" 
          aria-label={`Balance score ${clampedScore} out of 100`}
          className="w-full h-full -rotate-90 transform"
        >
          <circle 
            cx="52" 
            cy="52" 
            r={radius}
            fill="none" 
            stroke="var(--ring-track, var(--border))" 
            strokeWidth="8"
          />
          <circle 
            cx="52" 
            cy="52" 
            r={radius}
            fill="none" 
            stroke="var(--accent)" 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div 
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size >= 104 ? '30px' : '24px',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--text)',
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {clampedScore}
        </div>
      </div>
    );
  }

  // Calculate rotation angle for needle (-90 to 90 degrees)
  const angle = -90 + (clampedScore / 100) * 180;

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Arc background */}
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Red zone track */}
        <path
          d="M 20 100 A 80 80 0 0 1 66.4 36.4"
          fill="none"
          stroke="var(--danger)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.2"
        />
        {/* Yellow zone track */}
        <path
          d="M 66.4 36.4 A 80 80 0 0 1 133.6 36.4"
          fill="none"
          stroke="var(--warn)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.2"
        />
        {/* Green zone track */}
        <path
          d="M 133.6 36.4 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--good)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.2"
        />
        
        {/* Active arc based on score */}
        <path
          d="M 20 100 A 80 80 0 0 1 66.4 36.4"
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          opacity={clampedScore < 33 ? "1" : "0"}
          className="transition-opacity duration-500"
        />
        <path
          d="M 66.4 36.4 A 80 80 0 0 1 133.6 36.4"
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          opacity={clampedScore >= 33 && clampedScore < 70 ? "1" : "0"}
          className="transition-opacity duration-500"
        />
        <path
          d="M 133.6 36.4 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          opacity={clampedScore >= 70 ? "1" : "0"}
          className="transition-opacity duration-500"
        />
        
        {/* Needle - uses var(--accent) */}
        <g transform={`rotate(${angle} 100 100)`} className="transition-transform duration-700 ease-out">
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="5" fill="var(--accent)" />
        </g>
        
        {/* Center circle */}
        <circle cx="100" cy="100" r="2.5" fill="var(--bg)" />
      </svg>
      
      {/* Score display */}
      <div className="absolute inset-0 flex items-center justify-center mt-8">
        <div className="text-center">
          <div 
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-display-lg)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--text)',
            }}
            className="tabular-nums transition-all duration-700"
          >
            {clampedScore}
          </div>
          <div 
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--text-3)',
            }}
            className="mt-0.5"
          >
            Daily score
          </div>
        </div>
      </div>
    </div>
  );
}

