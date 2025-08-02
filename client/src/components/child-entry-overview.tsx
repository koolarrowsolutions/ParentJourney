import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Baby, Calendar, BookOpen, ArrowRight } from "lucide-react";
import { formatAge, calculateDevelopmentalStage } from "@/utils/developmental-stages";
import type { JournalEntry, ChildProfile } from "@shared/schema";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface ChildEntryOverviewProps {
  child: ChildProfile;
}

export function ChildEntryOverview({ child }: ChildEntryOverviewProps) {
  const [, navigate] = useLocation();
  
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries", child.id],
    queryFn: async () => {
      const response = await fetch(`/api/journal-entries?childId=${child.id}&limit=3`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  const developmentalStage = child.developmentalStage 
    ? calculateDevelopmentalStage(child.dateOfBirth)
    : null;

  return (
    <div 
      className="bg-white/70 rounded-lg border border-blue-100 p-3 hover-lift animate-fade-in cursor-pointer hover:bg-white/90 hover:border-blue-200 transition-all duration-200"
      onClick={() => navigate(`/child-entries?childId=${child.id}`)}
    >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Baby className="text-primary h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">{child.name}</h3>
              <p className="text-xs text-neutral-600">
                {formatAge(child.dateOfBirth)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <span className="text-xs font-medium">View Full Journal</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-600 flex items-center">
            <BookOpen className="mr-1 h-3 w-3" />
            Latest
          </h4>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="p-3 bg-neutral-50 rounded-lg">
                  <Skeleton className="h-3 w-1/4 mb-1" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : entries && entries.length > 0 ? (
            <div className="space-y-1">
              {entries.slice(0, 1).map((entry) => (
                <div key={entry.id} className="p-2 bg-white/50 rounded border border-neutral-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-500 flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {format(new Date(entry.createdAt), 'MMM d')}
                    </span>
                    {entry.mood && (
                      <Badge variant="outline" className="text-xs">
                        {entry.mood}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500 italic">
                      Tap to view entry
                    </p>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              ))}
              {entries.length > 1 && (
                <div className="flex justify-center mt-2">
                  <div className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 transition-colors">
                    <span>🔍 View all {entries.length} entries</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-neutral-500">No entries yet</p>
            </div>
          )}
        </div>
    </div>
  );
}