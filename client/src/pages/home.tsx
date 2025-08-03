import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

import { OnboardingFlow } from "@/components/onboarding-flow";
import { useAuthOnboarding } from "@/hooks/use-auth-onboarding";
import { authenticatedFetch } from "@/utils/api-client";

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
      const response = await authenticatedFetch("/api/journal-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: !!parentProfile, // Only fetch when authenticated with profile
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
    enabled: !!parentProfile, // Only fetch when authenticated with profile
  });

  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/journal-entries");
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
    enabled: !!parentProfile, // Only fetch when authenticated with profile
  });

  // Login success popup disabled - using LoginConfirmationModal instead

  // Login success popup disabled - using LoginConfirmationModal instead

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
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-800 mb-3">
              Welcome back, {parentProfile?.name || 'there'}!
            </h2>
            <p className="text-sm text-neutral-600 mb-4">
              You're one step closer to better parenting self-awareness.
            </p>
            

            

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
                {/* Balanced Stats and Wellness Row - Responsive grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  {/* Total Entries - More encouraging */}
                  <div className="bg-primary/5 rounded-lg p-2 sm:p-3 text-center border border-primary/20 animate-pop-in stagger-1">
                    <div className="text-base sm:text-lg md:text-xl font-semibold text-primary">
                      ✅ {stats?.totalEntries || 0}
                    </div>
                    <div className="text-xs sm:text-xs text-neutral-600 mt-1">Total Interactions</div>
                  </div>

                  {/* Week Entries */}
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center border border-green-200 animate-pop-in stagger-2">
                    <div className="text-base sm:text-lg md:text-xl font-semibold text-green-600">
                      {stats?.weekEntries || 0}
                    </div>
                    <div className="text-xs sm:text-xs text-neutral-600 mt-1">Interactions This Week</div>
                  </div>

                  {/* Longest Streak - More motivational */}
                  <div className="bg-orange-50 rounded-lg p-2 sm:p-3 text-center border border-orange-200 animate-pop-in stagger-3">
                    <div className="text-base sm:text-lg md:text-xl font-semibold text-orange-600">
                      {getStreakEmoji(stats?.longestStreak || 0)} {stats?.longestStreak || 'New'}
                    </div>
                    <div className="text-xs sm:text-xs text-neutral-600 mt-1">
                      {(stats?.longestStreak || 0) > 1 ? 'Day streak!' : 'Current Daily Interaction Streak'}
                    </div>
                  </div>

                  {/* Wellness Level */}
                  <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center border border-purple-200 animate-pop-in stagger-4">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 mr-1" />
                      <div className="text-base sm:text-lg md:text-xl font-semibold text-purple-600">
                        {(() => {
                          const entries = stats?.totalEntries || 0;
                          if (entries >= 100) return 15;
                          if (entries >= 75) return 12;
                          if (entries >= 50) return 9;
                          if (entries >= 25) return 6;
                          if (entries >= 10) return 3;
                          return 1;
                        })()}
                      </div>
                    </div>
                    <div className="text-xs sm:text-xs text-neutral-600">
                      Wellness Level
                    </div>
                  </div>
                </div>

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

      {/* Login success popup disabled - using LoginConfirmationModal instead */}
    </div>
  );
}
