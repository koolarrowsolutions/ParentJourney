import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignUpPrompt } from "@/components/signup-prompt";
import { OnboardingTour } from "@/components/onboarding-tour";
import { useOnboarding } from "@/hooks/use-onboarding";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Analytics from "@/pages/analytics";
import Milestones from "@/pages/milestones";
import Settings from "@/pages/settings";
import ChildEntries from "@/pages/child-entries";
import JournalHistory from "@/pages/journal-history";

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

  return (
    <>
      <Switch>
        <Route path="/" component={() => <Home triggerSignUpPrompt={triggerSignUpPrompt} />} />
        <Route path="/analytics" component={() => <Analytics triggerSignUpPrompt={triggerSignUpPrompt} />} />
        <Route path="/milestones" component={Milestones} />
        <Route path="/settings" component={() => <Settings triggerSignUpPrompt={triggerSignUpPrompt} />} />
        <Route path="/child-entries" component={ChildEntries} />
        <Route path="/journal-history" component={() => <JournalHistory triggerSignUpPrompt={triggerSignUpPrompt} />} />
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
