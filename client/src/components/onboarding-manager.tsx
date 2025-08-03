import { useState, useEffect } from "react";
import { InteractiveOnboarding } from "./interactive-onboarding";
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
    if (!isAuthenticated || !user) {
      setCurrentPhase(null);
      return;
    }



    // For testing purposes - allow resetting onboarding by clearing localStorage
    // Users can reset by running: localStorage.removeItem(`onboarding_${user.id}`) in console
    
    // Check if user has completed onboarding
    const onboardingStatus = localStorage.getItem(`onboarding_${user.id}`);
    const parsedStatus = onboardingStatus ? JSON.parse(onboardingStatus) : {};
    
    if (!parsedStatus.initial) {
      setCurrentPhase('initial');
    } else if (!parsedStatus.firstTimeTour) {
      setCurrentPhase('first-time-tour');
    } else {
      setCurrentPhase('completed');
    }
    
    setHasCompletedInitial(!!parsedStatus.initial);
  }, [user, isAuthenticated]);

  const completePhase = (phase: OnboardingPhase) => {
    if (!user) return;
    
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
      
      {/* Initial Interactive Onboarding */}
      <InteractiveOnboarding
        isOpen={currentPhase === 'initial'}
        onClose={() => skipPhase('initial')}
        onComplete={() => completePhase('initial')}
      />
      
      {/* First Time Feature Tour */}
      <FeatureTour
        isActive={currentPhase === 'first-time-tour'}
        tour={TOURS.firstTime}
        onComplete={() => completePhase('first-time-tour')}
        onSkip={() => skipPhase('first-time-tour')}
      />
      
      {/* Analytics Tour */}
      <FeatureTour
        isActive={currentPhase === 'analytics-tour'}
        tour={TOURS.analytics}
        onComplete={() => setCurrentPhase('completed')}
        onSkip={() => setCurrentPhase('completed')}
      />
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