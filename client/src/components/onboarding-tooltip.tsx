import { ReactNode, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Lightbulb, Target, Star } from "lucide-react";

interface OnboardingTooltipProps {
  content: string;
  title?: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  stepNumber?: number;
  totalSteps?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
  variant?: 'welcome' | 'feature' | 'tip' | 'achievement';
  persistent?: boolean;
  delay?: number;
}

export function OnboardingTooltip({ 
  content,
  title,
  children, 
  position = 'top',
  className = "",
  stepNumber,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  variant = 'tip',
  persistent = false,
  delay = 0
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (persistent && !hasShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [persistent, hasShown, delay]);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-3'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
  };

  const variantStyles = {
    welcome: {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: <Star className="h-4 w-4 text-blue-600" />,
      arrow: 'border-t-blue-300'
    },
    feature: {
      bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
      border: 'border-purple-300',
      text: 'text-purple-800',
      icon: <Target className="h-4 w-4 text-purple-600" />,
      arrow: 'border-t-purple-300'
    },
    tip: {
      bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
      border: 'border-emerald-300',
      text: 'text-emerald-800',
      icon: <Lightbulb className="h-4 w-4 text-emerald-600" />,
      arrow: 'border-t-emerald-300'
    },
    achievement: {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      border: 'border-amber-300',
      text: 'text-amber-800',
      icon: <Star className="h-4 w-4 text-amber-600" />,
      arrow: 'border-t-amber-300'
    }
  };

  const currentVariant = variantStyles[variant];

  const handleClose = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  const handleNext = () => {
    if (stepNumber === totalSteps && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
    setIsVisible(false);
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => !persistent && setIsVisible(true)}
      onMouseLeave={() => !persistent && setIsVisible(false)}
      onTouchStart={() => !persistent && setIsVisible(true)}
      onTouchEnd={() => !persistent && setTimeout(() => setIsVisible(false), 2000)}
    >
      {children}
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <Card className={`p-4 max-w-sm shadow-xl border-2 transition-all duration-300 animate-bounce-in ${currentVariant.bg} ${currentVariant.border}`}>
            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {currentVariant.icon}
                  {title && (
                    <h4 className={`font-semibold text-sm ${currentVariant.text}`}>
                      {title}
                    </h4>
                  )}
                  {stepNumber && totalSteps && (
                    <div className={`text-xs px-2 py-1 rounded-full ${currentVariant.bg} ${currentVariant.border} border`}>
                      {stepNumber}/{totalSteps}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 hover:bg-white/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Content */}
              <p className={`text-sm leading-relaxed mb-3 ${currentVariant.text}`}>
                {content}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {onPrevious && stepNumber && stepNumber > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPrevious}
                      className="text-xs px-2 py-1 h-7"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {(onNext || onComplete) && (
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="text-xs px-3 py-1 h-7 bg-primary hover:bg-primary/90"
                    >
                      {stepNumber === totalSteps ? 'Got it!' : 'Next'}
                      {stepNumber !== totalSteps && <ChevronRight className="h-3 w-3 ml-1" />}
                    </Button>
                  )}
                  {onSkip && stepNumber !== totalSteps && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSkip}
                      className="text-xs px-2 py-1 h-7"
                    >
                      Skip
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]} ${currentVariant.arrow}`}
          />
        </div>
      )}
    </div>
  );
}