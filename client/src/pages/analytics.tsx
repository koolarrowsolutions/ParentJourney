import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WeeklyReflection } from "@/components/weekly-reflection";
import { MoodAnalytics } from "@/components/mood-analytics";
import { AdvancedSearch } from "@/components/advanced-search";
import { EmotionTrendsDashboard } from "@/components/emotion-trends-dashboard";
import { MoodTrendsDashboard } from "@/components/mood-trends-dashboard";
import { useState, useMemo } from "react";
import { JournalEntry } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { GamifiedWellnessDashboard } from "@/components/gamified-wellness-dashboard";
import { DailyCheckIn, type DailyCheckInData } from "@/components/daily-checkin";
// Temporarily remove JournalEntryCard import until it's properly implemented
// import { JournalEntryCard } from "@/components/journal-entry-card";

interface AnalyticsProps {
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

interface JournalStats {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
}

export default function Analytics({ triggerSignUpPrompt }: AnalyticsProps) {
  const [searchResults, setSearchResults] = useState<JournalEntry[] | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [showCheckIn, setShowCheckIn] = useState(false);

  const { data: stats } = useQuery<JournalStats>({
    queryKey: ["/api/journal-stats"],
    queryFn: async () => {
      const response = await fetch("/api/journal-stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  // Fetch journal entries to calculate real wellness stats
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    select: (data) => data || [],
  });

  // Calculate real wellness stats from journal entries
  const wellnessStats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Count entries this week
    const weeklyCheckIns = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= weekStart;
    }).length;

    // Calculate current streak (consecutive days with entries)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate wellness score based on mood data
    const moodScores = {
      'joyful': 10, 'hopeful': 8, 'content': 7, 'neutral': 5,
      'tired': 4, 'stressed': 3, 'frustrated': 2, 'overwhelmed': 1,
      'sad': 2, 'anxious': 3
    };

    const recentMoods = entries
      .filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= weekStart && (entry.aiAnalyzedMood || entry.mood);
      })
      .map(entry => moodScores[entry.aiAnalyzedMood || entry.mood] || 5);

    const averageMoodScore = recentMoods.length > 0 
      ? recentMoods.reduce((sum, score) => sum + score, 0) / recentMoods.length 
      : 5;

    const wellnessScore = Math.round((averageMoodScore / 10) * 100);

    return {
      weeklyCheckIns,
      currentStreak,
      totalEntries: entries.length,
      wellnessScore
    };
  }, [entries]);

  const handleSearchResults = (results: JournalEntry[]) => {
    setSearchResults(results);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
  };

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
  };

  const handleStartCheckIn = () => {
    setShowCheckIn(true);
  };

  const handleCheckInComplete = async (data: DailyCheckInData) => {
    try {
      const response = await fetch('/api/daily-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.reload(); // Refresh to show new data
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
    
    setShowCheckIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-75 animate-fade-in">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <Link href="/">
              <Button variant="outline" className="hover-scale">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main
              </Button>
            </Link>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold text-neutral-800">📊 Analytics & Insights</h1>
            <p className="text-neutral-600">Discover patterns and insights from your parenting journey</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Advanced Search */}
          <AdvancedSearch onResults={handleSearchResults} onClear={handleClearSearch} />

          {/* Search Results */}
          {searchResults && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-800">
                🔍 Search Results ({searchResults.length} entries found)
              </h2>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>No entries match your search criteria.</p>
                  <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {searchResults.map((entry) => (
                    <div key={entry.id} className="p-4 bg-white rounded-lg border border-neutral-200">
                      <h3 className="font-medium text-neutral-800">{entry.title || "Untitled Entry"}</h3>
                      <p className="text-sm text-neutral-600 mt-2">{entry.content.substring(0, 150)}...</p>
                      <div className="flex items-center gap-2 mt-3">
                        {entry.mood && <span className="text-sm">{entry.mood}</span>}
                        <span className="text-xs text-neutral-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Content */}
          {!searchResults && (
            <div className="space-y-8">
              {/* Gamified Wellness Dashboard */}
              <div className="animate-pop-fade" style={{ animationDelay: '0.05s' }}>
                <GamifiedWellnessDashboard 
                  stats={wellnessStats}
                  onStartCheckIn={handleStartCheckIn}
                />
              </div>

              {/* AI Mood Trends Dashboard */}
              <div className="animate-pop-fade" style={{ animationDelay: '0.1s' }}>
                <MoodTrendsDashboard 
                  selectedChildId={selectedChildId}
                  onChildChange={handleChildChange}
                />
              </div>

              {/* Emotion Trends Dashboard */}
              <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <EmotionTrendsDashboard 
                  selectedChildId={selectedChildId}
                  onChildChange={handleChildChange}
                />
              </div>

              {/* Mood Analytics */}
              <div className="animate-pop-fade" style={{ animationDelay: '0.3s' }}>
                <MoodAnalytics />
              </div>

              {/* Weekly Reflection */}
              <div className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                <WeeklyReflection />
              </div>
            </div>
          )}
        </div>

        {/* Daily Check-In Modal */}
        {showCheckIn && (
          <DailyCheckIn
            onComplete={handleCheckInComplete}
            onCancel={() => setShowCheckIn(false)}
          />
        )}
      </div>
    </div>
  );
}