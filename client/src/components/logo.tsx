import logoPath from "@assets/Untitled design (7)_1754459449497.png";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img 
        src={logoPath}
        alt="ParentJourney Logo"
        width={size} 
        height={size} 
        className="rounded-xl"
      />
    </div>
  );
}