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

import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { WellnessProgressRing } from "@/components/wellness-progress-ring";

import { OnboardingFlow } from "@/components/onboarding-flow";
import { OnboardingTooltip } from "@/components/onboarding-tooltip";
import { OnboardingManager } from "@/components/onboarding-manager";
import { useAuthOnboarding } from "@/hooks/use-auth-onboarding";
import { useOnboarding, homeOnboardingSteps } from "@/hooks/use-onboarding";

import type { ChildProfile, JournalEntry } from "@shared/schema";

interface JournalStats {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
}

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [showMoodAnalytics, setShowMoodAnalytics] = useState<boolean>(false);
  
  // Initialize contextual onboarding tooltips
  const onboarding = useOnboarding({
    steps: homeOnboardingSteps,
    autoStart: false,
    storageKey: 'home-tooltips-completed'
  });
  
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

  // Login success popup disabled - using LoginConfirmationModal instead

  // Login success popup disabled - using LoginConfirmationModal instead

  // Enhanced trigger function that includes onboarding check
  const enhancedTriggerSignUpPrompt = (trigger: 'save' | 'bookmark' | 'export' | 'settings') => {
    // First check if onboarding should be triggered for profile access
    if (triggerOnboardingForProfileAccess()) {
      return true; // Block the action, onboarding will show
    }
    
    // No external trigger function available in simplified setup
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 w-full">
      <Header />
      
      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-white to-blue-50/50 rounded-xl sm:rounded-2xl border border-primary/20 shadow-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-800 mb-3">
              Welcome back, {parentProfile?.name || 'there'}!
            </h2>
            <p className="text-sm text-neutral-600 mb-4">
              You're one step closer to better parenting self-awareness.
            </p>
            
            {/* Clearer messaging about AI insights - Mobile optimized */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-xs sm:text-sm text-blue-800 text-center leading-relaxed">
                <span className="font-semibold">✨ The more you check in, the smarter your parenting support gets.</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                <span className="text-blue-700">Every entry helps us tailor tips, patterns, and reminders just for you and your family.</span>
              </p>
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
                {/* Balanced Stats and Wellness Row - Responsive grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  {/* Total Entries - More encouraging */}
                  <div className="bg-primary/5 rounded-lg p-2 sm:p-3 text-center border border-primary/20 animate-pop-in stagger-1">
                    <div className="text-base sm:text-lg md:text-xl font-semibold text-primary">
                      ✅ {stats?.totalEntries || 0}
                    </div>
                    <div className="text-xs sm:text-xs text-neutral-600 mt-1">Reflections logged</div>
                  </div>

                  {/* Week Entries */}
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center border border-green-200 animate-pop-in stagger-2">
                    <div className="text-base sm:text-lg md:text-xl font-semibold text-green-600">
                      {stats?.weekEntries || 0}
                    </div>
                    <div className="text-xs sm:text-xs text-neutral-600 mt-1">This Week</div>
                  </div>

                  {/* Longest Streak - More motivational */}
                  <div className="bg-orange-50 rounded-lg p-2 sm:p-3 text-center border border-orange-200 animate-pop-in stagger-3">
                    <div className="text-base sm:text-lg md:text-xl font-semibold text-orange-600">
                      🔥 {stats?.longestStreak || 'New'}
                    </div>
                    <div className="text-xs sm:text-xs text-neutral-600 mt-1">
                      {(stats?.longestStreak || 0) > 1 ? 'Day streak!' : 'Streak started!'}
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



        {/* Easy Daily Check-In - Between welcome and AI insights */}
        <div className="mb-6 w-full">
          <OnboardingTooltip
            title="Start Your Day with Check-In"
            content="Share how you're feeling today. This simple practice helps track your emotional wellness patterns and provides better AI insights."
            variant="welcome"
            position="bottom"
            persistent={false}
          >
            <div data-mood-selector className="w-full">
              <MoodSelector />
            </div>
          </OnboardingTooltip>
        </div>

        {/* AI Insights Section */}
        <div className="mb-6 w-full">
          <OnboardingTooltip
            title="AI-Powered Parenting Guidance"
            content="These personalized insights are generated from your journal entries. Click any card to dive deeper into specific topics."
            variant="feature"
            position="bottom"
            persistent={false}
          >
            <div data-ai-insights className="w-full">
              <ComprehensiveAIInsights />
            </div>
          </OnboardingTooltip>
        </div>

        {/* Feeling Overwhelmed Element - Enhanced with clearer description */}
        <div className="mb-6 w-full">
          <OnboardingTooltip
            title="Quick Stress Relief"
            content="When parenting feels overwhelming, this tool offers instant access to breathing exercises and mindfulness techniques."
            variant="tip"
            position="top"
            persistent={false}
          >
            <div data-calm-reset className="w-full">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 animate-pop-fade shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <p className="text-emerald-800 font-medium mb-1">
                      Feeling overwhelmed today? Take a moment to center yourself.
                    </p>
                    <p className="text-emerald-700 text-sm">
                      Try a 60-second breathing exercise or guided mindfulness tool
                    </p>
                  </div>
                  <CalmReset trigger="inline" />
                </div>
              </div>
            </div>
          </OnboardingTooltip>
        </div>

        {/* Quick Actions Group */}
        <div className="mb-6 w-full">
          <OnboardingTooltip
            title="Quick Actions Hub"
            content="Fast access to key features like writing entries, viewing analytics, and managing profiles. Hover over each button for specific details."
            variant="feature"
            position="top"
            persistent={false}
          >
            <div data-quick-actions className="w-full">
              <QuickActionsGroup 
                selectedMood={selectedMood} 
                triggerSignUpPrompt={enhancedTriggerSignUpPrompt}
              />
            </div>
          </OnboardingTooltip>
        </div>

        {/* Child-specific entries overview */}
        {childProfiles && childProfiles.length > 0 && (
          <div className="mb-6 w-full">
            <OnboardingTooltip
              title="Track Each Child's Journey"
              content="View recent entries for each child. Click any card to see their full journal history and development insights."
              variant="feature"
              position="top"  
              persistent={false}
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 animate-bounce-in stagger-3 w-full" data-children-journey>
                <div className="flex items-center justify-between mb-4 w-full">
                  <h3 className="text-base font-semibold text-blue-800 flex items-center">
                    👶 Your Children's Journey
                  </h3>
                  <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    💡 Regular reflections help you notice patterns in moods and needs
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  {childProfiles.map((child, index) => (
                    <div key={child.id} className={`animate-pop-in stagger-${index + 4} w-full`}>
                      <ChildEntryOverview child={child} />
                    </div>
                  ))}
                </div>
              </div>
            </OnboardingTooltip>
          </div>
        )}
        
        {/* Recent Journal Entries */}
        <div className="mb-6 w-full">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 p-4 hover-lift animate-pop-fade stagger-5 w-full">
            <h3 className="text-base font-semibold text-emerald-800 mb-3 flex items-center">
              📖 Recent Journal Entries
            </h3>
            <RecentEntries />
          </div>
        </div>
        

      </main>
      
      {/* Floating Parenting Chatbot */}
      <ParentingChatbot />
      
      {/* Onboarding Manager for Feature Tours */}
      <OnboardingManager />



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
