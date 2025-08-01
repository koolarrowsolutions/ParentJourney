import { useEffect, useState } from "react";

interface WellnessProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export function WellnessProgressRing({ 
  progress, 
  size = 80, 
  strokeWidth = 6, 
  color = "#3B82F6",
  label,
  showPercentage = true 
}: WellnessProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 200);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = isNaN(animatedProgress) ? circumference : circumference - (animatedProgress / 100) * circumference;

  const getMotivationalColor = (progress: number) => {
    if (progress >= 80) return "#10B981"; // Green - excellent
    if (progress >= 60) return "#F59E0B"; // Yellow - good
    if (progress >= 40) return "#EF4444"; // Red - needs attention
    return "#6B7280"; // Gray - getting started
  };

  const finalColor = color === "#3B82F6" ? getMotivationalColor(progress) : color;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={finalColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: progress >= 80 ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' : 'none'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showPercentage && (
          <span className="text-sm font-bold" style={{ color: finalColor }}>
            {Math.round(animatedProgress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-600 mt-0.5 max-w-12 leading-tight">
            {label}
          </span>
        )}
      </div>
      
      {/* Celebration sparkles for high progress */}
      {progress >= 80 && (
        <>
          <div className="absolute -top-1 -right-1 animate-ping">
            <span className="text-xs">✨</span>
          </div>
          <div className="absolute -bottom-1 -left-1 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <span className="text-xs">⭐</span>
          </div>
        </>
      )}
    </div>
  );
}