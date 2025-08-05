import { Button } from "@/components/ui/button";
import { HelpCircle, Sparkles } from "lucide-react";
import { useOnboarding } from "./onboarding-manager";

interface OnboardingTriggerProps {
  variant?: "button" | "help";
  size?: "sm" | "default" | "lg";
}

export function OnboardingTrigger({ variant = "button", size = "sm" }: OnboardingTriggerProps) {
  const { startTour } = useOnboarding();

  const handleRestartOnboarding = () => {
    // Clear onboarding status for current user to restart
    const user = JSON.parse(localStorage.getItem('auth_data') || '{}')?.user;
    if (user?.id) {
      localStorage.removeItem(`onboarding_${user.id}`);
      window.location.reload(); // Reload to trigger onboarding
    }
  };

  const handleStartAnalyticsTour = () => {
    startTour('analytics');
  };

  if (variant === "help") {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={handleRestartOnboarding}
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
        onClick={handleStartAnalyticsTour}
        className="text-muted-foreground hover:text-white hover:bg-primary"
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        Analytics Tour
      </Button>
    </div>
  );
}