import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Heart, Battery, Users, Shield } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import type { JournalEntry } from "@shared/schema";

type TimeRange = "week" | "month" | "3months";

interface ParentAnalyticsStats {
  totalCheckIns: number;
  averagesByCategory: {
    energyLevel: { average: string; trend: string };
    patienceLevel: { average: string; trend: string };
    parentChildConnection: { average: string; trend: string };
    parentingConfidence: { average: string; trend: string };
    parentSelfCare: { average: string; trend: string };
    supportSystemContact: { average: string; trend: string };
    argumentsOrTension: { average: string; trend: string };
    emotionalRegulation: { average: string; trend: string };
    disciplineStyle: { mostUsed: string; variety: number };
    winsOfTheDay: { mostCommon: string; frequency: number };
  };
  insights: string[];
}

const categoryConfig = {
  energyLevel: {
    title: 'Energy Level',
    icon: Battery,
    color: 'text-orange-600',
    values: ['low', 'tired', 'average', 'energized', 'overstimulated']
  },
  patienceLevel: {
    title: 'Patience Level',
    icon: Heart,
    color: 'text-pink-600',
    values: ['explosive', 'snappy', 'irritable', 'patient', 'very_patient']
  },
  parentChildConnection: {
    title: 'Parent-Child Connection',
    icon: Users,
    color: 'text-blue-600',
    values: ['avoided_each_other', 'felt_distant', 'lots_of_conflict', 'felt_close', 'warm_and_connected']
  },
  parentingConfidence: {
    title: 'Parenting Confidence',
    icon: Shield,
    color: 'text-green-600',
    values: ['overwhelmed', 'unsure', 'low', 'ok', 'high']
  },
  parentSelfCare: {
    title: 'Self-Care',
    icon: Heart,
    color: 'text-purple-600',
    values: ['burned_out', 'did_nothing', 'ate_well', 'moved_body', 'took_time_for_self']
  }
};

export function ParentAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const getAnalyticsStats = (): ParentAnalyticsStats | null => {
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

    // Filter entries with daily check-in data
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= startDate && entryDate <= endDate && entry.dailyCheckIn;
    });

    if (filteredEntries.length === 0) return null;

    // Calculate averages and trends for each category
    const averagesByCategory: any = {};
    
    Object.keys(categoryConfig).forEach(category => {
      const categoryData = filteredEntries
        .map(entry => entry.dailyCheckIn?.[category])
        .filter(Boolean);
      
      if (categoryData.length > 0) {
        // Calculate most common value
        const counts: { [key: string]: number } = {};
        categoryData.forEach(value => {
          counts[value] = (counts[value] || 0) + 1;
        });
        
        const mostCommon = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || "";

        // Simple trend calculation (comparing first half vs second half)
        const midPoint = Math.floor(categoryData.length / 2);
        const firstHalf = categoryData.slice(0, midPoint);
        const secondHalf = categoryData.slice(midPoint);
        
        const getAvgScore = (values: string[]) => {
          const categoryValues = categoryConfig[category as keyof typeof categoryConfig]?.values || [];
          return values.reduce((sum, val) => sum + categoryValues.indexOf(val), 0) / values.length;
        };
        
        const firstAvg = firstHalf.length > 0 ? getAvgScore(firstHalf) : 0;
        const secondAvg = secondHalf.length > 0 ? getAvgScore(secondHalf) : 0;
        
        let trend = "stable";
        if (secondAvg > firstAvg + 0.5) trend = "improving";
        else if (secondAvg < firstAvg - 0.5) trend = "declining";

        averagesByCategory[category] = {
          average: mostCommon,
          trend
        };
      }
    });

    // Special handling for discipline style and wins
    const disciplineData = filteredEntries
      .map(entry => entry.dailyCheckIn?.disciplineStyle)
      .filter(Boolean);
    
    const disciplineCounts: { [key: string]: number } = {};
    disciplineData.forEach(style => {
      disciplineCounts[style] = (disciplineCounts[style] || 0) + 1;
    });
    
    const mostUsedDiscipline = Object.entries(disciplineCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    const winsData = filteredEntries
      .map(entry => entry.dailyCheckIn?.winsOfTheDay)
      .filter(Boolean);
    
    const winsCounts: { [key: string]: number } = {};
    winsData.forEach(win => {
      winsCounts[win] = (winsCounts[win] || 0) + 1;
    });
    
    const mostCommonWin = Object.entries(winsCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    averagesByCategory.disciplineStyle = {
      mostUsed: mostUsedDiscipline,
      variety: Object.keys(disciplineCounts).length
    };

    averagesByCategory.winsOfTheDay = {
      mostCommon: mostCommonWin,
      frequency: Math.round((winsCounts[mostCommonWin] || 0) / filteredEntries.length * 100)
    };

    // Generate insights
    const insights = [];
    
    if (averagesByCategory.patienceLevel?.trend === "improving") {
      insights.push("Your patience levels have been improving over time - great progress!");
    }
    
    if (averagesByCategory.parentChildConnection?.average === "warm_and_connected") {
      insights.push("You're maintaining strong connections with your child consistently.");
    }
    
    if (averagesByCategory.parentSelfCare?.average === "burned_out") {
      insights.push("Consider prioritizing self-care to support your overall well-being.");
    }

    if (averagesByCategory.disciplineStyle?.variety >= 3) {
      insights.push("You're using a variety of discipline approaches - flexibility is a strength!");
    }

    return {
      totalCheckIns: filteredEntries.length,
      averagesByCategory,
      insights
    };
  };

  const stats = getAnalyticsStats();

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "week": return "This Week";
      case "month": return "This Month";
      case "3months": return "Last 3 Months";
      default: return "This Month";
    }
  };

  const formatValue = (value: string) => {
    return value.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return "📈";
      case "declining": return "📉";
      default: return "➡️";
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <div className="text-center py-8 text-neutral-500">
            Loading parent analytics...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <div className="text-center py-8 space-y-3">
            <div className="text-neutral-600">
              No daily check-in data available for {getTimeRangeLabel().toLowerCase()}
            </div>
            <p className="text-sm text-neutral-500">
              Complete daily check-ins to see your parenting analytics and insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-semibold text-neutral-800">
            <BarChart3 className="text-primary mr-2 h-5 w-5" />
            ✨ Parent Analytics
          </CardTitle>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCheckIns}</div>
            <div className="text-sm text-blue-700">Check-ins Completed</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.averagesByCategory.winsOfTheDay?.frequency || 0}%
            </div>
            <div className="text-sm text-green-700">Days with Wins</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.averagesByCategory.disciplineStyle?.variety || 0}
            </div>
            <div className="text-sm text-purple-700">Discipline Approaches Used</div>
          </div>
        </div>

        {/* Category Analytics */}
        <div className="space-y-4">
          <h4 className="font-medium text-neutral-800">Category Insights</h4>
          <div className="grid gap-4">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const data = stats.averagesByCategory[key as keyof typeof stats.averagesByCategory];
              if (!data) return null;

              const Icon = config.icon;
              
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <span className="font-medium text-neutral-800">{config.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-neutral-600">
                      {formatValue(data.average)}
                    </span>
                    <span>{getTrendIcon(data.trend)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Used Discipline */}
        {stats.averagesByCategory.disciplineStyle?.mostUsed && (
          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Primary Discipline Style</h4>
            <div className="text-amber-700">
              {formatValue(stats.averagesByCategory.disciplineStyle.mostUsed)} 
              <span className="text-sm text-amber-600 ml-2">
                ({stats.averagesByCategory.disciplineStyle.variety} different approaches used)
              </span>
            </div>
          </div>
        )}

        {/* Most Common Win */}
        {stats.averagesByCategory.winsOfTheDay?.mostCommon && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Most Common Win</h4>
            <div className="text-green-700">
              {formatValue(stats.averagesByCategory.winsOfTheDay.mostCommon)}
              <span className="text-sm text-green-600 ml-2">
                ({stats.averagesByCategory.winsOfTheDay.frequency}% of days)
              </span>
            </div>
          </div>
        )}

        {/* Insights */}
        {stats.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-neutral-800">Insights for You</h4>
            <div className="space-y-2">
              {stats.insights.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}