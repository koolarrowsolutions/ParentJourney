import { useState, useEffect } from "react";
import { 
  getOnboardingState, 
  markFirstVisit, 
  shouldShowSignUpPrompt, 
  shouldShowTour,
  isFirstTimeVisitor 
} from "@/utils/onboarding-storage";

export function useOnboarding() {
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [signUpTrigger, setSignUpTrigger] = useState<'save' | 'bookmark' | 'export' | 'settings'>('save');

  useEffect(() => {
    // Mark first visit if this is the first time
    if (isFirstTimeVisitor()) {
      markFirstVisit();
    }

    // Check if we should show the tour for returning signed-up users
    if (shouldShowTour()) {
      setShowTour(true);
    }
  }, []);

  const triggerSignUpPrompt = (trigger: 'save' | 'bookmark' | 'export' | 'settings') => {
    if (shouldShowSignUpPrompt()) {
      setSignUpTrigger(trigger);
      setShowSignUpPrompt(true);
      return true; // Indicates that the prompt was shown
    }
    return false; // Indicates that the action can proceed normally
  };

  const handleSignUp = () => {
    setShowSignUpPrompt(false);
    // After signing up, show the tour
    setTimeout(() => {
      setShowTour(true);
    }, 500);
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  const startTourManually = () => {
    setShowTour(true);
  };

  return {
    showSignUpPrompt,
    setShowSignUpPrompt,
    showTour,
    setShowTour,
    signUpTrigger,
    triggerSignUpPrompt,
    handleSignUp,
    handleTourComplete,
    startTourManually,
    onboardingState: getOnboardingState()
  };
}