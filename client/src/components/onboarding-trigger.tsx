import { Button } from "@/components/ui/button";
import { HelpCircle, Sparkles } from "lucide-react";
import { useOnboardingContext } from "@/contexts/onboarding-context";
import { ReactNode } from "react";

interface OnboardingTriggerProps {
  variant?: "button" | "help" | "restart";
  size?: "sm" | "default" | "lg";
  children?: ReactNode;
}

export function OnboardingTrigger({ variant = "button", size = "sm", children }: OnboardingTriggerProps) {
  const onboardingContext = useOnboardingContext();
  const { startTourManually, setShowTour } = onboardingContext;
  
  console.log('OnboardingTrigger: onboarding context:', onboardingContext);
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
    
    try {
      startTourManually();
      console.log('OnboardingTrigger: startTourManually called successfully');
    } catch (error) {
      console.error('OnboardingTrigger: Error calling startTourManually:', error);
    }
  };

  // If children are provided, wrap them with click handler
  if (children) {
    return (
      <div onClick={handleStartTour} className="cursor-pointer">
        {children}
      </div>
    );
  }

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

  if (variant === "restart") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleRestartOnboarding}
        className="text-primary border-primary hover:bg-primary/5"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        Restart Onboarding
      </Button>
    );
  }

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