import { useState, useEffect } from 'react';

export interface OnboardingState {
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isComplete: false,
    currentStep: 0,
    totalSteps: 3
  });

  useEffect(() => {
    const stored = localStorage.getItem('onboarding-complete');
    if (stored === 'true') {
      setState(prev => ({ ...prev, isComplete: true }));
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboarding-complete', 'true');
    setState(prev => ({ ...prev, isComplete: true }));
  };

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1)
    }));
  };

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  };

  return {
    ...state,
    completeOnboarding,
    nextStep,
    prevStep
  };
}