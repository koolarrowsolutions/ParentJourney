import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { JournalForm } from "@/components/journal-form";
import { RecentEntries } from "@/components/recent-entries";
import { Sidebar } from "@/components/sidebar";

interface JournalStats {
  totalEntries: number;
  weekEntries: number;
  longestStreak: number;
}

export default function Home() {
  const { data: stats, isLoading } = useQuery<JournalStats>({
    queryKey: ["/api/journal-stats"],
    queryFn: async () => {
      const response = await fetch("/api/journal-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-primary rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-neutral-800 mb-2">
              🌟 Welcome back to your parenting journey!
            </h2>
            <p className="text-neutral-600 mb-4">💕 How has your parenting journey been today?</p>
            <div className="flex flex-wrap gap-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-32 rounded-lg" />
                  <Skeleton className="h-16 w-32 rounded-lg" />
                  <Skeleton className="h-16 w-32 rounded-lg" />
                </>
              ) : (
                <>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                    <span className="text-sm text-neutral-500">Total Entries</span>
                    <div className="text-lg font-semibold text-neutral-800">
                      {stats?.totalEntries || 0}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                    <span className="text-sm text-neutral-500">This Week</span>
                    <div className="text-lg font-semibold text-neutral-800">
                      {stats?.weekEntries || 0}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                    <span className="text-sm text-neutral-500">Longest Streak</span>
                    <div className="text-lg font-semibold text-neutral-800">
                      {stats?.longestStreak || 0} {stats?.longestStreak === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <JournalForm />
            <RecentEntries />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
