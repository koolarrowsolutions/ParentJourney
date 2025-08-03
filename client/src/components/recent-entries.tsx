import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, ArrowRight, Bot, PenTool, Baby, GraduationCap, Edit2, Trash2, MoreHorizontal, Filter } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { EditEntryDialog } from "@/components/edit-entry-dialog";
import { DeleteEntryDialog } from "@/components/delete-entry-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { JournalEntryCard } from "@/components/journal-entry-card";
import { useLocation, Link } from "wouter";
import { format } from "date-fns";
import type { JournalEntry, ChildProfile } from "@shared/schema";

export function RecentEntries() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [selectedInteractionTypes, setSelectedInteractionTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [, setLocation] = useLocation();
  
  const { data: allEntries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "20"); // Get more entries for filtering
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      
      // Get auth token for authenticated requests
      const token = localStorage.getItem('parentjourney_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/journal-entries?${params}`, {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  // Filter entries based on selected children and interaction types
  const filteredEntries = allEntries?.filter(entry => {
    // Child filter
    if (selectedChildIds.length > 0) {
      const hasMatchingChild = selectedChildIds.some(childId => 
        entry.childProfileId === childId || 
        (entry.childProfileIds && entry.childProfileIds.includes(childId))
      );
      if (!hasMatchingChild) return false;
    }

    // Interaction type filter
    if (selectedInteractionTypes.length > 0) {
      const entryType = entry.entryType || 'shared_journey'; // Default for backward compatibility
      if (!selectedInteractionTypes.includes(entryType)) return false;
    }

    return true;
  }) || [];

  const entries = filteredEntries.slice(0, 5); // Show top 5 for recent interactions

  const { data: childProfiles } = useQuery<ChildProfile[]>({
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

  const getInteractionTypeLabel = (entryType: string | null) => {
    switch (entryType) {
      case 'quick_moment': return 'Quick Moment';
      case 'daily_reflection': return 'Daily Reflection';
      case 'shared_journey': 
      default: return 'Shared Journey';
    }
  };

  const interactionTypes = [
    { value: 'shared_journey', label: 'Shared Journey' },
    { value: 'quick_moment', label: 'Quick Moment' },
    { value: 'daily_reflection', label: 'Daily Reflection' }
  ];

  return (
    <div className="bg-white/70 rounded-lg border border-emerald-100">
        <div className="flex items-center justify-between mb-3 p-3 pb-0">
          <h3 className="text-sm font-semibold text-neutral-800">Your Recent Interactions</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs px-2 py-1 h-6"
            >
              <Filter className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              className="text-xs px-2 py-1 h-6"
              onClick={() => setLocation('/journal-history')}
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="px-3 pb-3 space-y-3 border-b border-neutral-100">
            {/* Child Filter */}
            {childProfiles && childProfiles.length > 0 && (
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">Filter by Child:</label>
                <div className="flex flex-wrap gap-2">
                  {childProfiles.map((child, index) => (
                    <div key={child.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`child-${child.id}`}
                        checked={selectedChildIds.includes(child.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedChildIds([...selectedChildIds, child.id]);
                          } else {
                            setSelectedChildIds(selectedChildIds.filter(id => id !== child.id));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`child-${child.id}`}
                        className="text-xs text-neutral-700 cursor-pointer flex items-center gap-1"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          index % 3 === 0 ? 'bg-blue-400' :
                          index % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400'
                        }`}></div>
                        {child.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Type Filter */}
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-2 block">Filter by Interaction Type:</label>
              <div className="flex flex-wrap gap-2">
                {interactionTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={selectedInteractionTypes.includes(type.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedInteractionTypes([...selectedInteractionTypes, type.value]);
                        } else {
                          setSelectedInteractionTypes(selectedInteractionTypes.filter(t => t !== type.value));
                        }
                      }}
                    />
                    <label 
                      htmlFor={`type-${type.value}`}
                      className="text-xs text-neutral-700 cursor-pointer"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedChildIds.length > 0 || selectedInteractionTypes.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedChildIds([]);
                  setSelectedInteractionTypes([]);
                }}
                className="text-xs h-6"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        <div className="p-3 pt-0 space-y-2">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="bg-white/50 rounded border border-neutral-100 p-2">
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))
          ) : entries && entries.length > 0 ? (
            <>
              {entries.slice(0, 2).map((entry) => (
                <div key={entry.id} className="bg-white/50 rounded border border-neutral-100 p-2 group hover:bg-white/80 transition-all cursor-pointer"
                     onClick={() => setLocation('/journal-history')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-500">
                      {format(new Date(entry.createdAt), 'MMM d')}
                    </span>
                    <div className="flex items-center gap-1">
                      {(entry.aiAnalyzedMood || entry.mood) && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {entry.aiAnalyzedMood || entry.mood}
                        </Badge>
                      )}
                      {entry.childProfileId && childProfiles && (
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            childProfiles.findIndex(c => c.id === entry.childProfileId) % 3 === 0 ? 'bg-blue-400' :
                            childProfiles.findIndex(c => c.id === entry.childProfileId) % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400'
                          }`}
                          title={`Entry for ${childProfiles.find(c => c.id === entry.childProfileId)?.name}`}>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 group-hover:text-neutral-700 transition-colors">
                    <span className="group-hover:hidden">
                      {entry.content.length > 100 
                        ? `${entry.content.substring(0, 100)}...` 
                        : entry.content
                      }
                    </span>
                    <span className="hidden group-hover:block">
                      {entry.content.length > 200 
                        ? `${entry.content.substring(0, 200)}...` 
                        : entry.content
                      }
                    </span>
                  </p>
                  
                  {/* Show AI feedback status for quick moment interactions */}
                  {entry.entryType === 'quick_moment' && !entry.aiFeedback && (
                    <div className="mt-1">
                      <p className="text-xs text-amber-600">
                        Don't see AI feedback? It may take a moment to appear after entry is submitted.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-emerald-600 font-medium">Read full interaction →</span>
                  </div>
                </div>
              ))}
              {filteredEntries.length > 2 && (
                <Link href="/journal-history">
                  <button className="w-full text-xs text-emerald-600 hover:text-emerald-700 text-center py-2 hover:bg-emerald-50 rounded transition-colors">
                    See more interactions
                  </button>
                </Link>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-neutral-500">
                {selectedChildIds.length > 0 || selectedInteractionTypes.length > 0 
                  ? "No interactions match your current filters" 
                  : "No interactions yet"
                }
              </p>
            </div>
          )}
        </div>
    </div>
  );
}