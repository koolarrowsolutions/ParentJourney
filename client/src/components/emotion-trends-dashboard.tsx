import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Heart, Calendar, BarChart3, Smile } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
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

interface EmotionTrendsDashboardProps {
  selectedChildId?: string;
  onChildChange?: (childId: string) => void;
}

// Emotion color mapping for consistency
const EMOTION_COLORS = {
  Happy: { bg: "rgba(34, 197, 94, 0.6)", border: "rgb(34, 197, 94)" }, // green
  Calm: { bg: "rgba(59, 130, 246, 0.6)", border: "rgb(59, 130, 246)" }, // blue
  Frustrated: { bg: "rgba(239, 68, 68, 0.6)", border: "rgb(239, 68, 68)" }, // red
  Guilty: { bg: "rgba(168, 85, 247, 0.6)", border: "rgb(168, 85, 247)" }, // purple
  Overwhelmed: { bg: "rgba(245, 101, 101, 0.6)", border: "rgb(245, 101, 101)" }, // red-orange
  Proud: { bg: "rgba(251, 191, 36, 0.6)", border: "rgb(251, 191, 36)" }, // yellow
  Tired: { bg: "rgba(107, 114, 128, 0.6)", border: "rgb(107, 114, 128)" }, // gray
  Grateful: { bg: "rgba(236, 72, 153, 0.6)", border: "rgb(236, 72, 153)" }, // pink
};

const DEFAULT_EMOTIONS = ["Happy", "Calm", "Frustrated", "Guilty", "Overwhelmed", "Proud", "Tired", "Grateful"];

export function EmotionTrendsDashboard({ selectedChildId, onChildChange }: EmotionTrendsDashboardProps) {
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

  // Process emotion data for the past 7 days
  const emotionData = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago + today = 7 days
    
    // Filter entries by date range and selected child
    const filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      const isInRange = entryDate >= sevenDaysAgo && entryDate <= now;
      const matchesChild = !selectedChildId || selectedChildId === "all" || entry.childProfileId === selectedChildId;
      return isInRange && matchesChild && entry.emotionTags && entry.emotionTags.length > 0;
    });

    // Generate last 7 days labels
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        shortLabel: date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
      };
    });

    // Count emotions by date
    const emotionsByDate: Record<string, Record<string, number>> = {};
    const totalEmotionCounts: Record<string, number> = {};

    // Initialize data structure
    last7Days.forEach(({ date }) => {
      emotionsByDate[date] = {};
      DEFAULT_EMOTIONS.forEach((emotion) => {
        emotionsByDate[date][emotion] = 0;
      });
    });

    // Count emotions
    filteredEntries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
      if (emotionsByDate[entryDate] && entry.emotionTags) {
        entry.emotionTags.forEach((emotion) => {
          if (DEFAULT_EMOTIONS.includes(emotion)) {
            emotionsByDate[entryDate][emotion]++;
            totalEmotionCounts[emotion] = (totalEmotionCounts[emotion] || 0) + 1;
          }
        });
      }
    });

    // Find most frequent emotion
    const mostFrequentEmotion = Object.entries(totalEmotionCounts).reduce(
      (max, [emotion, count]) => (count > max.count ? { emotion, count } : max),
      { emotion: "", count: 0 }
    );

    return {
      last7Days,
      emotionsByDate,
      totalEmotionCounts,
      mostFrequentEmotion,
      totalEntries: filteredEntries.length,
    };
  }, [entries, selectedChildId]);

  // Prepare chart data for line chart (emotions over time)
  const lineChartData = {
    labels: emotionData.last7Days.map(({ shortLabel }) => shortLabel),
    datasets: DEFAULT_EMOTIONS.map((emotion) => ({
      label: emotion,
      data: emotionData.last7Days.map(({ date }) => emotionData.emotionsByDate[date][emotion]),
      borderColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]?.border || "rgba(156, 163, 175, 1)",
      backgroundColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]?.bg || "rgba(156, 163, 175, 0.2)",
      tension: 0.4,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  // Prepare chart data for bar chart (emotion frequency)
  const barChartData = {
    labels: DEFAULT_EMOTIONS,
    datasets: [
      {
        label: "Times Reported",
        data: DEFAULT_EMOTIONS.map((emotion) => emotionData.totalEmotionCounts[emotion] || 0),
        backgroundColor: DEFAULT_EMOTIONS.map(
          (emotion) => EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]?.bg || "rgba(156, 163, 175, 0.6)"
        ),
        borderColor: DEFAULT_EMOTIONS.map(
          (emotion) => EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]?.border || "rgba(156, 163, 175, 1)"
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
        position: "top" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
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
          <div className="text-neutral-500">Loading emotion trends...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800 flex items-center">
            <Heart className="mr-2 h-6 w-6 text-primary" />
            Emotion Trends
          </h2>
          <p className="text-neutral-600 text-sm">Track your emotional patterns over the past 7 days</p>
        </div>
        
        {childProfiles.length > 0 && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
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
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800">{emotionData.totalEntries}</div>
            <p className="text-xs text-neutral-500">past 7 days</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Most Frequent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800">
              {emotionData.mostFrequentEmotion.emotion || "None"}
            </div>
            <p className="text-xs text-neutral-500">
              {emotionData.mostFrequentEmotion.count} times
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
              <Smile className="mr-2 h-4 w-4" />
              Unique Emotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800">
              {Object.keys(emotionData.totalEmotionCounts).filter(emotion => emotionData.totalEmotionCounts[emotion] > 0).length}
            </div>
            <p className="text-xs text-neutral-500">different feelings</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Message */}
      {emotionData.mostFrequentEmotion.emotion && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Badge 
                  className="text-xs"
                  style={{
                    backgroundColor: EMOTION_COLORS[emotionData.mostFrequentEmotion.emotion as keyof typeof EMOTION_COLORS]?.bg,
                    color: EMOTION_COLORS[emotionData.mostFrequentEmotion.emotion as keyof typeof EMOTION_COLORS]?.border,
                    border: `1px solid ${EMOTION_COLORS[emotionData.mostFrequentEmotion.emotion as keyof typeof EMOTION_COLORS]?.border}`,
                  }}
                >
                  {emotionData.mostFrequentEmotion.emotion}
                </Badge>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  <strong>Weekly Insight:</strong> You've reported feeling most{" "}
                  <strong>{emotionData.mostFrequentEmotion.emotion.toLowerCase()}</strong> this week ({emotionData.mostFrequentEmotion.count} times).
                  {emotionData.mostFrequentEmotion.emotion === "Happy" && " Keep nurturing the moments that bring you joy!"}
                  {emotionData.mostFrequentEmotion.emotion === "Grateful" && " Your gratitude practice is showing beautiful results."}
                  {emotionData.mostFrequentEmotion.emotion === "Overwhelmed" && " Remember to take breaks and be gentle with yourself."}
                  {emotionData.mostFrequentEmotion.emotion === "Frustrated" && " It's natural to feel this way - you're navigating challenges with strength."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {emotionData.totalEntries > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Emotions Over Time */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Daily Emotion Patterns
              </CardTitle>
              <CardDescription>
                How your emotions have fluctuated over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Emotion Frequency */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Emotion Frequency
              </CardTitle>
              <CardDescription>
                Total count of each emotion over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">No Emotion Data Yet</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              Start journaling with emotion tags to see your emotional patterns and trends over time.
              Your insights will appear here as you share your parenting journey.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}