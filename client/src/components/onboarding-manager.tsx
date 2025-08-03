import { useState, useEffect } from "react";
import { OnboardingFlow } from "./onboarding-flow";
import { FeatureTour, TOURS } from "./feature-tour";
import { useAuth } from "@/hooks/use-auth";

type OnboardingPhase = 'initial' | 'first-time-tour' | 'analytics-tour' | 'completed' | null;

interface OnboardingManagerProps {
  children: React.ReactNode;
}

export function OnboardingManager({ children }: OnboardingManagerProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(null);
  const [hasCompletedInitial, setHasCompletedInitial] = useState(false);

  // Check onboarding status on auth change
  useEffect(() => {
    // Only show onboarding for authenticated users
    if (!isAuthenticated || !user) {
      setCurrentPhase(null);
      return;
    }

    // Check if user has completed onboarding
    const onboardingStatus = localStorage.getItem(`onboarding_${user.id}`);
    const parsedStatus = onboardingStatus ? JSON.parse(onboardingStatus) : {};
    
    console.log('OnboardingManager: Auth check', { isAuthenticated, user: user?.username, parsedStatus });
    
    // Normal flow - check if user needs onboarding
    if (!parsedStatus.initial) {
      console.log('OnboardingManager: ✅ SHOWING COMPREHENSIVE ONBOARDING - New User', { 
        hasInitial: !!parsedStatus.initial,
        userID: user?.id 
      });
      setCurrentPhase('initial');
    } else if (!parsedStatus.firstTimeTour) {
      console.log('OnboardingManager: Showing first-time tour');
      setCurrentPhase('first-time-tour');
    } else {
      console.log('OnboardingManager: Onboarding completed');
      setCurrentPhase('completed');
    }
    
    setHasCompletedInitial(!!parsedStatus.initial);
  }, [user, isAuthenticated]);

  const completePhase = (phase: OnboardingPhase) => {
    // In demo mode (no user), just close the onboarding
    if (!user) {
      setCurrentPhase('completed');
      // Clean up debug flag
      localStorage.removeItem('debug_onboarding');
      return;
    }
    
    const onboardingStatus = localStorage.getItem(`onboarding_${user.id}`);
    const parsedStatus = onboardingStatus ? JSON.parse(onboardingStatus) : {};
    
    const updatedStatus = {
      ...parsedStatus,
      [phase as string]: true,
      completedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(updatedStatus));
    
    // Progress to next phase
    switch (phase) {
      case 'initial':
        setHasCompletedInitial(true);
        setCurrentPhase('first-time-tour');
        break;
      case 'first-time-tour':
        setCurrentPhase('completed');
        break;
      default:
        setCurrentPhase('completed');
    }
  };

  const skipPhase = (phase: OnboardingPhase) => {
    // In demo mode (no user), just close the onboarding
    if (!user) {
      setCurrentPhase('completed');
      // Clean up debug flag
      localStorage.removeItem('debug_onboarding');
      return;
    }
    completePhase(phase);
  };

  // Public method to trigger specific tours
  const startTour = (tourName: keyof typeof TOURS) => {
    if (!hasCompletedInitial) return; // Don't start tours until initial onboarding is done
    
    switch (tourName) {
      case 'analytics':
        setCurrentPhase('analytics-tour');
        break;
      // Add more tour triggers as needed
    }
  };

  // Expose tour starter to global window for easy access
  useEffect(() => {
    (window as any).startParentJourneyTour = startTour;
    return () => {
      delete (window as any).startParentJourneyTour;
    };
  }, [hasCompletedInitial]);

  return (
    <>
      {children}
      
      {/* Comprehensive Onboarding Flow */}
      {currentPhase === 'initial' && (
        <OnboardingFlow
          isOpen={true}
          onComplete={() => completePhase('initial')}
          onClose={() => skipPhase('initial')}
          showLaterButton={true}
        />
      )}
      
      {/* First Time Feature Tour */}
      {currentPhase === 'first-time-tour' && (
        <FeatureTour
          tour={TOURS.firstTime}
          isActive={true}
          onComplete={() => completePhase('first-time-tour')}
          onSkip={() => skipPhase('first-time-tour')}
        />
      )}
      
      {/* Analytics Tour */}
      {currentPhase === 'analytics-tour' && (
        <FeatureTour
          tour={TOURS.analytics}
          isActive={true}
          onComplete={() => setCurrentPhase('completed')}
          onSkip={() => setCurrentPhase('completed')}
        />
      )}
    </>
  );
}

// Hook to access onboarding controls
export function useOnboarding() {
  const startTour = (tourName: keyof typeof TOURS) => {
    if ((window as any).startParentJourneyTour) {
      (window as any).startParentJourneyTour(tourName);
    }
  };

  return { startTour };
}