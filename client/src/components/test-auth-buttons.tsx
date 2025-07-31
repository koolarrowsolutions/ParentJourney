import { Button } from "@/components/ui/button";
import { useAuthOnboarding } from "@/hooks/use-auth-onboarding";

export function TestAuthButtons() {
  const { markUserAsSignedUp, shouldShowOnboarding } = useAuthOnboarding();

  const handleSimulateSignup = () => {
    console.log("Simulating user signup...");
    markUserAsSignedUp();
    console.log("Signup simulation complete");
  };

  const resetAuth = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50 bg-white p-3 rounded-lg border shadow-lg">
      <p className="text-xs text-neutral-500 mb-2">Testing Auth Flow:</p>
      <p className="text-xs text-blue-600">Onboarding: {shouldShowOnboarding ? "Yes" : "No"}</p>
      <Button
        onClick={handleSimulateSignup}
        size="sm"
        className="text-xs"
      >
        Simulate Sign Up
      </Button>
      <Button
        onClick={resetAuth}
        size="sm"
        variant="outline"
        className="text-xs"
      >
        Reset Auth State
      </Button>
    </div>
  );
}