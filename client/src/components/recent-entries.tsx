import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, ArrowRight, Bot, PenTool, Baby, GraduationCap } from "lucide-react";
import type { JournalEntry, ChildProfile } from "@shared/schema";

export function RecentEntries() {
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    queryFn: async () => {
      const response = await fetch("/api/journal-entries?limit=5");
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-neutral-800 flex items-center">
            <History className="text-primary mr-2 h-5 w-5" />
            📖 Recent Entries
          </h3>
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))
          ) : entries && entries.length > 0 ? (
            entries.map((entry) => (
              <div 
                key={entry.id} 
                className="border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-neutral-800">
                    {entry.title || "Untitled Entry"}
                  </h4>
                  <div className="flex items-center text-sm text-neutral-500">
                    {entry.mood && <span className="mr-2">{entry.mood}</span>}
                    <span>{formatDate(entry.createdAt.toString())}</span>
                  </div>
                </div>
                <p className="text-neutral-600 text-sm mb-2 line-clamp-2">
                  {truncateText(entry.content, 120)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    {entry.childProfileId && (
                      <div className="flex items-center">
                        <Baby className="mr-1 h-3 w-3" />
                        <span>{childProfiles?.find(p => p.id === entry.childProfileId)?.name}</span>
                      </div>
                    )}
                    {entry.developmentalInsight && (
                      <div className="flex items-center">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        <span>Developmental insight</span>
                      </div>
                    )}
                    {entry.hasAiFeedback === "true" ? (
                      <div className="flex items-center">
                        <Bot className="mr-1 h-3 w-3" />
                        <span>AI feedback</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <PenTool className="mr-1 h-3 w-3" />
                        <span>Entry only</span>
                      </div>
                    )}
                  </div>
                  <Button variant="link" className="text-primary hover:text-primary/80 text-sm p-0">
                    Read more
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <PenTool className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
              <p>📝 No journal entries yet.</p>
              <p className="text-sm">✨ Start your parenting journey by writing your first entry above! ✨</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
