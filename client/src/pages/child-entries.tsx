import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { ArrowLeft, Calendar, Heart, Bot, Baby, BookOpen } from "lucide-react";
import { formatAge, calculateDevelopmentalStage } from "@/utils/developmental-stages";
import type { JournalEntry, ChildProfile } from "@shared/schema";
import { format } from "date-fns";

interface ChildEntriesPageProps {
  childId: string;
}

export default function ChildEntries() {
  const [location, navigate] = useLocation();
  const childId = new URLSearchParams(location.split('?')[1] || '').get('childId');

  const { data: child } = useQuery<ChildProfile>({
    queryKey: ["/api/child-profiles", childId],
    queryFn: async () => {
      const response = await fetch(`/api/child-profiles/${childId}`);
      if (!response.ok) throw new Error("Failed to fetch child profile");
      return response.json();
    },
    enabled: !!childId,
  });

  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries", childId],
    queryFn: async () => {
      const response = await fetch(`/api/journal-entries?childId=${childId}`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
    enabled: !!childId,
  });

  if (!childId) {
    navigate('/');
    return null;
  }

  const developmentalStage = child?.developmentalStage 
    ? calculateDevelopmentalStage(child.dateOfBirth)
    : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4 hover-lift button-press"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          {child && (
            <Card className="border border-primary/20 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Baby className="text-primary h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-800">{child.name}'s Journal Entries</h1>
                    <p className="text-neutral-600">
                      {formatAge(child.dateOfBirth)}
                      {child.pronouns && <span className="ml-2">• {child.pronouns}</span>}
                    </p>
                    {developmentalStage && (
                      <Badge variant="secondary" className="mt-1">
                        {developmentalStage.label} Stage
                      </Badge>
                    )}
                  </div>
                </div>

                {child.notes && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-700">{child.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-800">Journal Entries</h2>
            {entries && (
              <Badge variant="outline">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries && entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <Card key={entry.id} className={`hover-lift animate-fade-in stagger-${Math.min(index, 5)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        <span className="text-sm text-neutral-600">
                          {format(new Date(entry.createdAt), 'MMMM d, yyyy • h:mm a')}
                        </span>
                        {entry.mood && (
                          <Badge variant="outline" className="ml-2">
                            {entry.mood}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {entry.title && (
                      <h3 className="text-lg font-medium text-neutral-800 mb-2">
                        {entry.title}
                      </h3>
                    )}

                    <p className="text-neutral-700 mb-4 leading-relaxed">
                      {entry.content}
                    </p>

                    {entry.aiFeedback && (
                      <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg p-4 border border-accent/20">
                        <div className="flex items-start gap-3">
                          <Bot className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-neutral-800 mb-2">AI Insights</h4>
                            <p className="text-sm text-neutral-700 leading-relaxed">
                              {entry.aiFeedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {entry.developmentalInsight && (
                      <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20 mt-3">
                        <div className="flex items-start gap-3">
                          <BookOpen className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-neutral-800 mb-2">Developmental Insight</h4>
                            <p className="text-sm text-neutral-700 leading-relaxed">
                              {entry.developmentalInsight}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 animate-fade-in">
              <CardContent>
                <Baby className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-600 mb-2">
                  No entries yet for {child?.name}
                </h3>
                <p className="text-neutral-500 mb-4">
                  Start journaling about {child?.name} to track their growth and get personalized insights.
                </p>
                <Button onClick={() => navigate('/')} className="button-press hover-lift">
                  Create First Entry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}