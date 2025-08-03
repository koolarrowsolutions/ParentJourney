import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, ArrowLeft, Target, Info } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    handler: () => void;
  };
}

interface FeatureTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  tour: TourStep[];
}

export function FeatureTour({ isActive, onComplete, onSkip, tour }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !tour.length) return;

    const updateHighlight = () => {
      const step = tour[currentStep];
      if (!step) return;

      const element = document.querySelector(step.targetSelector);
      if (element) {
        setHighlightElement(element);
        
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate tooltip position based on step position preference
        let x = rect.left + scrollX;
        let y = rect.top + scrollY;
        
        switch (step.position) {
          case 'top':
            x += rect.width / 2;
            y -= 10;
            break;
          case 'bottom':
            x += rect.width / 2;
            y += rect.height + 10;
            break;
          case 'left':
            x -= 10;
            y += rect.height / 2;
            break;
          case 'right':
            x += rect.width + 10;
            y += rect.height / 2;
            break;
          case 'center':
            x += rect.width / 2;
            y += rect.height / 2;
            break;
        }
        
        setTooltipPosition({ x, y });
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    };

    updateHighlight();
    
    // Update on resize or scroll
    const handleUpdate = () => updateHighlight();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);
    
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [isActive, currentStep, tour]);

  const nextStep = () => {
    if (currentStep < tour.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const step = tour[currentStep];
    if (step?.action) {
      step.action.handler();
    }
  };

  if (!isActive || !tour.length) return null;

  const currentStepData = tour[currentStep];
  const isLastStep = currentStep === tour.length - 1;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/50"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Highlight spotlight */}
        {highlightElement && (
          <div
            className="absolute border-4 border-primary rounded-lg shadow-lg pointer-events-none"
            style={{
              left: highlightElement.getBoundingClientRect().left + window.pageXOffset - 4,
              top: highlightElement.getBoundingClientRect().top + window.pageYOffset - 4,
              width: highlightElement.getBoundingClientRect().width + 8,
              height: highlightElement.getBoundingClientRect().height + 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 51,
            }}
          />
        )}
        
        {/* Tooltip */}
        <Card
          className="absolute z-52 w-80 shadow-xl"
          style={{
            left: Math.max(10, Math.min(tooltipPosition.x - 160, window.innerWidth - 330)),
            top: Math.max(10, tooltipPosition.y - 50),
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  {currentStep + 1} of {tour.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground">{currentStepData.content}</p>
              
              {currentStepData.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAction}
                  className="w-full text-xs"
                >
                  {currentStepData.action.label}
                </Button>
              )}
              
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="text-xs"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
                
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="text-xs"
                >
                  {isLastStep ? 'Finish' : 'Next'}
                  {!isLastStep && <ArrowRight className="h-3 w-3 ml-1" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Predefined tours for different features
export const TOURS = {
  firstTime: [
    {
      id: 'welcome',
      title: 'Welcome to ParentJourney',
      content: 'This is your home dashboard where you can see your progress and start new entries.',
      targetSelector: 'main',
      position: 'center' as const,
    },
    {
      id: 'journal-button',
      title: 'Start Writing',
      content: 'Click here to create your first journal entry. You can write about any parenting moment from today.',
      targetSelector: '[data-onboarding="journal-button"]',
      position: 'top' as const,
    },
    {
      id: 'checkin-button',
      title: 'Daily Check-In',
      content: 'Take a quick wellness check-in to track your parenting wellbeing across 10 key areas.',
      targetSelector: '[data-onboarding="checkin-button"]',
      position: 'top' as const,
    },
    {
      id: 'analytics-link',
      title: 'View Your Analytics',
      content: 'Explore insights and patterns in your parenting journey through detailed analytics.',
      targetSelector: '[data-onboarding="analytics-link"]',
      position: 'bottom' as const,
    },
  ],
  analytics: [
    {
      id: 'mood-chart',
      title: 'Mood Analytics',
      content: 'Track your emotional patterns over time and see how they correlate with parenting experiences.',
      targetSelector: '[data-tour="mood-chart"]',
      position: 'top' as const,
    },
    {
      id: 'streak-display',
      title: 'Streak Tracking',
      content: 'Watch your journaling consistency grow with our progressive emoji system.',
      targetSelector: '[data-tour="streak-display"]',
      position: 'bottom' as const,
    },
  ],
  journaling: [
    {
      id: 'write-area',
      title: 'Free Writing',
      content: 'Write freely about any parenting moment. Our AI will analyze and provide insights.',
      targetSelector: '[data-tour="write-area"]',
      position: 'top' as const,
    },
    {
      id: 'prompts',
      title: 'Guided Prompts',
      content: 'Use these prompts for structured reflection on specific aspects of your parenting day.',
      targetSelector: '[data-tour="prompts"]',
      position: 'left' as const,
    },
  ],
};