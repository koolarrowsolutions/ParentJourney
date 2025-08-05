import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { RecentEntries } from "@/components/recent-entries";
import { InteractiveProgress } from "@/components/interactive-progress";
import { Award } from "lucide-react";
import { ChildEntryOverview } from "@/components/child-entry-overview";
import { MoodSelector } from "@/components/mood-selector";
import { QuickActionsGroup } from "@/components/quick-actions-group";
import { getDailyInsight } from "@shared/daily-insights";
import { CalmReset } from "@/components/calm-reset";
import { ParentingChatbot } from "@/components/parenting-chatbot";
import { ComprehensiveAIInsights } from "@/components/comprehensive-ai-insights";
import { StorySharingSection } from "@/components/story-sharing-section";

import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { WellnessProgressRing } from "@/components/wellness-progress-ring";
import { OnboardingTrigger } from "@/components/onboarding-trigger";
import { AuthDialog } from "@/components/auth-dialog";


import { authenticatedFetch } from "@/utils/api-client";
import { useAuth } from "@/hooks/use-auth";

import type { ChildProfile, JournalEntry } from "@shared/schema";

interface JournalStats {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
  weekSharedJourneys: number;
  weekQuickMoments: number;
}

interface HomeProps {
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
  onProfileAccessAttempt?: () => boolean;
}

// Helper function to get progressive emoji based on streak length
function getStreakEmoji(streak: number): string {
  if (streak === 0) return '🌱'; // Just starting
  if (streak === 1) return '👍'; // First day
  if (streak === 2) return '💪'; // Building momentum
  if (streak >= 3 && streak <= 4) return '⭐'; // Good progress
  if (streak >= 5 && streak <= 6) return '🏆'; // Great achievement
  if (streak >= 7 && streak <= 13) return '🔥'; // On fire weekly streak
  if (streak >= 14 && streak <= 20) return '🚀'; // Rocket momentum  
  if (streak >= 21 && streak <= 29) return '💎'; // Diamond persistence
  if (streak >= 30) return '👑'; // Crown achievement
  return '🌟'; // Fallback star
}

export default function Home({ triggerSignUpPrompt }: HomeProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [showMoodAnalytics, setShowMoodAnalytics] = useState<boolean>(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // Query parent profile only when authenticated
  const { data: parentProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["/api/parent-profile"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/parent-profile");
      if (!response.ok) throw new Error("Failed to fetch parent profile");
      return response.json();
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 300000, // Cache for 5 minutes - profile data rarely changes
    retry: false // Don't retry on auth failures
  });



  const { data: stats, isLoading } = useQuery<JournalStats>({
    queryKey: ["/api/journal-stats"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/journal-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: isAuthenticated && !!parentProfile, // Only fetch when fully authenticated
    staleTime: 30000, // Cache for 30 seconds
    retry: false // Don't retry on auth failures
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
    enabled: isAuthenticated && !!parentProfile, // Only fetch when fully authenticated
    staleTime: 60000, // Cache for 1 minute - child profiles change rarely
    retry: false // Don't retry on auth failures
  });

  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/journal-entries");
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
    enabled: isAuthenticated && !!parentProfile, // Only fetch when fully authenticated
    staleTime: 10000, // Cache for 10 seconds
    retry: false // Don't retry on auth failures
  });

  // Login success popup disabled - using LoginConfirmationModal instead

  // Login success popup disabled - using LoginConfirmationModal instead

  // Enhanced trigger function that fallbacks gracefully for authenticated users
  const enhancedTriggerSignUpPrompt = (trigger: 'save' | 'bookmark' | 'export' | 'settings') => {
    // Use the regular trigger function if available
    return triggerSignUpPrompt ? triggerSignUpPrompt(trigger) : false;
  };



  // Show loading state while profile is loading for authenticated users only
  if (profileLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
        <Header />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your parenting journey...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if profile failed to load for authenticated users
  if (profileError && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
        <Header />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Failed to load profile: {profileError.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-white to-blue-50/50 rounded-xl sm:rounded-2xl border border-primary/20 shadow-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-800 mb-2">
                  Welcome back, {parentProfile?.name || 'there'}!
                </h2>
                <p className="text-sm text-neutral-600">
                  You're one step closer to better parenting self-awareness.
                </p>
              </div>
              <div className="hidden sm:block">
                <OnboardingTrigger variant="help" />
              </div>
            </div>
            

            

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
              <div className="space-y-4">
                {/* Enhanced Progress Tracking with New Weekly Counters */}
                <InteractiveProgress 
                  totalEntries={stats?.totalEntries || 0}
                  weekEntries={stats?.weekEntries || 0}
                  longestStreak={stats?.longestStreak || 0}
                  weekSharedJourneys={stats?.weekSharedJourneys || 0}
                  weekQuickMoments={stats?.weekQuickMoments || 0}
                />

                {/* Wellness Journey Description - More motivational & Mobile responsive */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200 mt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs sm:text-sm font-medium text-purple-800">
                        🌱 {(() => {
                          const entries = stats?.totalEntries || 0;
                          if (entries >= 100) return "Mindful Master";
                          if (entries >= 75) return "Wellness Warrior";
                          if (entries >= 50) return "Balanced Parent";
                          if (entries >= 25) return "Growing Guardian";
                          if (entries >= 10) return "Aware Parent";
                          return "Beginner Level";
                        })()} - Building awareness
                      </div>
                    </div>
                    <div className="text-xs text-purple-600 text-left sm:text-right">
                      {(() => {
                        const entries = stats?.totalEntries || 0;
                        const nextLevel = entries < 10 ? 10 : entries < 25 ? 25 : entries < 50 ? 50 : entries < 75 ? 75 : 100;
                        if (entries >= 100) return "🎉 Max level reached!";
                        return `${nextLevel - entries} more to next level`;
                      })()}
                    </div>
                    
                    {/* Small Progress Indicators */}
                    <div className="flex items-center space-x-2">
                      <TooltipWrapper 
                        content="Your weekly check-ins help you stay connected with your wellness patterns"
                        position="top"
                      >
                        <WellnessProgressRing 
                          progress={Math.min(((stats?.weekEntries || 0) / 7) * 100, 100)} 
                          size={28}
                          showPercentage={false}
                        />
                      </TooltipWrapper>
                      
                      <TooltipWrapper 
                        content="Consistency in self-reflection shows your commitment to growth"
                        position="top"
                      >
                        <WellnessProgressRing 
                          progress={Math.min(((stats?.longestStreak || 0) / 21) * 100, 100)} 
                          size={28}
                          showPercentage={false}
                        />
                      </TooltipWrapper>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Easy Daily Check-In - How are you really doing today */}
        <div className="mb-4 sm:mb-6" data-mood-selector>
          <MoodSelector />
        </div>

        {/* Story Sharing Section - Tell Your Story */}
        <div className="mb-4 sm:mb-6">
          <StorySharingSection 
            selectedMood={selectedMood} 
            triggerSignUpPrompt={enhancedTriggerSignUpPrompt}
          />
        </div>

        {/* Recent Journal Entries - Moved below Story Sharing */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 p-3 hover-lift animate-pop-fade stagger-3">
            <h3 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center">
              📖 Recent Journal Entries
            </h3>
            <p className="text-xs text-emerald-600 mb-3">
              Your latest reflections and moments - these also appear in your children's profiles below
            </p>
            <RecentEntries />
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="mb-4 sm:mb-6">
          <ComprehensiveAIInsights />
        </div>

        {/* Feeling Overwhelmed Element */}
        <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 animate-pop-fade shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-emerald-800 font-medium">
              Feeling overwhelmed today? Take a moment to center yourself.
            </p>
            <CalmReset trigger="inline" />
          </div>
        </div>



        {/* Your Children's Journey Section */}
        <div className="space-y-3">
          {childProfiles && childProfiles.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3 animate-bounce-in stagger-5">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                👶 Your Children's Journey
              </h3>
              <p className="text-xs text-blue-600 mb-3">
                Child-specific views of your journal entries and reflections
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {childProfiles.map((child, index) => (
                  <div key={child.id} className={`animate-pop-in stagger-${index + 6}`}>
                    <ChildEntryOverview child={child} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Family Profiles - Moved to Bottom */}
        <div className="mb-4">
          <QuickActionsGroup 
            selectedMood={selectedMood} 
            triggerSignUpPrompt={enhancedTriggerSignUpPrompt}
          />
        </div>
        

      </main>
      
      {/* Floating Parenting Chatbot */}
      <ParentingChatbot />





      {/* Auth Dialog for non-authenticated users */}
      <AuthDialog 
        mode="signup"
        trigger="manual"
      />

      {/* Login success popup disabled - using LoginConfirmationModal instead */}
      
      {/* Footer with Privacy Policy link */}
      <footer className="mt-16 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Link 
            href="/privacy-policy" 
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            data-testid="link-privacy-policy"
          >
            Privacy Policy & Terms of Use
          </Link>
        </div>
      </footer>
    </div>
  );
}
