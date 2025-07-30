import { useQuery } from "@tanstack/react-query";
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
  Users
} from "lucide-react";
import { ChildProfilesDialog } from "./child-profiles-dialog";

interface JournalStats {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
}

export function Sidebar() {
  const { data: stats, isLoading } = useQuery<JournalStats>({
    queryKey: ["/api/journal-stats"],
    queryFn: async () => {
      const response = await fetch("/api/journal-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <Bolt className="text-primary mr-2 h-5 w-5" />
            ⚡ Quick Actions
          </h3>
          <div className="space-y-3">
            <ChildProfilesDialog
              trigger={
                <Button 
                  variant="outline" 
                  className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5"
                >
                  <Users className="text-primary mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium text-neutral-800">👶 My Children</div>
                    <div className="text-xs text-neutral-500">Manage profiles & traits</div>
                  </div>
                </Button>
              }
            />
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5"
            >
              <Lightbulb className="text-accent mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-neutral-800">📱 Daily Reflection</div>
                <div className="text-xs text-neutral-500">Get guided prompts</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5"
            >
              <TrendingUp className="text-secondary mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-neutral-800">📊 View Progress</div>
                <div className="text-xs text-neutral-500">See your journey</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5"
            >
              <Download className="text-primary mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-neutral-800">📥 Export Entries</div>
                <div className="text-xs text-neutral-500">Download your data</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Insights */}
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <CalendarX className="text-primary mr-2 h-5 w-5" />
            📅 This Week's Insights
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="text-accent mr-2 h-4 w-4" />
                    <span className="font-medium text-neutral-800">Growth Pattern</span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {stats?.weekEntries && stats.weekEntries > 0 
                      ? `You've written ${stats.weekEntries} ${stats.weekEntries === 1 ? 'entry' : 'entries'} this week!` 
                      : "Start writing to see your growth patterns."
                    }
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                  <div className="flex items-center mb-2">
                    <Heart className="text-secondary mr-2 h-4 w-4" />
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
    </div>
  );
}
