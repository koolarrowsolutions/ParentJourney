import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Heart, Calendar, BarChart3, Smile, TrendingDown } from "lucide-react";
import type { JournalEntry, ChildProfile } from "@shared/schema";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodTrendsDashboardProps {
  selectedChildId?: string;
  onChildChange?: (childId: string) => void;
}

// Mood scoring system for trend visualization
const MOOD_SCORES = {
  joyful: 10,
  hopeful: 8,
  content: 7,
  neutral: 5,
  tired: 4,
  stressed: 3,
  frustrated: 2,
  overwhelmed: 1,
  sad: 1,
  anxious: 2,
};

// Mood colors for visualization
const MOOD_COLORS = {
  joyful: { bg: "rgba(34, 197, 94, 0.8)", border: "rgb(34, 197, 94)" },
  hopeful: { bg: "rgba(59, 130, 246, 0.8)", border: "rgb(59, 130, 246)" },
  content: { bg: "rgba(16, 185, 129, 0.8)", border: "rgb(16, 185, 129)" },
  neutral: { bg: "rgba(107, 114, 128, 0.8)", border: "rgb(107, 114, 128)" },
  tired: { bg: "rgba(156, 163, 175, 0.8)", border: "rgb(156, 163, 175)" },
  stressed: { bg: "rgba(245, 101, 101, 0.8)", border: "rgb(245, 101, 101)" },
  frustrated: { bg: "rgba(239, 68, 68, 0.8)", border: "rgb(239, 68, 68)" },
  overwhelmed: { bg: "rgba(220, 38, 127, 0.8)", border: "rgb(220, 38, 127)" },
  sad: { bg: "rgba(168, 85, 247, 0.8)", border: "rgb(168, 85, 247)" },
  anxious: { bg: "rgba(251, 146, 60, 0.8)", border: "rgb(251, 146, 60)" },
};

export function MoodTrendsDashboard({ selectedChildId, onChildChange }: MoodTrendsDashboardProps) {
  const [timeRange, setTimeRange] = useState("30"); // days

  // Fetch journal entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    select: (data) => data || [],
  });

  // Fetch child profiles for filtering
  const { data: childProfiles = [] } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    select: (data) => data || [],
  });

  // Process mood data
  const moodData = useMemo(() => {
    const now = new Date();
    const daysBack = parseInt(timeRange);
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    // Filter entries by date range, selected child, and those with AI-analyzed mood
    const filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      const isInRange = entryDate >= startDate && entryDate <= now;
      const matchesChild = !selectedChildId || selectedChildId === "all" || entry.childProfileId === selectedChildId;
      return isInRange && matchesChild && entry.aiAnalyzedMood;
    });

    // Group entries by date
    const entriesByDate: Record<string, JournalEntry[]> = {};
    filteredEntries.forEach((entry) => {
      const dateKey = new Date(entry.createdAt).toISOString().split('T')[0];
      if (!entriesByDate[dateKey]) {
        entriesByDate[dateKey] = [];
      }
      entriesByDate[dateKey].push(entry);
    });

    // Calculate daily mood averages
    const dailyMoodData: Array<{ date: string; score: number; mood: string; count: number }> = [];
    Object.entries(entriesByDate).forEach(([date, dayEntries]) => {
      const moodScores = dayEntries
        .filter(entry => entry.aiAnalyzedMood && MOOD_SCORES[entry.aiAnalyzedMood as keyof typeof MOOD_SCORES])
        .map(entry => MOOD_SCORES[entry.aiAnalyzedMood as keyof typeof MOOD_SCORES]);
      
      if (moodScores.length > 0) {
        const avgScore = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
        const dominantMood = dayEntries[0].aiAnalyzedMood || "neutral";
        dailyMoodData.push({
          date,
          score: Math.round(avgScore * 10) / 10,
          mood: dominantMood,
          count: dayEntries.length,
        });
      }
    });

    // Sort by date
    dailyMoodData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate mood frequency
    const moodCounts: Record<string, number> = {};
    filteredEntries.forEach((entry) => {
      if (entry.aiAnalyzedMood) {
        moodCounts[entry.aiAnalyzedMood] = (moodCounts[entry.aiAnalyzedMood] || 0) + 1;
      }
    });

    // Calculate trend direction
    const recentMoods = dailyMoodData.slice(-7); // Last week
    const earlierMoods = dailyMoodData.slice(-14, -7); // Week before
    
    const recentAvg = recentMoods.length > 0 
      ? recentMoods.reduce((sum, day) => sum + day.score, 0) / recentMoods.length 
      : 0;
    const earlierAvg = earlierMoods.length > 0 
      ? earlierMoods.reduce((sum, day) => sum + day.score, 0) / earlierMoods.length 
      : 0;
    
    const trendDirection = recentAvg > earlierAvg ? "up" : recentAvg < earlierAvg ? "down" : "stable";
    const trendChange = Math.abs(recentAvg - earlierAvg);

    // Most frequent mood
    const mostFrequentMood = Object.entries(moodCounts).reduce(
      (max, [mood, count]) => (count > max.count ? { mood, count } : max),
      { mood: "", count: 0 }
    );

    return {
      dailyMoodData,
      moodCounts,
      totalEntries: filteredEntries.length,
      mostFrequentMood,
      trendDirection,
      trendChange: Math.round(trendChange * 10) / 10,
      averageScore: dailyMoodData.length > 0 
        ? Math.round((dailyMoodData.reduce((sum, day) => sum + day.score, 0) / dailyMoodData.length) * 10) / 10 
        : 0,
    };
  }, [entries, selectedChildId, timeRange]);

  // Prepare chart data for line chart (mood trends over time)
  const lineChartData = {
    labels: moodData.dailyMoodData.map(day => 
      new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: "Mood Score",
        data: moodData.dailyMoodData.map(day => day.score),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: moodData.dailyMoodData.map(day => 
          MOOD_COLORS[day.mood as keyof typeof MOOD_COLORS]?.border || "rgb(107, 114, 128)"
        ),
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  // Prepare chart data for bar chart (mood distribution)
  const barChartData = {
    labels: Object.keys(moodData.moodCounts).map(mood => 
      mood.charAt(0).toUpperCase() + mood.slice(1)
    ),
    datasets: [
      {
        label: "Frequency",
        data: Object.values(moodData.moodCounts),
        backgroundColor: Object.keys(moodData.moodCounts).map(mood => 
          MOOD_COLORS[mood as keyof typeof MOOD_COLORS]?.bg || "rgba(107, 114, 128, 0.8)"
        ),
        borderColor: Object.keys(moodData.moodCounts).map(mood => 
          MOOD_COLORS[mood as keyof typeof MOOD_COLORS]?.border || "rgb(107, 114, 128)"
        ),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const day = moodData.dailyMoodData[context.dataIndex];
            return [
              `Mood Score: ${context.parsed.y}`,
              `Dominant Mood: ${day?.mood || 'Unknown'}`,
              `Entries: ${day?.count || 0}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const labels = ['', 'Very Low', '', 'Low', '', 'Neutral', '', 'Good', '', 'Great', 'Excellent'];
            return labels[value] || value;
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  if (entriesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-neutral-500">Loading mood trends...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800 flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" />
            Mood Trends
          </h2>
          <p className="text-neutral-600 text-sm">AI-powered analysis of your emotional patterns</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Filter */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">2 weeks</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">3 months</SelectItem>
            </SelectContent>
          </Select>

          {/* Child Filter */}
          {childProfiles.length > 0 && (
            <Select value={selectedChildId || "all"} onValueChange={onChildChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {childProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Entries Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800">{moodData.totalEntries}</div>
            <p className="text-xs text-neutral-500">past {timeRange} days</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              Average Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800">{moodData.averageScore}/10</div>
            <p className="text-xs text-neutral-500">overall well-being</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
              <Smile className="mr-2 h-4 w-4" />
              Most Common
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800 capitalize">
              {moodData.mostFrequentMood.mood || "None"}
            </div>
            <p className="text-xs text-neutral-500">
              {moodData.mostFrequentMood.count} times
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
              {moodData.trendDirection === "up" ? (
                <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
              ) : moodData.trendDirection === "down" ? (
                <TrendingDown className="mr-2 h-4 w-4 text-red-600" />
              ) : (
                <Calendar className="mr-2 h-4 w-4 text-blue-600" />
              )}
              Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              moodData.trendDirection === "up" ? "text-green-600" : 
              moodData.trendDirection === "down" ? "text-red-600" : 
              "text-blue-600"
            }`}>
              {moodData.trendDirection === "up" ? "↗" : moodData.trendDirection === "down" ? "↘" : "→"}
            </div>
            <p className="text-xs text-neutral-500 capitalize">{moodData.trendDirection}</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Message */}
      {moodData.mostFrequentMood.mood && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Badge 
                  className="text-xs capitalize"
                  style={{
                    backgroundColor: MOOD_COLORS[moodData.mostFrequentMood.mood as keyof typeof MOOD_COLORS]?.bg,
                    color: MOOD_COLORS[moodData.mostFrequentMood.mood as keyof typeof MOOD_COLORS]?.border,
                    border: `1px solid ${MOOD_COLORS[moodData.mostFrequentMood.mood as keyof typeof MOOD_COLORS]?.border}`,
                  }}
                >
                  {moodData.mostFrequentMood.mood}
                </Badge>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  <strong>Mood Insight:</strong> Over the past {timeRange} days, you've most frequently felt{" "}
                  <strong>{moodData.mostFrequentMood.mood}</strong> ({moodData.mostFrequentMood.count} times).
                  {moodData.trendDirection === "up" && " Your mood trend is improving! "}
                  {moodData.trendDirection === "down" && " Consider extra self-care during this time. "}
                  {moodData.mostFrequentMood.mood === "joyful" && "Keep celebrating those wonderful parenting moments!"}
                  {moodData.mostFrequentMood.mood === "overwhelmed" && "Remember that feeling overwhelmed is part of the parenting journey."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {moodData.totalEntries > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Mood Trends Over Time */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Mood Timeline
              </CardTitle>
              <CardDescription>
                Daily mood patterns over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Mood Distribution */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Mood Distribution
              </CardTitle>
              <CardDescription>
                Frequency of different moods detected by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={barChartData} options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      max: Math.max(...Object.values(moodData.moodCounts)) + 1,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }} />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">No Mood Data Yet</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              Start journaling to see AI-powered mood analysis and trends. Your emotional patterns will appear here as you share your parenting experiences.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}