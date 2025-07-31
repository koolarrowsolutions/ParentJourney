import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { JournalForm } from "@/components/journal-form";
import { RecentEntries } from "@/components/recent-entries";
import { Sidebar } from "@/components/sidebar";
import { QuickTemplates } from "@/components/quick-templates";
import { InteractiveProgress } from "@/components/interactive-progress";

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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-primary/20 shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-neutral-800 mb-2">
              Welcome back to your parenting journey
            </h2>
            <p className="text-neutral-600 mb-4">How has your day been?</p>
            {isLoading ? (
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-16 rounded-lg animate-shimmer" />
                <Skeleton className="h-16 rounded-lg animate-shimmer" />
                <Skeleton className="h-16 rounded-lg animate-shimmer" />
              </div>
            ) : (
              <InteractiveProgress 
                totalEntries={stats?.totalEntries || 0}
                weekEntries={stats?.weekEntries || 0}
                longestStreak={stats?.longestStreak || 0}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm animate-fade-in stagger-1">
              <JournalForm />
            </div>
            
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 hover-lift animate-fade-in stagger-2">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Entries</h3>
              <RecentEntries />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm animate-slide-in-right stagger-3">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
