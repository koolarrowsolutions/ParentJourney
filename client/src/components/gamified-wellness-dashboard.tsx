import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipWrapper } from "./tooltip-wrapper";
import { WellnessProgressRing } from "./wellness-progress-ring";
import { AchievementBadge } from "./achievement-badge";
import { useState, useEffect } from "react";
import { 
  Award, 
  TrendingUp, 
  Target, 
  Calendar,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface WellnessStats {
  weeklyCheckIns: number;
  currentStreak: number;
  totalEntries: number;
  wellnessScore: number;
}

interface GamifiedWellnessDashboardProps {
  stats: WellnessStats;
  onStartCheckIn: () => void;
}

export function GamifiedWellnessDashboard({ stats, onStartCheckIn }: GamifiedWellnessDashboardProps) {
  const [showAchievements, setShowAchievements] = useState(false);

  // Calculate dynamic wellness metrics
  const weeklyProgress = Math.min((stats.weeklyCheckIns / 7) * 100, 100);
  const streakProgress = Math.min((stats.currentStreak / 30) * 100, 100);
  const consistencyScore = stats.totalEntries > 0 ? Math.min((stats.weeklyCheckIns / 7) * 100, 100) : 0;

  // Determine parent level based on total entries
  const getParentLevel = (entries: number) => {
    if (entries >= 100) return { level: 15, title: "Mindful Master", next: 150 };
    if (entries >= 75) return { level: 12, title: "Wellness Warrior", next: 100 };
    if (entries >= 50) return { level: 9, title: "Balanced Parent", next: 75 };
    if (entries >= 25) return { level: 6, title: "Growing Guardian", next: 50 };
    if (entries >= 10) return { level: 3, title: "Aware Parent", next: 25 };
    return { level: 1, title: "Wellness Beginner", next: 10 };
  };

  const parentLevel = getParentLevel(stats.totalEntries);
  const levelProgress = parentLevel.next ? ((stats.totalEntries % (parentLevel.next - stats.totalEntries + stats.totalEntries)) / (parentLevel.next - (parentLevel.next - stats.totalEntries))) * 100 : 100;

  // Achievement unlocking logic
  const achievements = [
    {
      type: 'streak' as const,
      level: 'bronze' as const,
      title: 'Consistency Starter',
      description: 'Complete check-ins for 3 days in a row',
      unlocked: stats.currentStreak >= 3,
      progress: Math.min(stats.currentStreak, 3),
      maxProgress: 3,
      showProgress: stats.currentStreak < 3
    },
    {
      type: 'streak' as const,
      level: 'silver' as const,
      title: 'Weekly Warrior',
      description: 'Maintain a 7-day wellness streak',
      unlocked: stats.currentStreak >= 7,
      progress: Math.min(stats.currentStreak, 7),
      maxProgress: 7,
      showProgress: stats.currentStreak < 7 && stats.currentStreak >= 3
    },
    {
      type: 'streak' as const,
      level: 'gold' as const,
      title: 'Mindful Master',
      description: 'Amazing! 21 days of consistent self-care',
      unlocked: stats.currentStreak >= 21,
      progress: Math.min(stats.currentStreak, 21),
      maxProgress: 21,
      showProgress: stats.currentStreak < 21 && stats.currentStreak >= 7
    },
    {
      type: 'consistency' as const,
      level: 'bronze' as const,
      title: 'Weekly Champion',
      description: 'Complete 5 check-ins in one week',
      unlocked: stats.weeklyCheckIns >= 5,
      progress: Math.min(stats.weeklyCheckIns, 5),
      maxProgress: 5,
      showProgress: stats.weeklyCheckIns < 5
    },
    {
      type: 'milestone' as const,
      level: 'silver' as const,
      title: 'Reflection Milestone',
      description: 'Reach 25 total wellness check-ins',
      unlocked: stats.totalEntries >= 25,
      progress: Math.min(stats.totalEntries, 25),
      maxProgress: 25,
      showProgress: stats.totalEntries < 25
    },
    {
      type: 'growth' as const,
      level: 'gold' as const,
      title: 'Wellness Authority',
      description: 'Complete 50 wellness reflections',
      unlocked: stats.totalEntries >= 50,
      progress: Math.min(stats.totalEntries, 50),
      maxProgress: 50,
      showProgress: stats.totalEntries < 50 && stats.totalEntries >= 25
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="space-y-6">
      {/* Parent Level & Progress */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-purple-800">
                Level {parentLevel.level}: {parentLevel.title}
              </CardTitle>
              <p className="text-sm text-purple-600">
                Your parenting awareness is growing beautifully
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-purple-300">
              <Award className="h-3 w-3 mr-1" />
              {unlockedAchievements.length} Badges
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <WellnessProgressRing 
              progress={levelProgress} 
              size={60} 
              color="#8B5CF6"
              showPercentage={false}
            />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress to next level</span>
                <span className="text-purple-700 font-medium">
                  {stats.totalEntries} / {parentLevel.next || stats.totalEntries}
                </span>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-indigo-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wellness Rings Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Your Wellness Journey</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <TooltipWrapper 
              content="Every day you prioritize your wellness, you're modeling self-care for your children. You're doing amazing!"
              position="top"
            >
              <div className="text-center">
                <WellnessProgressRing 
                  progress={weeklyProgress} 
                  size={70}
                  label="This Week"
                />
                <p className="text-xs text-gray-600 mt-2">
                  {stats.weeklyCheckIns}/7 days
                </p>
              </div>
            </TooltipWrapper>

            <TooltipWrapper 
              content="Consistent tracking helps you recognize patterns and celebrate your growth as a parent. Keep it up!"
              position="top"
            >
              <div className="text-center">
                <WellnessProgressRing 
                  progress={streakProgress} 
                  size={70}
                  label="Streak"
                />
                <p className="text-xs text-gray-600 mt-2">
                  {stats.currentStreak} days
                </p>
              </div>
            </TooltipWrapper>

            <TooltipWrapper 
              content="Your wellness score reflects your overall journey. Every reflection counts and helps you grow!"
              position="top"
            >
              <div className="text-center">
                <WellnessProgressRing 
                  progress={stats.wellnessScore} 
                  size={70}
                  label="Overall"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Wellness Score
                </p>
              </div>
            </TooltipWrapper>
          </div>
        </CardContent>
      </Card>

      {/* Daily Check-In CTA */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Ready for your daily wellness check-in?
              </h3>
              <p className="text-sm text-gray-600">
                Taking 2 minutes for yourself helps you be the parent you want to be
              </p>
            </div>
            <TooltipWrapper 
              content="Your feelings matter! This quick check-in helps you stay aware of your emotional and physical well-being 💝"
              position="left"
            >
              <Button 
                onClick={onStartCheckIn}
                className="bg-primary hover:bg-primary/90 transition-all hover-scale button-press"
              >
                Start Check-In
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </TooltipWrapper>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span>Your Achievements</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAchievements(!showAchievements)}
            >
              {showAchievements ? 'Hide' : 'View All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(showAchievements ? achievements : achievements.slice(0, 4)).map((achievement, index) => (
              <AchievementBadge
                key={index}
                {...achievement}
              />
            ))}
          </div>
          
          {unlockedAchievements.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 text-center">
                🎉 You've unlocked {unlockedAchievements.length} achievement{unlockedAchievements.length !== 1 ? 's' : ''}! 
                Your commitment to wellness is inspiring.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}