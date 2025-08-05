import { Button } from "@/components/ui/button";
import { HelpCircle, Sparkles } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";

interface OnboardingTriggerProps {
  variant?: "button" | "help";
  size?: "sm" | "default" | "lg";
}

export function OnboardingTrigger({ variant = "button", size = "sm" }: OnboardingTriggerProps) {
  const onboardingHook = useOnboarding();
  const { startTourManually, setShowTour } = onboardingHook;
  
  console.log('OnboardingTrigger: onboardingHook:', onboardingHook);
  console.log('OnboardingTrigger: startTourManually:', startTourManually);

  const handleRestartOnboarding = () => {
    // Clear onboarding status for current user to restart
    const authData = localStorage.getItem('parentjourney_auth');
    if (authData) {
      try {
        const user = JSON.parse(authData)?.user;
        if (user?.id) {
          localStorage.removeItem(`onboarding_${user.id}`);
          window.location.reload(); // Reload to trigger onboarding
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  };

  const handleStartTour = () => {
    console.log('OnboardingTrigger: handleStartTour clicked');
    console.log('startTourManually function:', startTourManually);
    console.log('setShowTour function:', setShowTour);
    
    // Try both approaches to trigger the tour
    try {
      if (startTourManually) {
        startTourManually();
        console.log('OnboardingTrigger: startTourManually called successfully');
      } else if (setShowTour) {
        console.log('OnboardingTrigger: Using setShowTour directly');
        setShowTour(true);
        console.log('OnboardingTrigger: setShowTour(true) called directly');
      } else {
        console.error('OnboardingTrigger: No tour functions available');
      }
    } catch (error) {
      console.error('OnboardingTrigger: Error calling tour functions:', error);
    }
  };

  if (variant === "help") {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={handleStartTour}
        className="text-muted-foreground hover:text-white hover:bg-primary"
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        Help & Tour
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={handleRestartOnboarding}
        className="text-primary border-primary hover:bg-primary/5"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        Restart Onboarding
      </Button>
      <Button
        variant="ghost"
        size={size}
        onClick={handleStartTour}
        className="text-muted-foreground hover:text-white hover:bg-primary"
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        Quick Tour
      </Button>
    </div>
  );
}