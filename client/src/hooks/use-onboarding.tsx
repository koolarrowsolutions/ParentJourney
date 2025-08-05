import { useState, useEffect } from "react";
import { 
  getOnboardingState, 
  markFirstVisit, 
  shouldShowSignUpPrompt, 
  shouldShowTour,
  isFirstTimeVisitor,
  markSignedUp 
} from "@/utils/onboarding-storage";
import { useAuth } from "@/hooks/use-auth";

export function useOnboarding() {
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [signUpTrigger, setSignUpTrigger] = useState<'save' | 'bookmark' | 'export' | 'settings'>('save');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Mark first visit if this is the first time
    if (isFirstTimeVisitor()) {
      markFirstVisit();
    }

    // If user is authenticated but localStorage thinks they haven't signed up, sync the state
    if (isAuthenticated && user && shouldShowSignUpPrompt()) {
      markSignedUp();
    }

    // Check if we should show the tour for returning signed-up users
    if (shouldShowTour()) {
      setShowTour(true);
    }
  }, [isAuthenticated, user]);

  const triggerSignUpPrompt = (trigger: 'save' | 'bookmark' | 'export' | 'settings') => {
    // If user is already authenticated, don't show signup prompt regardless of localStorage state
    if (isAuthenticated && user) {
      return false; // User is authenticated, action can proceed normally
    }
    
    // If user is not authenticated and localStorage suggests they should sign up
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
    console.log('startTourManually called, current showTour:', showTour);
    setShowTour(true);
    console.log('startTourManually - setShowTour(true) called');
  };

  const returnObject = {
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

  console.log('useOnboarding hook returning:', returnObject);
  console.log('startTourManually function definition:', startTourManually);
  return returnObject;
}