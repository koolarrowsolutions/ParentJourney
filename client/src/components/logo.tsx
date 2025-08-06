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
        
        {/* S-shaped winding path from bottom left to top right */}
        <path 
          d="M 8 88 Q 20 75 35 80 Q 50 85 65 70 Q 80 55 92 48" 
          stroke="white" 
          strokeWidth="8" 
          fill="none" 
          strokeLinecap="round"
        />
        
        {/* Path shadows for depth */}
        <path 
          d="M 8 90 Q 20 77 35 82 Q 50 87 65 72 Q 80 57 92 50" 
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