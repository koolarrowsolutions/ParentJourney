import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  PenTool, 
  BarChart3, 
  User, 
  Baby, 
  Heart,
  Sparkles,
  CheckCircle,
  Play,
  ArrowRight,
  Target
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  highlightSelector?: string;
  position?: 'center' | 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right';
}

interface InteractiveOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function InteractiveOnboarding({ isOpen, onClose, onComplete }: InteractiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ParentJourney',
      description: 'Your digital companion for mindful parenting',
      icon: <Heart className="h-8 w-8 text-primary" />,
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Transform Your Parenting Journey</h3>
            <p className="text-muted-foreground">
              ParentJourney helps you track precious moments, understand patterns, and grow as a parent through AI-powered insights and daily reflection.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <PenTool className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Daily Journaling</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Progress Analytics</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">AI Insights</p>
            </div>
            <div className="text-center">
              <Baby className="h-6 w-6 text-pink-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Child Profiles</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'profile-setup',
      title: 'Create Your Parent Profile',
      description: 'Tell us about yourself to personalize your experience',
      icon: <User className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Why We Need This Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Customize parenting insights for your style</li>
              <li>• Provide age-appropriate developmental guidance</li>
              <li>• Track your growth as a parent over time</li>
              <li>• Connect you with relevant resources</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Privacy Promise:</strong> Your information is kept secure and only used to enhance your parenting journey. You can update it anytime.
            </p>
          </div>
        </div>
      ),
      actionLabel: 'Set Up Profile',
      highlightSelector: '[data-onboarding="profile-link"]'
    },
    {
      id: 'child-profiles',
      title: 'Add Your Children',
      description: 'Create profiles for each child to get personalized insights',
      icon: <Baby className="h-8 w-8 text-pink-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h4 className="font-medium text-pink-900 mb-2">Personalized Insights</h4>
              <p className="text-sm text-pink-800">
                Each child's profile helps us provide age-specific developmental milestones and personalized guidance.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Track Growth</h4>
              <p className="text-sm text-purple-800">
                Watch your child's development unfold through your journal entries and our analytics.
              </p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> You can add multiple children and update their information as they grow.
            </p>
          </div>
        </div>
      ),
      actionLabel: 'Add Child Profile'
    },
    {
      id: 'first-entry',
      title: 'Write Your First Journal Entry',
      description: 'Capture a moment from today to start your journey',
      icon: <PenTool className="h-8 w-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Why Journal Daily?</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Preserve precious memories</li>
              <li>• Track emotional patterns</li>
              <li>• Receive AI-powered parenting insights</li>
              <li>• Build mindful parenting habits</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
            <h4 className="font-medium mb-2">Guided Prompts Available</h4>
            <p className="text-sm text-muted-foreground">
              Use our daily reflection prompts or write freely about any parenting moment that stood out today.
            </p>
          </div>
        </div>
      ),
      actionLabel: 'Start Writing',
      highlightSelector: '[data-onboarding="journal-button"]'
    },
    {
      id: 'daily-checkin',
      title: 'Take Your Daily Wellness Check-In',
      description: 'Track your parenting wellness across 10 key areas',
      icon: <Target className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Energy Level</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Patience Level</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Parent-Child Connection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>Parenting Confidence</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Self-Care</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span>+ 5 more areas</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Build Awareness:</strong> Regular check-ins help you identify patterns and celebrate progress in your parenting journey.
            </p>
          </div>
        </div>
      ),
      actionLabel: 'Take Check-In',
      highlightSelector: '[data-onboarding="checkin-button"]'
    },
    {
      id: 'analytics',
      title: 'Explore Your Analytics',
      description: 'Discover insights and patterns in your parenting journey',
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Mood Analytics</h4>
              <p className="text-sm text-purple-800">
                Track emotional patterns and see how your moods correlate with parenting experiences.
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-medium text-indigo-900 mb-2">Streak Tracking</h4>
              <p className="text-sm text-indigo-800">
                Build consistency with journaling streaks and daily check-ins.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Growth Insights:</strong> Watch your confidence and satisfaction as a parent grow over time through data-driven insights.
            </p>
          </div>
        </div>
      ),
      actionLabel: 'View Analytics',
      highlightSelector: '[data-onboarding="analytics-link"]'
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      description: 'Welcome to your mindful parenting journey',
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
            <p className="text-muted-foreground mb-4">
              You've completed the onboarding. ParentJourney is now ready to support your mindful parenting journey.
            </p>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
            <h4 className="font-medium mb-2">Quick Tips for Success</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Aim for daily entries, even if they're short</li>
              <li>• Use check-ins to build self-awareness</li>
              <li>• Review your analytics weekly</li>
              <li>• Trust the process - insights come with time</li>
            </ul>
          </div>
          <Badge variant="secondary" className="text-xs">
            🎉 Onboarding Complete
          </Badge>
        </div>
      )
    }
  ];

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    onComplete();
    onClose();
  };

  const startInteractiveMode = () => {
    setIsInteractiveMode(true);
    // In interactive mode, highlight elements and guide users
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {currentStepData.icon}
            <span>ParentJourney Onboarding</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                {currentStepData.icon}
                <div>
                  <h3 className="text-xl">{currentStepData.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {currentStepData.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStepData.content}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {currentStepData.actionLabel && !isLastStep && (
                <Button
                  variant="outline"
                  onClick={currentStepData.onAction || (() => {})}
                  className="text-primary border-primary hover:bg-primary/5"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {currentStepData.actionLabel}
                </Button>
              )}

              {isLastStep ? (
                <Button onClick={handleComplete} className="min-w-24">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              ) : (
                <Button onClick={nextStep} className="min-w-24">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Step Navigation Dots */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}