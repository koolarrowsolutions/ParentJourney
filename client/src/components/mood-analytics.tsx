import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Heart, Calendar, Target } from "lucide-react";

interface MoodAnalytics {
  moodDistribution: { mood: string; count: number; percentage: number }[];
  moodTrends: { date: string; mood: string; count: number }[];
  weeklyMoodAverage: number;
  moodStreak: { currentMood: string | null; streakDays: number };
}

const MOOD_COLORS = {
  '😊': '#10B981', // green
  '😄': '#F59E0B', // yellow
  '🥰': '#EC4899', // pink
  '😌': '#3B82F6', // blue
  '🤗': '#8B5CF6', // purple
  '😔': '#6B7280', // gray
  '😰': '#EF4444', // red
  '😤': '#F97316', // orange
};

export function MoodAnalytics() {
  const { data: analytics, isLoading } = useQuery<MoodAnalytics>({
    queryKey: ["/api/mood-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/mood-analytics");
      if (!response.ok) throw new Error("Failed to fetch mood analytics");
      return response.json();
    },
  });

  const getMoodColor = (mood: string) => MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || '#6B7280';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-sm border border-neutral-200">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics || analytics.moodDistribution.length === 0) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6 text-center">
          <Heart className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
          <p className="text-neutral-500">📊 No mood data available yet.</p>
          <p className="text-sm text-neutral-400 mt-2">
            ✨ Start tracking your moods by selecting emojis when creating journal entries! ✨
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const distributionData = analytics.moodDistribution.map(item => ({
    ...item,
    fill: getMoodColor(item.mood),
  }));

  // Group mood trends by date for line chart
  const trendData = analytics.moodTrends.reduce((acc, item) => {
    const existingDate = acc.find(d => d.date === item.date);
    if (existingDate) {
      existingDate[item.mood] = item.count;
    } else {
      acc.push({
        date: item.date,
        [item.mood]: item.count,
      });
    }
    return acc;
  }, [] as any[]);

  // Sort trend data by date
  trendData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getMoodLevel = (average: number) => {
    if (average >= 80) return { label: "Excellent", color: "bg-green-500" };
    if (average >= 60) return { label: "Good", color: "bg-blue-500" };
    if (average >= 40) return { label: "Okay", color: "bg-yellow-500" };
    return { label: "Needs attention", color: "bg-red-500" };
  };

  const moodLevel = getMoodLevel(analytics.weeklyMoodAverage);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Weekly Mood</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {analytics.weeklyMoodAverage}%
                </p>
                <Badge variant="secondary" className={`${moodLevel.color} text-white text-xs`}>
                  {moodLevel.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Heart className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Current Streak</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {analytics.moodStreak.currentMood || "—"}
                </p>
                <p className="text-xs text-neutral-400">
                  {analytics.moodStreak.streakDays} {analytics.moodStreak.streakDays === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total Moods</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {analytics.moodDistribution.reduce((sum, item) => sum + item.count, 0)}
                </p>
                <p className="text-xs text-neutral-400">entries tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Mood Distribution */}
        <Card className="shadow-sm border border-neutral-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-800 flex items-center">
              📊 Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distributionData.map((item) => (
                <div key={item.mood} className="flex items-center space-x-3">
                  <span className="text-2xl">{item.mood}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">{item.count} entries</span>
                      <span className="text-neutral-500">{item.percentage}%</span>
                    </div>
                    <Progress 
                      value={item.percentage} 
                      className="h-2"
                      style={{ 
                        '--progress-foreground': getMoodColor(item.mood) 
                      } as any}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-sm border border-neutral-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-800 flex items-center">
              🥧 Mood Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                  label={({ mood, percentage }) => `${mood} ${percentage}%`}
                  labelLine={false}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value} entries (${props.payload.percentage}%)`,
                    props.payload.mood
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Mood Trends */}
      {trendData.length > 0 && (
        <Card className="shadow-sm border border-neutral-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-800 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              📈 Mood Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).getMonth() + 1 + '/' + new Date(date).getDate()}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number, name: string) => [`${value} entries`, name]}
                />
                {Array.from(new Set(analytics.moodTrends.map(item => item.mood))).map((mood) => (
                  <Bar 
                    key={mood}
                    dataKey={mood}
                    stackId="mood"
                    fill={getMoodColor(mood)}
                    name={mood}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}