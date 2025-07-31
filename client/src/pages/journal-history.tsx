import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  BookOpen, 
  Calendar, 
  Baby, 
  Bot, 
  Heart, 
  Lightbulb, 
  Star,
  Clock,
  Search,
  Filter,
  Archive,
  Download,
  FileText,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import type { JournalEntry, ChildProfile } from "@shared/schema";
import { exportEntryToPDF, exportFavoritesToPDF } from "@/utils/pdf-export";

interface JournalHistoryProps {
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

export default function JournalHistory({ triggerSignUpPrompt }: JournalHistoryProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  // Fetch all child profiles
  const { data: childProfiles, isLoading: profilesLoading } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  // Fetch journal entries for selected child
  const { data: entries, isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries", selectedChildId],
    queryFn: async () => {
      const url = selectedChildId 
        ? `/api/journal-entries?childId=${selectedChildId}&limit=50`
        : "/api/journal-entries?limit=50";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  // Mutation for updating favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ entryId, isFavorite }: { entryId: string; isFavorite: boolean }) => {
      const response = await fetch(`/api/journal-entries/${entryId}/favorite`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFavorite }),
      });
      if (!response.ok) throw new Error("Failed to update favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Success",
        description: "Entry bookmark updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  const selectedChild = childProfiles?.find(child => child.id === selectedChildId);

  // Filter entries based on active tab
  const filteredEntries = entries?.filter(entry => {
    if (activeTab === "favorites") {
      return entry.isFavorite === "true";
    }
    return true;
  }) || [];

  const favoriteEntries = entries?.filter(entry => entry.isFavorite === "true") || [];

  const handleToggleFavorite = (entryId: string, currentStatus: string) => {
    const newStatus = currentStatus === "true" ? false : true;
    toggleFavoriteMutation.mutate({ entryId, isFavorite: newStatus });
  };

  const handleExportEntry = async (entry: JournalEntry) => {
    try {
      const childProfile = childProfiles?.find(p => p.id === entry.childProfileId);
      await exportEntryToPDF({ entry, childProfile });
      toast({
        title: "Success",
        description: "Entry exported to PDF successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export entry",
        variant: "destructive",
      });
    }
  };

  const handleExportAllFavorites = async () => {
    if (favoriteEntries.length === 0) {
      toast({
        title: "No Favorites",
        description: "You don't have any favorite entries to export",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportFavoritesToPDF({ 
        entries: favoriteEntries, 
        childProfiles: childProfiles || [] 
      });
      toast({
        title: "Success",
        description: `Exported ${favoriteEntries.length} favorite entries to PDF`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export favorites",
        variant: "destructive",
      });
    }
  };

  function AiFeedbackDisplay({ feedback }: { feedback: string }) {
    const sections = feedback.split('\n\n').filter(section => section.trim());
    
    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <Bot className="h-4 w-4 text-primary" />
          AI Parenting Coach
        </div>
        
        <div className="space-y-3">
          {sections.map((section, index) => {
            if (!section.includes(':')) return null;
            
            const [title, ...contentParts] = section.split(':');
            const content = contentParts.join(':').trim();
            
            let icon, bgColor, borderColor;
            if (title.includes('Encouragement')) {
              icon = <Heart className="text-pink-600 h-3 w-3" />;
              bgColor = "bg-pink-50";
              borderColor = "border-l-pink-400";
            } else if (title.includes('Insight')) {
              icon = <Lightbulb className="text-amber-600 h-3 w-3" />;
              bgColor = "bg-amber-50";
              borderColor = "border-l-amber-400";
            } else if (title.includes('Suggestion')) {
              icon = <Star className="text-blue-600 h-3 w-3" />;
              bgColor = "bg-blue-50";
              borderColor = "border-l-blue-400";
            } else {
              icon = <Bot className="text-neutral-600 h-3 w-3" />;
              bgColor = "bg-neutral-50";
              borderColor = "border-l-neutral-400";
            }
            
            return (
              <div key={index} className={`p-3 ${bgColor} rounded-md border-l-4 ${borderColor}`}>
                <div className="flex items-start gap-2">
                  {icon}
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-neutral-800 mb-1">
                      {title.replace(/\*\*/g, '').trim()}
                    </h5>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function JournalEntryCard({ entry }: { entry: JournalEntry }) {
    const isFavorite = entry.isFavorite === "true";
    
    return (
      <Card className={`hover-lift animate-fade-in ${isFavorite ? 'ring-2 ring-yellow-200 bg-yellow-50/30' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">
                {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
              </span>
              <span className="text-xs text-neutral-400">
                {format(new Date(entry.createdAt), 'h:mm a')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {entry.mood && (
                <Badge variant="outline" className="text-xs">
                  {entry.mood}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleFavorite(entry.id, entry.isFavorite || "false")}
                disabled={toggleFavoriteMutation.isPending}
                className={`p-1 h-8 w-8 ${isFavorite ? 'text-yellow-600 hover:text-yellow-700' : 'text-neutral-400 hover:text-yellow-600'}`}
              >
                {toggleFavoriteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExportEntry(entry)}
                className="p-1 h-8 w-8 text-neutral-400 hover:text-primary"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Emotion Tags */}
          {entry.emotionTags && entry.emotionTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.emotionTags.map((emotion) => (
                <Badge
                  key={emotion}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-start">{/* Restore div structure */}
          </div>
          {entry.title && (
            <CardTitle className="text-lg text-neutral-800 mt-2">
              {entry.title}
            </CardTitle>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="prose prose-sm max-w-none">
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
          
          {entry.photos && entry.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {entry.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                  <img
                    src={photo}
                    alt={`Entry photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          {entry.aiFeedback && (
            <AiFeedbackDisplay feedback={entry.aiFeedback} />
          )}
          
          {entry.hasAiFeedback && !entry.aiFeedback && (
            <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Clock className="h-4 w-4" />
                Don't see AI feedback? It may take a moment to appear after entry is submitted.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Archive className="text-white h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-800">Journal History</h1>
          </div>
          <p className="text-neutral-600">
            Browse through your parenting journey entries and AI insights
          </p>
        </div>

        {/* Child Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-neutral-800">Select Children</h2>
              </div>
              
              {profilesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="space-y-2">
                  {childProfiles && childProfiles.length > 0 ? (
                    childProfiles.map((child) => (
                      <div key={child.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`history-child-${child.id}`}
                          checked={selectedChildId === child.id}
                          onChange={(e) => {
                            setSelectedChildId(e.target.checked ? child.id : "");
                          }}
                          className="rounded border-neutral-300 text-primary focus:ring-primary focus:ring-2"
                        />
                        <label 
                          htmlFor={`history-child-${child.id}`}
                          className="text-sm text-neutral-700 flex items-center cursor-pointer"
                        >
                          <Baby className="h-4 w-4 mr-2 text-primary" />
                          {child.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 italic">No children added yet</p>
                  )}
                </div>
              )}
              
              {childProfiles?.length === 0 && !profilesLoading && (
                <div className="text-center py-4">
                  <p className="text-neutral-600 mb-3">No child profiles found.</p>
                  <Button variant="outline" onClick={() => window.history.back()}>
                    <Baby className="h-4 w-4 mr-2" />
                    Add Child Profile
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Export Controls */}
        {selectedChild && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-neutral-800">
                    {selectedChild.name}'s Journal Entries
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {filteredEntries.length} entries
                  </Badge>
                  {favoriteEntries.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportAllFavorites}
                      className="text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Export All Favorites
                    </Button>
                  )}
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    All Entries ({entries?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Favorites ({favoriteEntries.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        )}
        
        {/* Journal Entries Display */}
        {selectedChild && (
          <div className="space-y-6">
            {entriesLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-64" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEntries.length > 0 ? (
              <div className="space-y-6">
                {filteredEntries.map((entry) => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : activeTab === "favorites" ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">
                    No favorite entries yet
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Click the star icon on entries you want to save as favorites
                  </p>
                  <Button onClick={() => setActiveTab("all")} variant="outline">
                    <Archive className="h-4 w-4 mr-2" />
                    View All Entries
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">
                    No journal entries yet
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Start documenting your parenting journey with {selectedChild.name}
                  </p>
                  <Button onClick={() => window.history.back()}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Write First Entry
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* No Child Selected State */}
        {!selectedChildId && !profilesLoading && childProfiles && childProfiles.length > 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Baby className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 mb-2">
                Select a child to view their journal history
              </h3>
              <p className="text-neutral-600">
                Choose a child from the dropdown above to see their past journal entries and AI insights
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}