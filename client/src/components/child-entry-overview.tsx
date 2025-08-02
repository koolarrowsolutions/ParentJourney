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
    <div className="bg-white/70 rounded-lg border border-blue-100 p-3 hover-lift animate-fade-in">
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/child-entries?childId=${child.id}`)}
            className="text-xs px-2 py-1 h-6"
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
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
                  <p className="text-xs text-neutral-600 line-clamp-1">
                    {entry.content.length > 60 
                      ? `${entry.content.substring(0, 60)}...` 
                      : entry.content
                    }
                  </p>
                </div>
              ))}
              {entries.length > 1 && (
                <p className="text-xs text-neutral-500 text-center">
                  +{entries.length - 1} more
                </p>
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