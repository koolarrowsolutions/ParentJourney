import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bolt, 
  Lightbulb, 
  TrendingUp, 
  Download, 
  CalendarX, 
  Heart,
  GraduationCap,
  Users,
  BarChart3
} from "lucide-react";
import { ChildProfilesDialog } from "./child-profiles-dialog";
import { MoodAnalytics } from "./mood-analytics";
import { DailyReflection } from "./daily-reflection";
import { CalmReset } from "./calm-reset";

interface JournalStats {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
}

export function Sidebar() {
  const [showMoodAnalytics, setShowMoodAnalytics] = useState(false);
  const [showDailyReflection, setShowDailyReflection] = useState(false);
  
  const { data: stats, isLoading } = useQuery<JournalStats>({
    queryKey: ["/api/journal-stats"],
    queryFn: async () => {
      const response = await fetch("/api/journal-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Calm Reset - Prominently Featured */}
      <CalmReset trigger="standalone" />
      
      {/* Quick Actions */}
      <Card className="shadow-sm border border-neutral-200 hover-lift animate-slide-in-right stagger-1">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <Bolt className="text-primary mr-2 h-5 w-5" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <ChildProfilesDialog
              trigger={
                <Button 
                  variant="outline" 
                  className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press interactive-card"
                >
                  <Users className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-neutral-800 text-base">
                      My Children
                    </div>
                    <div className="text-xs text-neutral-500">
                      Manage profiles & traits
                    </div>
                  </div>
                </Button>
              }
            />
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press interactive-card"
              onClick={() => setShowDailyReflection(!showDailyReflection)}
            >
              <Lightbulb className="text-accent mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-neutral-800">Daily Reflection</div>
                <div className="text-xs text-neutral-500">Get guided prompts</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press interactive-card"
              onClick={() => setShowMoodAnalytics(!showMoodAnalytics)}
            >
              <BarChart3 className="text-secondary mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-neutral-800">Mood Analytics</div>
                <div className="text-xs text-neutral-500">View your emotional patterns</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press interactive-card"
            >
              <Download className="text-primary mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-neutral-800">Export Entries</div>
                <div className="text-xs text-neutral-500">Download your data</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Insights */}
      <Card className="shadow-sm border border-neutral-200 hover-lift animate-slide-in-right stagger-2">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <CalendarX className="text-primary mr-2 h-5 w-5" />
            This Week's Progress
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20 hover-scale interactive-card animate-fade-in stagger-3">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="text-accent mr-2 h-4 w-4 animate-gentle-bounce" />
                    <span className="font-medium text-neutral-800">Growth Pattern</span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {stats?.weekEntries && stats.weekEntries > 0 
                      ? `You've written ${stats.weekEntries} ${stats.weekEntries === 1 ? 'entry' : 'entries'} this week!` 
                      : "Start writing to see your growth patterns."
                    }
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20 hover-scale interactive-card animate-fade-in stagger-4">
                  <div className="flex items-center mb-2">
                    <Heart className="text-secondary mr-2 h-4 w-4 animate-gentle-bounce" />
                    <span className="font-medium text-neutral-800">Streak Status</span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {stats?.longestStreak && stats.longestStreak > 0 
                      ? `Your longest streak is ${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}!` 
                      : "Build your journaling streak by writing regularly."
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parenting Tips */}
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <GraduationCap className="text-primary mr-2 h-5 w-5" />
            🎓 Parenting Tip
          </h3>
          <div className="p-4 bg-gradient-primary rounded-lg">
            <div className="text-sm text-neutral-700 mb-3">
              💫 "Remember that children are not giving you a hard time; they're having a hard time."
            </div>
            <div className="text-xs text-neutral-500">
              Daily tip based on your recent entries
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Reflection Section */}
      {showDailyReflection && (
        <DailyReflection />
      )}

      {/* Mood Analytics Section */}
      {showMoodAnalytics && (
        <Card className="shadow-sm border border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
                <BarChart3 className="text-primary mr-2 h-5 w-5" />
                📊 Mood Analytics
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMoodAnalytics(false)}
              >
                Hide
              </Button>
            </div>
            <MoodAnalytics />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
