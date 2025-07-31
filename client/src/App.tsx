import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Analytics from "@/pages/analytics";
import Milestones from "@/pages/milestones";
import Settings from "@/pages/settings";
import ChildEntries from "@/pages/child-entries";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/milestones" component={Milestones} />
      <Route path="/settings" component={Settings} />
      <Route path="/child-entries" component={ChildEntries} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
