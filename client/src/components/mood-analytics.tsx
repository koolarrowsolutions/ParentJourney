import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Calendar, Heart, Smile } from "lucide-react";
import { JournalEntry } from "@shared/schema";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { useState } from "react";

type TimeRange = "week" | "month" | "3months";

interface MoodData {
  date: string;
  mood: string;
  count: number;
}

interface MoodStats {
  totalEntries: number;
  moodCounts: { [key: string]: number };
  moodTrends: MoodData[];
  averageMoodsPerDay: number;
  mostCommonMood: string;
  moodStreak: { mood: string; days: number };
}

const MOOD_COLORS: { [key: string]: string } = {
  "😊": "bg-yellow-100 text-yellow-800",
  "😢": "bg-blue-100 text-blue-800", 
  "😴": "bg-gray-100 text-gray-800",
  "😤": "bg-red-100 text-red-800",
  "🤗": "bg-green-100 text-green-800",
  "😰": "bg-orange-100 text-orange-800",
  "🥳": "bg-purple-100 text-purple-800",
  "😌": "bg-indigo-100 text-indigo-800"
};

const MOOD_LABELS: { [key: string]: string } = {
  "😊": "Happy",
  "😢": "Sad", 
  "😴": "Tired",
  "😤": "Frustrated",
  "🤗": "Loving",
  "😰": "Stressed",
  "🥳": "Excited",
  "😌": "Peaceful"
};

export function MoodAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const getMoodStats = (): MoodStats | null => {
    if (!entries) return null;

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timeRange) {
      case "week":
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "3months":
        startDate = subDays(now, 90);
        break;
      default:
        startDate = startOfMonth(now);
    }

    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= startDate && entryDate <= endDate && entry.mood;
    });

    if (filteredEntries.length === 0) return null;

    // Count moods
    const moodCounts: { [key: string]: number } = {};
    filteredEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    // Find most common mood
    const mostCommonMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    // Calculate mood trends (group by day)
    const moodTrends: MoodData[] = [];
    const dailyMoods: { [key: string]: { [mood: string]: number } } = {};

    filteredEntries.forEach(entry => {
      if (entry.mood) {
        const day = format(new Date(entry.createdAt), 'yyyy-MM-dd');
        if (!dailyMoods[day]) dailyMoods[day] = {};
        dailyMoods[day][entry.mood] = (dailyMoods[day][entry.mood] || 0) + 1;
      }
    });

    Object.entries(dailyMoods).forEach(([date, moods]) => {
      Object.entries(moods).forEach(([mood, count]) => {
        moodTrends.push({ date, mood, count });
      });
    });

    // Calculate average moods per day
    const uniqueDays = new Set(filteredEntries.map(e => format(new Date(e.createdAt), 'yyyy-MM-dd')));
    const averageMoodsPerDay = filteredEntries.length / uniqueDays.size;

    // Calculate mood streak (simplified - most recent consecutive days with same mood)
    const recentEntries = [...filteredEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7);
    
    let streakMood = recentEntries[0]?.mood || "";
    let streakDays = 0;
    
    for (const entry of recentEntries) {
      if (entry.mood === streakMood) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalEntries: filteredEntries.length,
      moodCounts,
      moodTrends,
      averageMoodsPerDay: Math.round(averageMoodsPerDay * 10) / 10,
      mostCommonMood,
      moodStreak: { mood: streakMood, days: streakDays }
    };
  };

  const stats = getMoodStats();

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "week": return "This Week";
      case "month": return "This Month";
      case "3months": return "Last 3 Months";
      default: return "This Month";
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <div className="text-center py-8 text-neutral-500">
            Loading mood analytics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-red-500" />
            📈 Mood Analytics
          </span>
          <div className="flex gap-2">
            {(["week", "month", "3months"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === "week" ? "Week" : range === "month" ? "Month" : "3M"}
              </Button>
            ))}
          </div>
        </CardTitle>
        <div className="text-sm text-neutral-600">
          Tracking your emotional journey • {getTimeRangeLabel()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!stats ? (
          <div className="text-center py-8 text-neutral-500">
            <Smile className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
            <p>No mood data found for {getTimeRangeLabel().toLowerCase()}</p>
            <p className="text-sm">Add moods to your entries to see analytics!</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
                <div className="text-xs text-blue-700">Mood Entries</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.averageMoodsPerDay}</div>
                <div className="text-xs text-green-700">Per Day</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.moodCounts).length}</div>
                <div className="text-xs text-purple-700">Mood Types</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.moodStreak.days}</div>
                <div className="text-xs text-yellow-700">Day Streak</div>
              </div>
            </div>

            {/* Most Common Mood */}
            {stats.mostCommonMood && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{stats.mostCommonMood}</span>
                  <div className="text-center">
                    <div className="font-medium text-neutral-800">Most Common Mood</div>
                    <div className="text-sm text-neutral-600">
                      {MOOD_LABELS[stats.mostCommonMood]} ({stats.moodCounts[stats.mostCommonMood]} times)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mood Distribution */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-4 flex items-center">
                <BarChart3 className="mr-2 h-4 w-4 text-blue-500" />
                💕 Mood Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.moodCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => {
                    const percentage = Math.round((count / stats.totalEntries) * 100);
                    return (
                      <div key={mood} className="flex items-center space-x-3">
                        <span className="text-2xl w-8 text-center">{mood}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{MOOD_LABELS[mood] || 'Unknown'}</span>
                            <span className="text-neutral-500">{count} times ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Current Streak */}
            {stats.moodStreak.days > 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  <div>
                    <div className="font-medium text-amber-800">
                      🔥 Current Streak: {stats.moodStreak.days} days
                    </div>
                    <div className="text-sm text-amber-700">
                      You've been feeling {MOOD_LABELS[stats.moodStreak.mood]} {stats.moodStreak.mood} consistently!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mood Timeline (Recent 7 days) */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-4 flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-green-500" />
                📅 Recent Mood Timeline
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = subDays(new Date(), 6 - i);
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const dayMoods = stats.moodTrends.filter(m => m.date === dateStr);
                  
                  return (
                    <div key={i} className="text-center">
                      <div className="text-xs text-neutral-500 mb-1">
                        {format(date, 'EEE')}
                      </div>
                      <div className="h-16 bg-neutral-100 rounded-lg flex flex-col items-center justify-center space-y-1">
                        {dayMoods.length > 0 ? (
                          dayMoods.map((mood, idx) => (
                            <span key={idx} className="text-lg">
                              {mood.mood}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-400 text-xs">No mood</span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {format(date, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}