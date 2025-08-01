import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Flame, 
  TrendingUp, 
  Calendar,
  Heart,
  Star,
  Trophy,
  Target,
  X
} from "lucide-react";

interface LoginSuccessPopupProps {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
  recentMoodTrend?: 'improving' | 'stable' | 'declining';
  onClose: () => void;
}

export function LoginSuccessPopup({ 
  totalEntries, 
  weekEntries, 
  longestStreak, 
  recentMoodTrend = 'stable',
  onClose 
}: LoginSuccessPopupProps) {
  const [showContent, setShowContent] = useState(false);
  const [achievements, setAchievements] = useState<Array<{
    icon: any;
    title: string;
    description: string;
    color: string;
    bgColor: string;
  }>>([]);

  useEffect(() => {
    // Show content after a brief delay for animation timing
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const newAchievements = [];

    // Check for streak achievements
    if (longestStreak >= 7) {
      newAchievements.push({
        icon: Flame,
        title: `${longestStreak}-Day Streak!`,
        description: "You're building incredible consistency",
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      });
    } else if (longestStreak >= 3) {
      newAchievements.push({
        icon: Calendar,
        title: `${longestStreak}-Day Progress`,
        description: "Great momentum building!",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      });
    }

    // Check for total entries milestones
    if (totalEntries >= 50) {
      newAchievements.push({
        icon: Trophy,
        title: "Journal Master",
        description: `${totalEntries} entries of parenting wisdom`,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      });
    } else if (totalEntries >= 25) {
      newAchievements.push({
        icon: Star,
        title: "Dedicated Parent",
        description: `${totalEntries} thoughtful reflections recorded`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      });
    } else if (totalEntries >= 10) {
      newAchievements.push({
        icon: CheckCircle,
        title: "Building Habits",
        description: `${totalEntries} entries show your commitment`,
        color: "text-green-600",
        bgColor: "bg-green-50"
      });
    }

    // Check for weekly consistency
    if (weekEntries >= 5) {
      newAchievements.push({
        icon: Target,
        title: "Weekly Warrior",
        description: `${weekEntries} check-ins this week - amazing!`,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
      });
    } else if (weekEntries >= 3) {
      newAchievements.push({
        icon: Heart,
        title: "Steady Progress",
        description: `${weekEntries} entries this week`,
        color: "text-pink-600",
        bgColor: "bg-pink-50"
      });
    }

    // Add mood trend achievement
    if (recentMoodTrend === 'improving') {
      newAchievements.push({
        icon: TrendingUp,
        title: "Mood Improving",
        description: "Your wellness is trending upward!",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
      });
    }

    setAchievements(newAchievements);
  }, [totalEntries, weekEntries, longestStreak, recentMoodTrend]);

  // Don't show popup if no meaningful achievements
  if (achievements.length === 0 && totalEntries === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${15 + (i * 7)}%`,
              top: `${20 + (i % 4) * 15}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          >
            <Star className="h-3 w-3 text-yellow-400 opacity-60" />
          </div>
        ))}
      </div>

      <Card className={`w-full max-w-lg max-h-[80vh] overflow-y-auto bg-white shadow-2xl border-2 border-primary/20 transition-all duration-700 ${
        showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      }`}>
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute -top-2 -right-2 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1">
                  <Star className="h-6 w-6 text-yellow-400 animate-spin" />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="text-gray-600">Look at your amazing progress</p>
          </div>

          {/* Achievements Grid */}
          {achievements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 text-center">Your Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`${achievement.bgColor} rounded-lg p-4 border border-current/20 transition-all duration-500 hover-scale`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full bg-white/80 ${achievement.color}`}>
                        <achievement.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${achievement.color}`}>
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 text-center">Your Journey</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{totalEntries}</div>
                <div className="text-xs text-gray-600">Total Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{weekEntries}</div>
                <div className="text-xs text-gray-600">This Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{longestStreak}</div>
                <div className="text-xs text-gray-600">Best Streak</div>
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center space-y-3">
            <div className="flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className="h-4 w-4 text-red-400 fill-current animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
            <p className="text-sm text-gray-700 font-medium">
              {longestStreak >= 7 
                ? "You're building incredible parenting awareness. Keep this momentum going!"
                : totalEntries >= 10
                  ? "Your dedication to self-reflection is building stronger parenting skills."
                  : weekEntries >= 3
                    ? "Great consistency this week! Every entry makes you a more mindful parent."
                    : "Every step counts on your parenting journey. You're doing great!"
              }
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 transition-all hover-scale button-press"
          >
            Continue Your Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}