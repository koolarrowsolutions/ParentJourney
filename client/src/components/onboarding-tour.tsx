import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, Heart, Bot, History, Leaf, ArrowRight, X, MessageCircle } from "lucide-react";
import { markTourCompleted, markTourSkipped } from "@/utils/onboarding-storage";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    icon: PenTool,
    title: "This is your Journal",
    description: "Write anything you're feeling or reflecting on — we'll help you process it.",
    illustration: "📝",
    color: "bg-blue-500"
  },
  {
    step: 2,
    icon: Heart,
    title: "Tag how you're feeling",
    description: "Choose up to 3 emotions. This helps us give better insights.",
    illustration: "🎭",
    color: "bg-pink-500"
  },
  {
    step: 3,
    icon: Bot,
    title: "Get a personalized AI reflection",
    description: "After you submit a journal entry, we'll offer a gentle insight or affirmation based on your experience.",
    illustration: "🤖",
    color: "bg-purple-500"
  },
  {
    step: 4,
    icon: MessageCircle,
    title: "Chat with your AI Assistant",
    description: "Need immediate support? Click the chat bubble in the bottom-right corner for real-time parenting guidance and advice.",
    illustration: "💬",
    color: "bg-indigo-500"
  },
  {
    step: 5,
    icon: History,
    title: "See your full history here",
    description: "Browse, favorite, and reflect on past entries. You'll see growth over time.",
    illustration: "📚",
    color: "bg-green-500"
  },
  {
    step: 6,
    icon: Leaf,
    title: "Need a moment to reset?",
    description: "Try the Calm Reset if things feel heavy. You'll find it after tough entries.",
    illustration: "🌿",
    color: "bg-teal-500"
  }
];

export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    console.log('OnboardingTour: isOpen changed to', isOpen);
    console.log('OnboardingTour: Dialog should be', isOpen ? 'OPEN' : 'CLOSED');
  }, [isOpen]);

  console.log('OnboardingTour RENDER: isOpen =', isOpen);

  const currentTourStep = TOUR_STEPS[currentStep - 1];
  const isLastStep = currentStep === TOUR_STEPS.length;
  const isChatbotStep = currentStep === 4;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  // Add visual highlight to chatbot button during step 4
  useEffect(() => {
    if (isChatbotStep && isOpen) {
      const chatbotButton = document.querySelector('[data-testid="chatbot-button"]');
      if (chatbotButton) {
        chatbotButton.classList.add('onboarding-highlight');
      }
    } else {
      const chatbotButton = document.querySelector('[data-testid="chatbot-button"]');
      if (chatbotButton) {
        chatbotButton.classList.remove('onboarding-highlight');
      }
    }

    // Cleanup when component unmounts
    return () => {
      const chatbotButton = document.querySelector('[data-testid="chatbot-button"]');
      if (chatbotButton) {
        chatbotButton.classList.remove('onboarding-highlight');
      }
    };
  }, [isChatbotStep, isOpen]);

  const handleComplete = () => {
    markTourCompleted();
    onClose();
  };

  const handleSkip = () => {
    markTourSkipped();
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const Icon = currentTourStep.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Step {currentStep} of {TOUR_STEPS.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-neutral-500 hover:text-neutral-700 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className={`transition-all duration-200 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="text-center space-y-6">
            {/* Illustration */}
            <div className="relative">
              <div className={`mx-auto w-20 h-20 ${currentTourStep.color} rounded-full flex items-center justify-center mb-4 animate-bounce-subtle`}>
                <span className="text-3xl">{currentTourStep.illustration}</span>
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className={`w-24 h-24 ${currentTourStep.color} rounded-full opacity-20 animate-ping`}></div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <DialogTitle className="text-xl font-semibold text-neutral-800">
                {currentTourStep.title}
              </DialogTitle>
              <DialogDescription className="text-neutral-600 leading-relaxed">
                {currentTourStep.description}
              </DialogDescription>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-2">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index + 1 === currentStep
                      ? currentTourStep.color
                      : index + 1 < currentStep
                      ? 'bg-neutral-400'
                      : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-neutral-600"
          >
            Back
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-neutral-500 hover:text-neutral-700"
            >
              Skip Tour
            </Button>
            <Button onClick={handleNext} className="px-6">
              {isLastStep ? 'Get Started!' : 'Next'}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}