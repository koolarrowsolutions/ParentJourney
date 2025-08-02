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
    <Card className="hover-lift animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Baby className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-800">{child.name}</h3>
              <p className="text-xs text-neutral-600">
                {formatAge(child.dateOfBirth)}
                {child.pronouns && <span className="ml-2">• {child.pronouns}</span>}
              </p>
              {developmentalStage && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {developmentalStage.label} Stage
                </Badge>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/child-entries?childId=${child.id}`)}
            className="hover-lift button-press"
          >
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-700 flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Recent Entries
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
            <div className="space-y-2">
              {entries.slice(0, 2).map((entry) => (
                <div key={entry.id} className="p-2 bg-neutral-50 rounded-lg border border-neutral-100">
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
                  <p className="text-sm text-neutral-700 line-clamp-2 leading-relaxed">
                    {entry.content.length > 100 
                      ? `${entry.content.substring(0, 100)}...` 
                      : entry.content
                    }
                  </p>
                </div>
              ))}
              {entries.length > 2 && (
                <p className="text-xs text-neutral-500 text-center">
                  +{entries.length - 2} more entries
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-500">No entries yet</p>
              <p className="text-xs text-neutral-400">Start journaling about {child.name}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}