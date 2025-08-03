import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignUpPrompt } from "@/components/signup-prompt";
import { OnboardingTour } from "@/components/onboarding-tour";
import { OnboardingManager } from "@/components/onboarding-manager";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/hooks/use-auth";
import { LoginConfirmationModal } from "@/components/login-confirmation-modal";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Analytics from "@/pages/analytics";
import Milestones from "@/pages/milestones";
import Settings from "@/pages/settings";
import ChildEntries from "@/pages/child-entries";
import JournalHistory from "@/pages/journal-history";
import { Community } from "@/pages/community";
import AdminDashboard from "@/pages/admin";
import Checkout from "@/pages/checkout";
import PaymentDemo from "@/pages/payment-demo";
import { Wellness } from "@/pages/wellness";

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
    hasJustSignedUp: auth.hasJustSignedUp,
    hasJustLoggedIn: auth.hasJustLoggedIn
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

  // Expose test functions globally for debugging
  (window as any).testLogin = testLogin;
  (window as any).simulateMobile = () => {
    // Override user agent detection for testing
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      writable: false
    });
    console.log('Mobile simulation enabled - refresh page to see mobile features');
  };

  // Test welcome modal functionality
  (window as any).testWelcomeModal = () => {
    localStorage.setItem('parentjourney_just_logged_in', 'true');
    console.log('Login flag set - refresh page to see welcome modal');
    window.location.reload();
  };

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
        <Route path="/wellness" component={Wellness} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/payment-demo" component={PaymentDemo} />
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
      
      <LoginConfirmationModal
        isVisible={auth.hasJustLoggedIn}
        onClose={auth.clearLoginStatus}
        userName={auth.user?.name || auth.user?.username}
      />
      


    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OnboardingManager>
          <Toaster />
          <AppRouter />
        </OnboardingManager>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
