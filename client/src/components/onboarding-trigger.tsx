import { Button } from "@/components/ui/button";
import { HelpCircle, Sparkles } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";

interface OnboardingTriggerProps {
  variant?: "button" | "help";
  size?: "sm" | "default" | "lg";
}

export function OnboardingTrigger({ variant = "button", size = "sm" }: OnboardingTriggerProps) {
  const { startTourManually } = useOnboarding();

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
    startTourManually();
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