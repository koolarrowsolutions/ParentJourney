import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Calendar as CalendarIcon, X, User, Heart } from "lucide-react";
import { JournalEntry, ChildProfile } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchFilters {
  keyword: string;
  mood: string;
  childId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  hasAiFeedback: string;
  hasPhotos: string;
}

interface AdvancedSearchProps {
  onResults: (results: JournalEntry[]) => void;
  onClear: () => void;
}

const MOODS = [
  { value: "😊", label: "😊 Happy" },
  { value: "😢", label: "😢 Sad" },
  { value: "😴", label: "😴 Tired" },
  { value: "😤", label: "😤 Frustrated" },
  { value: "🤗", label: "🤗 Loving" },
  { value: "😰", label: "😰 Stressed" },
  { value: "🥳", label: "🥳 Excited" },
  { value: "😌", label: "😌 Peaceful" },
];

export function AdvancedSearch({ onResults, onClear }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    mood: "",
    childId: "",
    dateFrom: undefined,
    dateTo: undefined,
    hasAiFeedback: "",
    hasPhotos: ""
  });

  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const performSearch = () => {
    if (!entries) return;

    let results = [...entries];

    // Keyword search in title and content
    if (filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase();
      results = results.filter(entry => 
        entry.title?.toLowerCase().includes(keyword) ||
        entry.content.toLowerCase().includes(keyword) ||
        entry.aiFeedback?.toLowerCase().includes(keyword)
      );
    }

    // Mood filter
    if (filters.mood) {
      results = results.filter(entry => entry.mood === filters.mood);
    }

    // Child filter
    if (filters.childId) {
      results = results.filter(entry => entry.childProfileId === filters.childId);
    }

    // Date range filter
    if (filters.dateFrom) {
      results = results.filter(entry => 
        new Date(entry.createdAt) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      results = results.filter(entry => 
        new Date(entry.createdAt) <= filters.dateTo!
      );
    }

    // AI feedback filter
    if (filters.hasAiFeedback === "yes") {
      results = results.filter(entry => entry.hasAiFeedback && entry.aiFeedback);
    } else if (filters.hasAiFeedback === "no") {
      results = results.filter(entry => !entry.hasAiFeedback || !entry.aiFeedback);
    }

    // Photos filter (placeholder for when photos are implemented)
    if (filters.hasPhotos === "yes") {
      // results = results.filter(entry => entry.photos && entry.photos.length > 0);
    } else if (filters.hasPhotos === "no") {
      // results = results.filter(entry => !entry.photos || entry.photos.length === 0);
    }

    onResults(results);
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      mood: "",
      childId: "",
      dateFrom: undefined,
      dateTo: undefined,
      hasAiFeedback: "",
      hasPhotos: ""
    });
    onClear();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.mood) count++;
    if (filters.childId) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.hasAiFeedback) count++;
    if (filters.hasPhotos) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Search className="mr-2 h-5 w-5 text-primary" />
            🔍 Advanced Search
          </span>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="🔍 Search in titles, content, and AI feedback..."
              value={filters.keyword}
              onChange={(e) => updateFilter("keyword", e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && performSearch()}
            />
          </div>
          <Button onClick={performSearch}>
            Search
          </Button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 border-t border-neutral-200 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mood Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Heart className="inline mr-1 h-4 w-4" />
                  Mood
                </label>
                <Select value={filters.mood} onValueChange={(value) => updateFilter("mood", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any mood</SelectItem>
                    {MOODS.map(mood => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Child Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <User className="inline mr-1 h-4 w-4" />
                  Children
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="search-any-child"
                      checked={filters.childId === ""}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter("childId", "");
                        }
                      }}
                      className="rounded border-neutral-300 text-primary focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="search-any-child" className="text-sm text-neutral-700 cursor-pointer">
                      Any child
                    </label>
                  </div>
                  {childProfiles?.map(profile => (
                    <div key={profile.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`search-child-${profile.id}`}
                        checked={filters.childId === profile.id}
                        onChange={(e) => {
                          updateFilter("childId", e.target.checked ? profile.id : "");
                        }}
                        className="rounded border-neutral-300 text-primary focus:ring-primary focus:ring-2"
                      />
                      <label 
                        htmlFor={`search-child-${profile.id}`}
                        className="text-sm text-neutral-700 cursor-pointer"
                      >
                        👶 {profile.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Feedback Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  🤖 AI Feedback
                </label>
                <Select value={filters.hasAiFeedback} onValueChange={(value) => updateFilter("hasAiFeedback", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="yes">With AI feedback</SelectItem>
                    <SelectItem value="no">Without AI feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Photos Filter (placeholder for future) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  📸 Photos
                </label>
                <Select value={filters.hasPhotos} onValueChange={(value) => updateFilter("hasPhotos", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="yes">With photos</SelectItem>
                    <SelectItem value="no">Without photos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <CalendarIcon className="inline mr-1 h-4 w-4" />
                  From Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter("dateFrom", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <CalendarIcon className="inline mr-1 h-4 w-4" />
                  To Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter("dateTo", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button onClick={performSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200">
            {filters.keyword && (
              <Badge variant="secondary" className="gap-1">
                Keyword: "{filters.keyword}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("keyword", "")}
                />
              </Badge>
            )}
            {filters.mood && (
              <Badge variant="secondary" className="gap-1">
                Mood: {filters.mood}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("mood", "")}
                />
              </Badge>
            )}
            {filters.childId && (
              <Badge variant="secondary" className="gap-1">
                Child: {childProfiles?.find(c => c.id === filters.childId)?.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("childId", "")}
                />
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="secondary" className="gap-1">
                From: {format(filters.dateFrom, "MMM d")}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("dateFrom", undefined)}
                />
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="secondary" className="gap-1">
                To: {format(filters.dateTo, "MMM d")}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter("dateTo", undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}