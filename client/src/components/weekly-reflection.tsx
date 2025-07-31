import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Heart, Brain, Star, BarChart3 } from "lucide-react";
import { JournalEntry } from "@shared/schema";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";

interface WeeklyStats {
  totalEntries: number;
  moodDistribution: { [key: string]: number };
  topWords: Array<{ word: string; count: number }>;
  averageLength: number;
  patterns: string[];
  insights: string[];
}

export function WeeklyReflection() {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = last week, etc.

  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const getWeeklyStats = (): WeeklyStats | null => {
    if (!entries) return null;

    const now = new Date();
    const weekStart = startOfWeek(subWeeks(now, selectedWeek));
    const weekEnd = endOfWeek(subWeeks(now, selectedWeek));

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    if (weekEntries.length === 0) return null;

    // Mood distribution
    const moodDistribution: { [key: string]: number } = {};
    weekEntries.forEach(entry => {
      if (entry.mood) {
        moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
      }
    });

    // Top words analysis
    const allText = weekEntries.map(e => e.content).join(' ').toLowerCase();
    const words = allText.match(/\b\w{4,}\b/g) || [];
    const wordCount: { [key: string]: number } = {};
    
    // Filter out common words
    const commonWords = ['this', 'that', 'with', 'have', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'many', 'some', 'what', 'know', 'just', 'like', 'very', 'when', 'come', 'back', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'new'];
    
    words.forEach(word => {
      if (!commonWords.includes(word) && word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    // Average length
    const averageLength = Math.round(
      weekEntries.reduce((sum, entry) => sum + entry.content.length, 0) / weekEntries.length
    );

    // Generate insights
    const insights = [];
    const mostCommonMood = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0];
    
    if (mostCommonMood) {
      insights.push(`Your most common mood this week was ${mostCommonMood[0]} (${mostCommonMood[1]} times)`);
    }

    if (averageLength > 200) {
      insights.push("You've been writing detailed entries - great for reflection!");
    } else if (averageLength < 100) {
      insights.push("Your entries have been brief - consider adding more detail for better insights");
    }

    if (weekEntries.length >= 5) {
      insights.push("Excellent journaling consistency this week!");
    } else if (weekEntries.length >= 3) {
      insights.push("Good journaling frequency - try for daily entries");
    }

    // Patterns based on content analysis
    const patterns = [];
    if (allText.includes('challenge') || allText.includes('difficult')) {
      patterns.push("Facing challenges - seeking growth opportunities");
    }
    if (allText.includes('proud') || allText.includes('achievement')) {
      patterns.push("Celebrating wins and achievements");
    }
    if (allText.includes('tired') || allText.includes('exhausted')) {
      patterns.push("Managing energy levels and self-care");
    }

    return {
      totalEntries: weekEntries.length,
      moodDistribution,
      topWords,
      averageLength,
      patterns,
      insights
    };
  };

  const stats = getWeeklyStats();
  const weekDate = subWeeks(new Date(), selectedWeek);
  const weekLabel = selectedWeek === 0 ? "This Week" : 
                   selectedWeek === 1 ? "Last Week" : 
                   `${selectedWeek + 1} Weeks Ago`;

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <div className="text-center py-8 text-neutral-500">
            Loading weekly reflection...
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
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            📊 Weekly Reflection
          </span>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((week) => (
              <Button
                key={week}
                variant={selectedWeek === week ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWeek(week)}
              >
                {week === 0 ? "This Week" : week === 1 ? "Last Week" : `${week + 1}w ago`}
              </Button>
            ))}
          </div>
        </CardTitle>
        <div className="flex items-center text-sm text-neutral-600">
          <Calendar className="mr-1 h-4 w-4" />
          {format(startOfWeek(weekDate), 'MMM d')} - {format(endOfWeek(weekDate), 'MMM d, yyyy')}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!stats ? (
          <div className="text-center py-8 text-neutral-500">
            <Brain className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
            <p>No entries found for {weekLabel.toLowerCase()}</p>
            <p className="text-sm">Start journaling to see your weekly insights!</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
                <div className="text-xs text-blue-700">Entries</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.averageLength}</div>
                <div className="text-xs text-green-700">Avg Length</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg col-span-2 sm:col-span-1">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.moodDistribution).length}</div>
                <div className="text-xs text-purple-700">Mood Types</div>
              </div>
            </div>

            {/* Mood Distribution */}
            {Object.keys(stats.moodDistribution).length > 0 && (
              <div>
                <h3 className="font-medium text-neutral-800 mb-3 flex items-center">
                  <Heart className="mr-2 h-4 w-4 text-red-500" />
                  💕 Mood Overview
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.moodDistribution).map(([mood, count]) => (
                    <Badge key={mood} variant="outline" className="px-3 py-1">
                      {mood} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Top Themes */}
            {stats.topWords.length > 0 && (
              <div>
                <h3 className="font-medium text-neutral-800 mb-3 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                  🔍 Key Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats.topWords.map(({ word, count }) => (
                    <Badge key={word} variant="secondary" className="px-3 py-1">
                      {word} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Patterns */}
            {stats.patterns.length > 0 && (
              <div>
                <h3 className="font-medium text-neutral-800 mb-3 flex items-center">
                  <Brain className="mr-2 h-4 w-4 text-green-500" />
                  🧠 Patterns Detected
                </h3>
                <ul className="space-y-2">
                  {stats.patterns.map((pattern, index) => (
                    <li key={index} className="text-sm text-neutral-600 flex items-start">
                      <Star className="mr-2 h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-3 flex items-center">
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                💡 Insights & Reflections
              </h3>
              <ul className="space-y-2">
                {stats.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-neutral-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}