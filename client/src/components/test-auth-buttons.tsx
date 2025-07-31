import { Button } from "@/components/ui/button";
import { useAuthOnboarding } from "@/hooks/use-auth-onboarding";

export function TestAuthButtons() {
  const { markUserAsSignedUp } = useAuthOnboarding();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50 bg-white p-3 rounded-lg border shadow-lg">
      <p className="text-xs text-neutral-500 mb-2">Testing Auth Flow:</p>
      <Button
        onClick={markUserAsSignedUp}
        size="sm"
        className="text-xs"
      >
        Simulate Sign Up
      </Button>
    </div>
  );
}