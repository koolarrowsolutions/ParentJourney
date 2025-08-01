import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignUpPrompt } from "@/components/signup-prompt";
import { OnboardingTour } from "@/components/onboarding-tour";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Analytics from "@/pages/analytics";
import Milestones from "@/pages/milestones";
import Settings from "@/pages/settings";
import ChildEntries from "@/pages/child-entries";
import JournalHistory from "@/pages/journal-history";
import { Community } from "@/pages/community";

function AppRouter() {
  const {
    showSignUpPrompt,
    setShowSignUpPrompt,
    showTour,
    signUpTrigger,
    handleSignUp,
    handleTourComplete,
    triggerSignUpPrompt
  } = useOnboarding();

  const auth = useAuth();
  
  // Debug logging to understand auth state
  console.log('App auth state:', {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    hasJustSignedUp: auth.hasJustSignedUp
  });

  // Manual login test function
  const testLogin = async () => {
    console.log('Testing manual login...');
    try {
      const loginResponse = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          identifier: 'testuser123',
          password: 'password123'
        })
      });
      
      console.log('Login response status:', loginResponse.status);
      const loginData = await loginResponse.json();
      console.log('Login response data:', loginData);
      
      // Test immediate auth check
      const authResponse = await fetch('/auth/user', {
        credentials: 'include'
      });
      console.log('Auth check status:', authResponse.status);
      const authData = await authResponse.json();
      console.log('Auth check data:', authData);
      
    } catch (error) {
      console.error('Login test error:', error);
    }
  };

  // Expose test function globally for debugging
  (window as any).testLogin = testLogin;

  return (
    <>
      <Switch>
        <Route path="/" component={() => <Home triggerSignUpPrompt={triggerSignUpPrompt} />} />
        <Route path="/analytics" component={() => <Analytics triggerSignUpPrompt={triggerSignUpPrompt} />} />
        <Route path="/milestones" component={Milestones} />
        <Route path="/settings" component={() => <Settings triggerSignUpPrompt={triggerSignUpPrompt} />} />
        <Route path="/child-entries" component={ChildEntries} />
        <Route path="/journal-history" component={() => <JournalHistory triggerSignUpPrompt={triggerSignUpPrompt} />} />
        <Route path="/community" component={Community} />
        <Route component={NotFound} />
      </Switch>
      
      <SignUpPrompt
        isOpen={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        onSignUp={handleSignUp}
        trigger={signUpTrigger}
      />
      
      <OnboardingTour
        isOpen={showTour}
        onClose={handleTourComplete}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
