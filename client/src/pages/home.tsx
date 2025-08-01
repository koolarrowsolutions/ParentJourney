import { useState, useEffect } from "react";
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
import { ComprehensiveAIInsights } from "@/components/comprehensive-ai-insights";
import { LoginSuccessPopup } from "@/components/login-success-popup";
import { GamifiedWellnessDashboard } from "@/components/gamified-wellness-dashboard";

import { OnboardingFlow } from "@/components/onboarding-flow";
import { useAuthOnboarding } from "@/hooks/use-auth-onboarding";

import type { ChildProfile, JournalEntry } from "@shared/schema";

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
  const [showLoginSuccess, setShowLoginSuccess] = useState<boolean>(false);
  
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
      const response = await fetch("/api/journal-stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/child-profiles", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    queryFn: async () => {
      const response = await fetch("/api/journal-entries", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  // Show login success popup on first visit or significant achievements
  useEffect(() => {
    if (stats && !shouldShowOnboarding) {
      const hasSeenPopupToday = localStorage.getItem(`loginSuccess-${new Date().toDateString()}`);
      
      // Show popup if they have meaningful progress and haven't seen it today
      if (!hasSeenPopupToday && (stats.totalEntries > 0 || stats.longestStreak > 0)) {
        setShowLoginSuccess(true);
        localStorage.setItem(`loginSuccess-${new Date().toDateString()}`, 'true');
      }
    }
  }, [stats, shouldShowOnboarding]);

  const handleCloseLoginSuccess = () => {
    setShowLoginSuccess(false);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-white to-blue-50/50 rounded-xl sm:rounded-2xl border border-primary/20 shadow-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-800 mb-2">
              Welcome back to your parenting journey
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4">{getDailyGreeting()}</p>
            {isLoading ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <Skeleton className="h-12 sm:h-16 rounded-lg animate-shimmer" />
                  <Skeleton className="h-12 sm:h-16 rounded-lg animate-shimmer" />
                  <Skeleton className="h-12 sm:h-16 rounded-lg animate-shimmer" />
                </div>
                <Skeleton className="h-10 sm:h-12 rounded-lg animate-shimmer" />
              </div>
            ) : (
              <InteractiveProgress 
                totalEntries={stats?.totalEntries || 0}
                weekEntries={stats?.weekEntries || 0}
                longestStreak={stats?.longestStreak || 0}
              />
            )}
          </div>
        </div>

        {/* Gamified Wellness Dashboard */}
        <div className="mb-4 sm:mb-6">
          <GamifiedWellnessDashboard 
            stats={{
              weeklyCheckIns: stats?.weekEntries || 0,
              currentStreak: stats?.longestStreak || 0,
              totalEntries: stats?.totalEntries || 0,
              wellnessScore: Math.min(((stats?.totalEntries || 0) / 10) * 100, 100)
            }}
            onStartCheckIn={() => {
              // This will be implemented to trigger the mood selector
              const moodSelector = document.querySelector('[data-mood-selector]');
              if (moodSelector) {
                moodSelector.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </div>

        {/* Easy Daily Check-In - Between welcome and AI insights */}
        <div className="mb-4 sm:mb-6" data-mood-selector>
          <MoodSelector />
        </div>

        {/* AI Insights Section */}
        <div className="mb-4 sm:mb-6">
          <ComprehensiveAIInsights />
        </div>

        {/* Feeling Overwhelmed Element */}
        <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 animate-pop-fade shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-emerald-800 font-medium">
              Feeling overwhelmed today? Take a moment to center yourself.
            </p>
            <CalmReset trigger="inline" />
          </div>
        </div>



        {/* Quick Actions Group */}
        <div className="mb-4">
          <QuickActionsGroup 
            selectedMood={selectedMood} 
            triggerSignUpPrompt={enhancedTriggerSignUpPrompt}
          />
        </div>

        {/* Streamlined Content Layout */}
        <div className="space-y-6">
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

      {/* Show login success popup */}
      {showLoginSuccess && stats && (
        <LoginSuccessPopup
          totalEntries={stats.totalEntries}
          weekEntries={stats.weekEntries}
          longestStreak={stats.longestStreak}
          recentMoodTrend="stable"
          onClose={handleCloseLoginSuccess}
        />
      )}
    </div>
  );
}
