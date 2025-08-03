import { useState, useEffect } from "react";
import { Check, Star, Zap, BarChart3 } from "lucide-react";

interface InteractiveProgressProps {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
  weekSharedJourneys: number;
  weekQuickMoments: number;
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

  const progressToNextMilestone = ((totalEntries % 5) / 5) * 100;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top row - 5 metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Entries */}
        <div className="bg-primary/5 rounded-lg p-3 sm:p-4 text-center border border-primary/20 animate-pop-in stagger-1">
          <div className="relative">
          <div className="text-xl sm:text-2xl font-bold text-primary">
            {totalEntries || 0}
          </div>
          {showMilestone && totalEntries % 5 === 0 && totalEntries > 0 && (
            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-bounce-subtle">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
            </div>
          )}
        </div>
        <span className="text-xs sm:text-sm text-neutral-600 block mt-1">Total Entries</span>
        
        {/* Progress bar for next milestone */}
        {totalEntries > 0 && (
          <div className="mt-2">
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressToNextMilestone}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500 mt-1 block">
              {5 - (totalEntries % 5)} more to milestone
            </span>
          </div>
        )}
          </div>

        {/* This Week */}
        <div className="bg-primary/5 rounded-lg p-3 sm:p-4 text-center border border-primary/20 animate-bounce-in stagger-2">
          <div className="relative">
          <div className="text-xl sm:text-2xl font-bold text-primary">
            {weekEntries || 0}
          </div>
          {weekEntries >= 5 && (
            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-gentle-bounce">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 fill-current" />
            </div>
          )}
        </div>
        <span className="text-xs sm:text-sm text-neutral-600 block mt-1">This Week</span>
        
        {/* Week progress indicator */}
        <div className="mt-2 flex justify-center space-x-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < weekEntries 
                  ? 'bg-primary animate-pop-in' 
                  : 'bg-neutral-300'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
            </div>
          </div>

        {/* Streak */}
        <div className="bg-primary/5 rounded-lg p-3 sm:p-4 text-center border border-primary/20 animate-pop-fade stagger-3">
          <div className="relative">
          <div className="text-xl sm:text-2xl font-bold text-primary">
            {longestStreak || 0}
          </div>
          {showMilestone && longestStreak >= 7 && (
            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-bounce-subtle">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 fill-current" />
            </div>
          )}
        </div>
        <span className="text-xs sm:text-sm text-neutral-600 block mt-1">Day Streak</span>
        
        {/* Streak status */}
        <div className="mt-2">
          <div className={`text-xs px-2 py-1 rounded-full transition-all duration-500 ${
            longestStreak >= 7 
              ? 'bg-green-100 text-green-700 animate-pulse-glow' 
              : longestStreak >= 3 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-neutral-100 text-neutral-600'
          }`}>
            {longestStreak >= 7 ? 'On Fire!' : longestStreak >= 3 ? 'Good!' : 'Keep Going!'}
            </div>
          </div>
        </div>

        {/* Shared Journeys This Week */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center border border-blue-200 animate-bounce-in stagger-4">
          <div className="relative">
            <div className="text-xl sm:text-2xl font-bold text-blue-700">
              {weekSharedJourneys || 0}
            </div>
            {weekSharedJourneys >= 3 && (
              <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-gentle-bounce">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 fill-current" />
              </div>
            )}
          </div>
          <span className="text-xs sm:text-sm text-blue-700 block mt-1">Shared Journeys This Week</span>
        </div>

        {/* Quick Moments This Week */}
        <div className="bg-amber-50 rounded-lg p-3 sm:p-4 text-center border border-amber-200 animate-pop-fade stagger-5">
          <div className="relative">
            <div className="text-xl sm:text-2xl font-bold text-amber-700">
              {weekQuickMoments || 0}
            </div>
            {weekQuickMoments >= 5 && (
              <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-gentle-bounce">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-current" />
              </div>
            )}
          </div>
          <span className="text-xs sm:text-sm text-amber-700 block mt-1">Quick Moments This Week</span>
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
              {totalEntries % 5 === 0 && totalEntries > 0 && `Congratulations on your ${totalEntries} entries! `}
              {longestStreak >= 7 && `Amazing ${longestStreak}-day streak! `}
              Keep up the great work!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}