import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { RecentEntries } from "@/components/recent-entries";
import { InteractiveProgress } from "@/components/interactive-progress";
import { ChildEntryOverview } from "@/components/child-entry-overview";
import { MoodSelector } from "@/components/mood-selector";
import { QuickActionsGroup } from "@/components/quick-actions-group";
import { getDailyGreeting } from "@shared/greetings";
import { CalmReset } from "@/components/calm-reset";
import { ParentingChatbot } from "@/components/parenting-chatbot";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { useAuthOnboarding } from "@/hooks/use-auth-onboarding";
import { TestAuthButtons } from "@/components/test-auth-buttons";
import type { ChildProfile } from "@shared/schema";

interface JournalStats {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
}

interface HomeProps {
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
  onProfileAccessAttempt?: () => boolean;
}

export default function Home({ triggerSignUpPrompt }: HomeProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [showMoodAnalytics, setShowMoodAnalytics] = useState<boolean>(false);
  
  const {
    parentProfile,
    shouldShowOnboarding,
    completeOnboarding,
    dismissOnboarding,
    triggerOnboardingForProfileAccess,
  } = useAuthOnboarding();

  const { data: stats, isLoading } = useQuery<JournalStats>({
    queryKey: ["/api/journal-stats"],
    queryFn: async () => {
      const response = await fetch("/api/journal-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  // Enhanced trigger function that includes onboarding check
  const enhancedTriggerSignUpPrompt = (trigger: 'save' | 'bookmark' | 'export' | 'settings') => {
    // First check if onboarding should be triggered for profile access
    if (triggerOnboardingForProfileAccess()) {
      return true; // Block the action, onboarding will show
    }
    
    // Otherwise use the original trigger function
    return triggerSignUpPrompt ? triggerSignUpPrompt(trigger) : false;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-primary/20 shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-neutral-800 mb-2">
              Welcome back to your parenting journey
            </h2>
            <p className="text-neutral-600 mb-4">{getDailyGreeting()}</p>
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-16 rounded-lg animate-shimmer" />
                  <Skeleton className="h-16 rounded-lg animate-shimmer" />
                  <Skeleton className="h-16 rounded-lg animate-shimmer" />
                </div>
                <Skeleton className="h-12 rounded-lg animate-shimmer" />
              </div>
            ) : (
              <InteractiveProgress 
                totalEntries={stats?.totalEntries || 0}
                weekEntries={stats?.weekEntries || 0}
                longestStreak={stats?.longestStreak || 0}
                onMoodAnalyticsClick={() => setShowMoodAnalytics(!showMoodAnalytics)}
              />
            )}
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 animate-pop-fade">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">AI Insights & Guidance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Progress Analysis */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 interactive-card hover-lift button-press cursor-pointer hover:border-primary hover:bg-primary/10 hover:shadow-md transition-all duration-200">
                <h4 className="font-medium text-primary mb-2">Your Parenting Progress</h4>
                <p className="text-xs text-neutral-700">
                  Building consistent reflection habits. Continue documenting experiences.
                </p>
              </div>

              {/* Child Behavior Analysis */}
              <div className="bg-accent/5 rounded-lg p-4 border border-accent/20 interactive-card hover-lift button-press cursor-pointer hover:border-accent hover:bg-accent/10 hover:shadow-md transition-all duration-200">
                <h4 className="font-medium text-accent mb-2">Child Development Patterns</h4>
                <p className="text-xs text-neutral-700">
                  Add entries about your child's behavior for personalized insights.
                </p>
              </div>

              {/* Tips & Recommendations */}
              <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/20 interactive-card hover-lift button-press cursor-pointer hover:border-secondary hover:bg-secondary/10 hover:shadow-md transition-all duration-200">
                <h4 className="font-medium text-secondary mb-2">Personalized Tips</h4>
                <p className="text-xs text-neutral-700">
                  Set up profiles to receive tailored parenting strategies.
                </p>
              </div>

              {/* Introspective Questions */}
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 interactive-card hover-lift button-press cursor-pointer hover:border-neutral-400 hover:bg-neutral-100 hover:shadow-md transition-all duration-200">
                <h4 className="font-medium text-neutral-800 mb-2">Have you considered?</h4>
                <p className="text-xs text-neutral-700">
                  Explore thoughtful questions for deeper self-reflection.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Analytics Results - Shows between welcome and mood selection */}
        {showMoodAnalytics && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 animate-slide-in-down">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Mood Analytics</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Your emotional patterns and insights from journal entries.
              </p>
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <p className="text-neutral-500 text-sm">
                  Add more journal entries to see detailed mood analytics and patterns.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mood Selection - Independent Element */}
        <div className="mb-6">
          <MoodSelector 
            selectedMood={selectedMood} 
            onMoodChange={setSelectedMood} 
          />
        </div>

        {/* Feeling Overwhelmed Element */}
        <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200 animate-pop-fade">
          <div className="flex items-center justify-between">
            <p className="text-emerald-800 font-medium">
              Feeling overwhelmed today? Take a moment to center yourself.
            </p>
            <CalmReset trigger="inline" />
          </div>
        </div>

        {/* Quick Actions Group */}
        <div className="mb-8">
          <QuickActionsGroup 
            selectedMood={selectedMood} 
            triggerSignUpPrompt={enhancedTriggerSignUpPrompt}
          />
        </div>

        {/* Streamlined Content Layout */}
        <div className="space-y-8">
          {/* Child-specific entries overview */}
          {childProfiles && childProfiles.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 animate-bounce-in stagger-3">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Your Children's Journey</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {childProfiles.map((child, index) => (
                  <div key={child.id} className={`animate-pop-in stagger-${index + 4}`}>
                    <ChildEntryOverview child={child} />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 hover-lift animate-pop-fade stagger-5">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Journal Entries</h3>
            <RecentEntries />
          </div>
        </div>
      </main>
      
      {/* Floating Parenting Chatbot */}
      <ParentingChatbot />

      {/* Test Authentication Buttons (only in development) */}
      {import.meta.env.DEV && <TestAuthButtons />}

      {/* Onboarding Flow */}
      {shouldShowOnboarding && (
        <OnboardingFlow 
          isOpen={true}
          onComplete={() => {
            completeOnboarding();
            window.location.reload(); // Refresh to load new profile data
          }}
          onClose={dismissOnboarding}
          showLaterButton={true}
        />
      )}
    </div>
  );
}
