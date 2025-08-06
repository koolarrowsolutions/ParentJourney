interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="rounded-xl"
      >
        {/* Background circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="50" 
          fill="url(#skyGradient)"
        />
        
        {/* Sun */}
        <circle 
          cx="50" 
          cy="25" 
          r="8" 
          fill="white"
        />
        
        {/* Green hills */}
        <path 
          d="M 0 40 Q 25 30 50 40 Q 75 50 100 35 L 100 100 L 0 100 Z" 
          fill="#7CB342"
        />
        
        {/* Winding path from bottom left to top right */}
        <path 
          d="M 10 85 Q 25 70 40 65 Q 55 60 70 55 Q 85 50 95 45" 
          stroke="white" 
          strokeWidth="8" 
          fill="none" 
          strokeLinecap="round"
        />
        
        {/* Path shadows for depth */}
        <path 
          d="M 10 87 Q 25 72 40 67 Q 55 62 70 57 Q 85 52 95 47" 
          stroke="#f0f0f0" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4A90E2', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#7CB342', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}