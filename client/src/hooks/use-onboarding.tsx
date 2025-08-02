import { useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  content: string;
  variant?: 'welcome' | 'feature' | 'tip' | 'achievement';
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

interface UseOnboardingOptions {
  steps: OnboardingStep[];
  autoStart?: boolean;
  storageKey?: string;
}

export function useOnboarding(options: UseOnboardingOptions) {
  const { steps, autoStart = true, storageKey = 'onboarding-completed' } = options || {};
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!steps || steps.length === 0) return;
    
    // Check if onboarding was already completed
    const completed = localStorage.getItem(storageKey);
    if (completed) {
      setCompletedSteps(JSON.parse(completed));
      return;
    }

    if (autoStart) {
      // Start onboarding after a brief delay
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [steps, autoStart, storageKey]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    setIsActive(false);
    if (steps) {
      const completed = steps.map(step => step.id);
      setCompletedSteps(completed);
      localStorage.setItem(storageKey, JSON.stringify(completed));
    }
  };

  const completeOnboarding = () => {
    setIsActive(false);
    if (steps) {
      const completed = steps.map(step => step.id);
      setCompletedSteps(completed);
      localStorage.setItem(storageKey, JSON.stringify(completed));
    }
  };

  const resetOnboarding = () => {
    localStorage.removeItem(storageKey);
    setCompletedSteps([]);
    setCurrentStep(0);
    setIsActive(true);
  };

  const isStepCompleted = (stepId: string) => {
    return completedSteps.includes(stepId);
  };

  const currentStepData = steps && steps[currentStep];

  return {
    currentStep,
    currentStepData,
    isActive,
    totalSteps: steps ? steps.length : 0,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
    isStepCompleted,
    completedSteps
  };
}

// Predefined onboarding flows
export const homeOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    target: '[data-mood-selector]',
    title: 'Welcome to ParentJourney!',
    content: 'Start your day by sharing how you\'re feeling. This quick check-in helps track your emotional wellness over time.',
    variant: 'welcome',
    position: 'bottom',
    delay: 500
  },
  {
    id: 'ai-insights',
    target: '[data-ai-insights]',
    title: 'AI-Powered Insights',
    content: 'Get personalized parenting guidance based on your journal entries. Click any card to explore detailed analysis.',
    variant: 'feature',
    position: 'bottom'
  },
  {
    id: 'calm-reset',
    target: '[data-calm-reset]',
    title: 'Take a Breather',
    content: 'Feeling overwhelmed? Use our Calm Reset tool for quick breathing exercises and mindfulness techniques.',
    variant: 'tip',
    position: 'top'
  },
  {
    id: 'quick-actions',
    target: '[data-quick-actions]',
    title: 'Quick Actions',
    content: 'These buttons give you fast access to key features. Hover over any action to see exactly what it does.',
    variant: 'feature',
    position: 'top'
  },
  {
    id: 'children-journey',
    target: '[data-children-journey]',
    title: 'Your Children\'s Journey',
    content: 'Track each child\'s development and your parenting experiences. Click any card to view detailed entries.',
    variant: 'feature',
    position: 'top'
  }
];

export const firstTimeUserSteps: OnboardingStep[] = [
  {
    id: 'profile-setup',
    target: '[data-profile-button]',
    title: 'Set Up Your Profile',
    content: 'Tell us a bit about yourself to get personalized parenting insights and recommendations.',
    variant: 'welcome',
    position: 'bottom'
  },
  {
    id: 'add-children',
    target: '[data-children-button]',
    title: 'Add Your Children',
    content: 'Add your children\'s profiles to get age-appropriate guidance and track their development.',
    variant: 'feature',
    position: 'bottom'
  },
  {
    id: 'first-entry',
    target: '[data-journal-button]',
    title: 'Write Your First Entry',
    content: 'Share what\'s on your mind today. Every entry helps build a picture of your parenting journey.',
    variant: 'achievement',
    position: 'bottom'
  }
];