import { ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";

interface TooltipWrapperProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  supportive?: boolean;
}

export function TooltipWrapper({ 
  content, 
  children, 
  position = 'top',
  className = "",
  supportive = true 
}: TooltipWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-blue-100',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-blue-100',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-blue-100',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-blue-100'
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={() => setTimeout(() => setIsVisible(false), 2000)}
    >
      {children}
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <Card className={`px-3 py-2 text-sm max-w-xs shadow-lg border-2 transition-all duration-200 animate-pop-in ${
            supportive 
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-800' 
              : 'bg-white border-gray-200 text-gray-700'
          }`}>
            <div className="relative">
              {content}
              {supportive && (
                <div className="absolute -right-1 -top-1 text-xs">💝</div>
              )}
            </div>
          </Card>
          
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}