import { useState, useEffect } from "react";
import { Check, Star, Zap, Award, TrendingUp, Calendar } from "lucide-react";

interface InteractiveProgressProps {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
  weekSharedJourneys: number;
  weekQuickMoments: number;
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

// Helper function to get wellness level
function getWellnessLevel(entries: number): number {
  if (entries >= 100) return 15;
  if (entries >= 75) return 12;
  if (entries >= 50) return 9;
  if (entries >= 25) return 6;
  if (entries >= 10) return 3;
  return 1;
}

export function InteractiveProgress({ totalEntries, weekEntries, longestStreak, weekSharedJourneys, weekQuickMoments }: InteractiveProgressProps) {
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    // Trigger number animation on mount
    const timer = setTimeout(() => setAnimateNumbers(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show milestone celebration for significant achievements
    if (totalEntries > 0 && (totalEntries % 5 === 0 || longestStreak >= 7)) {
      setShowMilestone(true);
      const timer = setTimeout(() => setShowMilestone(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [totalEntries, longestStreak]);

  const wellnessLevel = getWellnessLevel(totalEntries);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Grid of 6 metrics with consistent styling */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        
        {/* Total Interactions */}
        <div className="bg-primary/5 rounded-lg p-2 sm:p-3 text-center border border-primary/20 animate-pop-in stagger-1">
          <div className="text-base sm:text-lg md:text-xl font-semibold text-primary">
            ✅ {totalEntries || 0}
          </div>
          <div className="text-xs sm:text-xs text-neutral-600 mt-1">Total Interactions</div>
        </div>

        {/* Interactions This Week */}
        <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center border border-green-200 animate-pop-in stagger-2">
          <div className="text-base sm:text-lg md:text-xl font-semibold text-green-600">
            📅 {weekEntries || 0}
          </div>
          <div className="text-xs sm:text-xs text-neutral-600 mt-1">Interactions This Week</div>
        </div>

        {/* Daily Interaction Streak */}
        <div className="bg-orange-50 rounded-lg p-2 sm:p-3 text-center border border-orange-200 animate-pop-in stagger-3">
          <div className="text-base sm:text-lg md:text-xl font-semibold text-orange-600">
            {getStreakEmoji(longestStreak)} {longestStreak || 'New'}
          </div>
          <div className="text-xs sm:text-xs text-neutral-600 mt-1">
            {(longestStreak || 0) > 1 ? 'Day streak!' : 'Daily Interaction Streak'}
          </div>
        </div>

        {/* Shared Journeys This Week */}
        <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center border border-blue-200 animate-pop-in stagger-4">
          <div className="text-base sm:text-lg md:text-xl font-semibold text-blue-600">
            📖 {weekSharedJourneys || 0}
          </div>
          <div className="text-xs sm:text-xs text-neutral-600 mt-1">Shared Journeys This Week</div>
        </div>

        {/* Quick Moments This Week */}
        <div className="bg-amber-50 rounded-lg p-2 sm:p-3 text-center border border-amber-200 animate-pop-in stagger-5">
          <div className="text-base sm:text-lg md:text-xl font-semibold text-amber-600">
            ⚡ {weekQuickMoments || 0}
          </div>
          <div className="text-xs sm:text-xs text-neutral-600 mt-1">Quick Moments This Week</div>
        </div>

        {/* Wellness Level */}
        <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center border border-purple-200 animate-pop-in stagger-6">
          <div className="flex items-center justify-center mb-1">
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 mr-1" />
            <div className="text-base sm:text-lg md:text-xl font-semibold text-purple-600">
              {wellnessLevel}
            </div>
          </div>
          <div className="text-xs sm:text-xs text-neutral-600">
            Wellness Level
          </div>
        </div>

      </div>



      {/* Milestone Celebration */}
      {showMilestone && (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 animate-slide-up">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current animate-wiggle" />
              <span className="text-lg font-semibold text-neutral-800">Milestone Reached!</span>
              <Star className="h-5 w-5 text-yellow-500 fill-current animate-wiggle" />
            </div>
            <p className="text-sm text-neutral-600">
              {totalEntries % 5 === 0 && totalEntries > 0 && `Congratulations on your ${totalEntries} interactions! `}
              {longestStreak >= 7 && `Amazing ${longestStreak}-day streak! `}
              Keep up the great work!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}