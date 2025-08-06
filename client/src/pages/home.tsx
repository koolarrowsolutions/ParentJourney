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
import analyticsImagePath from "@assets/image_1754459613578.png";

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

  // Debug authentication state
  console.log('Home component auth state:', { 
    isAuthenticated, 
    profileLoading, 
    user: user?.username,
    parentProfile: parentProfile?.name 
  });

  // Show landing page for truly unauthenticated users only
  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
        <Header />
        
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Hero Landing Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-blue-100 shadow-xl p-6 sm:p-8 md:p-12 relative overflow-hidden">
              {/* Subtle path-inspired decoration */}
              <div className="absolute inset-0 opacity-5">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <path 
                    d="M 20 180 Q 80 150 140 160 Q 200 170 260 140 Q 320 110 380 96" 
                    stroke="#7CB342" 
                    strokeWidth="12" 
                    fill="none" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-800 mb-4 relative z-10">
                Every parent is different. <span className="text-primary">Your support should be too.</span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-600 mb-6 max-w-4xl mx-auto">
                With just a few journal entries and mood check-ins, ParentJourney's AI coaches you with real-time personalized reflections and insights — all specifically shaped around your child, your style, and your journey.
              </p>
              
              {/* Get Started Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <AuthDialog 
                  mode="signup"
                  trigger={
                    <button 
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                      data-testid="button-get-started"
                    >
                      Get Started
                    </button>
                  }
                />
                <AuthDialog 
                  mode="login"
                  trigger={
                    <button 
                      className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
                      data-testid="button-sign-in"
                    >
                      Sign In
                    </button>
                  }
                />
              </div>
            </div>
          </div>

          {/* Features Preview Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center text-neutral-800 mb-6">See How ParentJourney Works</h2>
            
            {/* Interface Preview Mock-ups */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Daily Check-in Preview */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600">📝</span>
                  </div>
                  Daily Mood & Journal Check-in
                </h3>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-2">How are you feeling today?</p>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-sm">😊</div>
                      <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-sm">😌</div>
                      <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-sm">😔</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-xs text-gray-600 mb-1">Today's reflection:</p>
                    <p className="text-sm text-gray-700">"Had a wonderful morning routine with Emma. She helped make breakfast and was so proud..."</p>
                  </div>
                </div>
              </div>

              {/* AI Insights Preview */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600">🤖</span>
                  </div>
                  Personalized AI Coaching
                </h3>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">👶</span>
                      </div>
                      <div>
                        <p className="text-sm text-purple-800 font-medium mb-1">Child-Specific Insight:</p>
                        <p className="text-sm text-purple-700">"I notice you've mentioned morning routines three times this week! This consistency is building security for Emma. Consider adding a simple choice (red cup or blue cup?) to boost her autonomy..."</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">🧠</span>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">Pattern Recognition:</p>
                        <p className="text-sm text-blue-700">"Your mood drops on Wednesdays when Jake has soccer practice. Try preparing the night before to reduce morning stress."</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">💡</span>
                      </div>
                      <div>
                        <p className="text-sm text-green-800 font-medium mb-1">Developmental Tip:</p>
                        <p className="text-sm text-green-700">"At 7 years old, Emma is developing independence. Your entries show she responds well to choices. Try 'Would you like to brush teeth first or put on pajamas first?'"</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">❤️</span>
                      </div>
                      <div>
                        <p className="text-sm text-orange-800 font-medium mb-1">Self-Care Reminder:</p>
                        <p className="text-sm text-orange-700">"You've been 'stressed' 4 times this week. Remember: taking 10 minutes for yourself isn't selfish—it's necessary. A calm parent creates a calm home."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Showcase */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">
                Powerful Analytics to Track Your Family's Journey
              </h2>
              
              {/* Analytics Image */}
              <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img 
                  src={analyticsImagePath}
                  alt="Mood Timeline and Distribution Analytics"
                  className="w-full h-auto"
                />
              </div>
              
              {/* Analytics Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mood Timeline */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📈</span>
                    </div>
                    <h3 className="font-semibold text-blue-800">Mood Timeline Tracking</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Visualize daily mood patterns over time to identify trends and understand emotional cycles.
                  </p>
                  <div className="flex items-center text-xs text-blue-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Track progress from "Very Low" to "Excellent"
                  </div>
                </div>

                {/* Mood Distribution */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <h3 className="font-semibold text-green-800">AI Mood Analysis</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Automated detection of emotions from your journal entries creates detailed mood insights.
                  </p>
                  <div className="flex items-center text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Categorizes 7 different emotional states
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Tracking Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600">🎯</span>
                  </div>
                  Track Your Progress
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-800">Journal Streak</span>
                      <span className="text-lg font-bold text-green-700">12 days 🔥</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-600 mb-1">This Week</p>
                      <p className="text-lg font-bold text-blue-800">7 entries</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs text-purple-600 mb-1">Mood Trend</p>
                      <p className="text-lg font-bold text-purple-800">↗️ Improving</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalized Tips Preview */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-orange-600">💡</span>
                  </div>
                  AI-Powered Pattern Recognition
                </h3>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">✨</span>
                      </div>
                      <div>
                        <p className="text-sm text-orange-800 font-medium mb-1">Insight Detected:</p>
                        <p className="text-sm text-orange-700">"You feel most 'Content' during morning activities. Consider scheduling important conversations then for better outcomes."</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-xs text-gray-600 mb-1">Frequency Analysis:</p>
                    <p className="text-sm text-gray-700">Your top emotion this month is "Neutral" (9 occurrences), followed by "Content" (5 occurrences)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Track Patterns</h3>
                <p className="text-sm text-neutral-600">Visualize your family's emotional patterns and growth trends over time</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Child-Specific Insights</h3>
                <p className="text-sm text-neutral-600">Get tailored advice based on each child's age, personality, and development</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💝</span>
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">Build Connection</h3>
                <p className="text-sm text-neutral-600">Strengthen your bond through mindful reflection and self-awareness</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-purple-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-4">
              Start Your Parenting Journey Today
            </h2>
            <p className="text-lg text-neutral-600 mb-6 max-w-2xl mx-auto">
              Join thousands of parents who are building stronger connections with their children 
              through mindful reflection and AI-guided insights.
            </p>
            <AuthDialog 
              mode="signup"
              trigger={
                <button 
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-lg text-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                  data-testid="button-get-started-cta"
                >
                  Get Started Free
                </button>
              }
            />
          </div>
        </main>
        
        {/* Footer */}
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
