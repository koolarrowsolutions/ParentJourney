import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  BookOpen, 
  Calendar, 
  Baby, 
  Sparkles, 
  Heart, 
  Lightbulb, 
  Star,
  Clock,
  Search,
  Filter,
  Archive,
  Download,
  FileText,
  Loader2,
  ArrowLeft,
  Users,
  Zap,
  CalendarIcon
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { JournalEntry, ChildProfile } from "@shared/schema";
import { exportEntryToPDF, exportFavoritesToPDF } from "@/utils/pdf-export";

interface JournalHistoryProps {
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

export default function InteractionHistory({ triggerSignUpPrompt }: JournalHistoryProps) {
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [selectedInteractionTypes, setSelectedInteractionTypes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { toast } = useToast();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch all child profiles
  const { data: childProfiles, isLoading: profilesLoading } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      // Get auth token for authenticated requests
      const token = localStorage.getItem('parentjourney_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/child-profiles", {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  // Fetch all journal entries (no child filtering in API call)
  const { data: allEntries, isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    queryFn: async () => {
      // Always fetch all entries, we'll filter client-side
      const url = "/api/journal-entries?limit=100";
      
      // Get auth token for authenticated requests
      const token = localStorage.getItem('parentjourney_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  // Mutation for updating favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ entryId, isFavorite }: { entryId: string; isFavorite: boolean }) => {
      // Get auth token for authenticated requests
      const token = localStorage.getItem('parentjourney_token');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/journal-entries/${entryId}/favorite`, {
        method: "PATCH",
        headers,
        credentials: "include",
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

  // Filter entries based on selected children, interaction types, date range, and active tab
  const filteredEntries = allEntries?.filter(entry => {
    // First filter by selected children (if any are selected)
    const childFilter = selectedChildIds.length === 0 || 
                       selectedChildIds.includes(entry.childProfileId || '') ||
                       (selectedChildIds.includes('no-child') && !entry.childProfileId);
    
    // Filter by interaction types (if any are selected)
    const interactionTypeFilter = selectedInteractionTypes.length === 0 ||
                                 selectedInteractionTypes.includes(entry.entryType || 'shared_journey');
    
    // Filter by date range (if set)
    let dateFilter = true;
    if (dateRange?.from || dateRange?.to) {
      const entryDate = new Date(entry.createdAt);
      if (dateRange.from && dateRange.to) {
        // Both dates set - check if entry is within range
        dateFilter = entryDate >= dateRange.from && entryDate <= dateRange.to;
      } else if (dateRange.from) {
        // Only start date set - check if entry is on or after start date
        dateFilter = entryDate >= dateRange.from;
      } else if (dateRange.to) {
        // Only end date set - check if entry is on or before end date
        dateFilter = entryDate <= dateRange.to;
      }
    }
    
    // Then filter by tab
    const tabFilter = activeTab === "favorites" ? entry.isFavorite === "true" : true;
    
    return childFilter && interactionTypeFilter && dateFilter && tabFilter;
  }) || [];

  const favoriteEntries = allEntries?.filter(entry => entry.isFavorite === "true") || [];

  // Handle child selection changes
  const handleChildToggle = (childId: string, checked: boolean) => {
    if (checked) {
      setSelectedChildIds(prev => [...prev, childId]);
    } else {
      setSelectedChildIds(prev => prev.filter(id => id !== childId));
    }
  };

  const handleSelectAllFilters = () => {
    // Select all children
    if (childProfiles) {
      const allChildIds = childProfiles.map(child => child.id);
      // Also include entries with no child profile
      const hasUnassignedEntries = allEntries?.some(entry => !entry.childProfileId);
      if (hasUnassignedEntries) {
        allChildIds.push('no-child');
      }
      setSelectedChildIds(allChildIds);
    }
    
    // Select all interaction types
    setSelectedInteractionTypes(['shared_journey', 'quick_moment']);
  };

  const handleClearAllFilters = () => {
    setSelectedChildIds([]);
    setSelectedInteractionTypes([]);
    setDateRange(undefined);
  };

  const handleSelectAllChildren = () => {
    if (!childProfiles) return;
    const allChildIds = childProfiles.map(child => child.id);
    // Also include entries with no child profile
    const hasUnassignedEntries = allEntries?.some(entry => !entry.childProfileId);
    if (hasUnassignedEntries) {
      allChildIds.push('no-child');
    }
    setSelectedChildIds(allChildIds);
  };

  const handleClearAllChildren = () => {
    setSelectedChildIds([]);
  };

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
        description: "Failed to export interaction",
        variant: "destructive",
      });
    }
  };

  const handleExportAllFavorites = async () => {
    if (favoriteEntries.length === 0) {
      toast({
        title: "No Favorites",
        description: "You don't have any favorite interactions to export",
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
        description: `Exported ${favoriteEntries.length} favorite interactions to PDF`,
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
          <Sparkles className="h-4 w-4 text-primary" />
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
              icon = <Sparkles className="text-neutral-600 h-3 w-3" />;
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

  function LocalJournalEntryCard({ entry }: { entry: JournalEntry }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isFavorite = entry.isFavorite === "true";
    
    const getContentPreview = (content: string) => {
      if (content.length <= 150) return content;
      return content.substring(0, 150) + "...";
    };
    
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
              {isExpanded ? entry.content : getContentPreview(entry.content)}
            </p>
            
            {entry.content.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 p-0 h-auto text-sm text-primary hover:text-primary/80"
              >
                {isExpanded ? "Show less" : "Read more"}
              </Button>
            )}
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
          
          {entry.aiFeedback && isExpanded && (
            <AiFeedbackDisplay feedback={entry.aiFeedback} />
          )}
          
          {(entry.hasAiFeedback && !entry.aiFeedback) || (entry.entryType === 'quick_moment' && !entry.aiFeedback) && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-sm text-amber-700">
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
          <div className="flex items-start justify-between">
            <Link href="/">
              <Button variant="outline" className="hover-scale">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main
              </Button>
            </Link>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold text-neutral-800">📚 Interaction History</h1>
            <p className="text-neutral-600">
              Browse through your parenting journey interactions and AI insights
            </p>
          </div>
        </div>

        {/* Child Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-neutral-800">Filter Your Interactions</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllFilters}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Unified Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                
                {/* Select Children Section */}
                <div className="col-span-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Baby className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium text-neutral-700">Select Children</h3>
                    <div className="flex-1 border-t border-neutral-200"></div>
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium text-neutral-700">Your Interactions</h3>
                  </div>
                </div>

                {/* Children and General Interactions */}
                {profilesLoading ? (
                  <Skeleton className="h-10 col-span-full" />
                ) : (
                  <>
                    {childProfiles && childProfiles.length > 0 && childProfiles.map((child, index) => (
                      <div
                        key={child.id}
                        className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedChildIds.includes(child.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => handleChildToggle(child.id, !selectedChildIds.includes(child.id))}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-blue-100 text-blue-600' :
                            index === 1 ? 'bg-purple-100 text-purple-600' :
                            index === 2 ? 'bg-pink-100 text-pink-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            <Baby className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium text-neutral-800">{child.name}</div>
                        </div>
                        {selectedChildIds.includes(child.id) && (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* General Interactions Option */}
                    {allEntries?.some(entry => !entry.childProfileId) && (
                      <div
                        className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedChildIds.includes('no-child')
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => handleChildToggle('no-child', !selectedChildIds.includes('no-child'))}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium text-neutral-800">General Interactions</div>
                        </div>
                        {selectedChildIds.includes('no-child') && (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Parenting Journey Entries */}
                    <div
                      className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedInteractionTypes.includes('shared_journey')
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      onClick={() => {
                        if (selectedInteractionTypes.includes('shared_journey')) {
                          setSelectedInteractionTypes(selectedInteractionTypes.filter(type => type !== 'shared_journey'));
                        } else {
                          setSelectedInteractionTypes([...selectedInteractionTypes, 'shared_journey']);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium text-neutral-800">Parenting Journey</div>
                      </div>
                      {selectedInteractionTypes.includes('shared_journey') && (
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Quick Moment Reflections */}
                    <div
                      className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedInteractionTypes.includes('quick_moment')
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      onClick={() => {
                        if (selectedInteractionTypes.includes('quick_moment')) {
                          setSelectedInteractionTypes(selectedInteractionTypes.filter(type => type !== 'quick_moment'));
                        } else {
                          setSelectedInteractionTypes([...selectedInteractionTypes, 'quick_moment']);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium text-neutral-800">Quick Moments</div>
                      </div>
                      {selectedInteractionTypes.includes('quick_moment') && (
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Date Range Filter */}
                    <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
                      <DialogTrigger asChild>
                        <div
                          className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                            dateRange?.from || dateRange?.to
                              ? 'border-primary bg-primary/5'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                              <CalendarIcon className="h-4 w-4" />
                            </div>
                            <div className="text-sm font-medium text-neutral-800">
                              {dateRange?.from || dateRange?.to ? 'Date Range Set' : 'Select Date Range'}
                            </div>
                          </div>
                          {(dateRange?.from || dateRange?.to) && (
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </DialogTrigger>
                      <DialogContent className="w-auto p-0">
                        <div className="p-4">
                          <DialogHeader>
                            <DialogTitle>Select Date Range</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <CalendarComponent
                              mode="range"
                              selected={dateRange}
                              onSelect={setDateRange}
                              numberOfMonths={2}
                              className="rounded-md border"
                            />
                            <div className="flex justify-between mt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDateRange(undefined);
                                  setShowDatePicker(false);
                                }}
                              >
                                Clear
                              </Button>
                              <Button
                                onClick={() => setShowDatePicker(false)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>

              {/* Selected Filters Display */}
              {(selectedChildIds.length > 0 || selectedInteractionTypes.length > 0 || dateRange?.from || dateRange?.to) && (
                <div className="pt-4 border-t border-neutral-200">
                  <h4 className="text-xs font-medium text-neutral-600 mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedChildIds.map(childId => {
                      if (childId === 'no-child') {
                        return (
                          <Badge key={childId} variant="secondary" className="text-xs">
                            General Interactions
                          </Badge>
                        );
                      }
                      const child = childProfiles?.find(c => c.id === childId);
                      return child ? (
                        <Badge key={childId} variant="secondary" className="text-xs">
                          {child.name}
                        </Badge>
                      ) : null;
                    })}
                    {selectedInteractionTypes.map(type => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type === 'shared_journey' ? 'Parenting Journey' : 'Quick Moments'}
                      </Badge>
                    ))}
                    {(dateRange?.from || dateRange?.to) && (
                      <Badge variant="outline" className="text-xs">
                        {dateRange?.from && dateRange?.to 
                          ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                          : dateRange?.from 
                          ? `From ${format(dateRange.from, 'MMM d, yyyy')}`
                          : `Until ${format(dateRange.to!, 'MMM d, yyyy')}`
                        }
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {selectedChildIds.length === 0 && selectedInteractionTypes.length === 0 && !dateRange?.from && !dateRange?.to && (
                <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                  All interactions shown when no filters selected
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Export Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-neutral-800">
                  Your Interactions
                  {selectedChildIds.length > 0 && (
                    <span className="text-sm font-normal text-neutral-600 ml-2">
                      ({selectedChildIds.length === 1 && selectedChildIds[0] !== 'no-child' 
                        ? childProfiles?.find(c => c.id === selectedChildIds[0])?.name || 'Unknown'
                        : selectedChildIds.length === 1 && selectedChildIds[0] === 'no-child'
                        ? 'General interactions'
                        : `${selectedChildIds.length} selected`})
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {filteredEntries.length} interactions
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
                  All Interactions ({filteredEntries.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Favorites ({favoriteEntries.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Interactions Display */}
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
                <LocalJournalEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : activeTab === "favorites" ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  No favorite interactions found
                </h3>
                <p className="text-neutral-600 mb-4">
                  {selectedChildIds.length > 0 
                    ? "No favorite interactions for the selected children. Click the star icon on interactions to save as favorites."
                    : "Click the star icon on interactions you want to save as favorites"
                  }
                </p>
                <Button onClick={() => setActiveTab("all")} variant="outline">
                  <Archive className="h-4 w-4 mr-2" />
                  View All Interactions
                </Button>
              </CardContent>
            </Card>
          ) : selectedChildIds.length > 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  No interactions found
                </h3>
                <p className="text-neutral-600 mb-4">
                  No interactions found for the selected children. Try selecting different children or create new interactions.
                </p>
                <Button onClick={() => window.history.back()}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create New Interaction
                </Button>
              </CardContent>
            </Card>
          ) : allEntries && allEntries.length > 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Baby className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  Select children to view their interactions
                </h3>
                <p className="text-neutral-600 mb-4">
                  Use the checkboxes above to select which children's interactions you want to view, or leave unselected to see all interactions.
                </p>
                <Button onClick={handleSelectAllChildren} variant="outline">
                  <Baby className="h-4 w-4 mr-2" />
                  Show All Interactions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  No interactions yet
                </h3>
                <p className="text-neutral-600 mb-4">
                  Start documenting your parenting journey by creating your first interaction.
                </p>
                <Button onClick={() => window.history.back()}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create First Interaction
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}