import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, ArrowRight, Bot, PenTool, Baby, GraduationCap, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { EditEntryDialog } from "@/components/edit-entry-dialog";
import { DeleteEntryDialog } from "@/components/delete-entry-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { JournalEntryCard } from "@/components/journal-entry-card";
import { useLocation } from "wouter";
import type { JournalEntry, ChildProfile } from "@shared/schema";

export function RecentEntries() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", searchQuery ? "20" : "5"); // Show more results when searching
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      const response = await fetch(`/api/journal-entries?${params}`);
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
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-neutral-800 flex items-center">
            <History className="text-primary mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">📖 {searchQuery ? 'Search Results' : 'Recent Entries'}</span>
            <span className="sm:hidden">📖 {searchQuery ? 'Search' : 'Recent'}</span>
          </h3>
          {!searchQuery && (
            <Button 
              variant="link" 
              className="text-primary hover:text-primary/80 text-xs sm:text-sm font-medium p-0"
              onClick={() => setLocation('/journal-history')}
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="mb-3">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="🔍 Search entries by title, content, or mood..."
            className="w-full"
          />
        </div>

        <div className="space-y-3">
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
            <>
              {searchQuery && (
                <div className="text-sm text-neutral-600 mb-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
                  📊 Found {entries.length} {entries.length === 1 ? 'entry' : 'entries'} matching "{searchQuery}"
                </div>
              )}
              {entries.map((entry) => (
                <JournalEntryCard 
                  key={entry.id} 
                  entry={entry}
                  showChildInfo={true}
                  childProfiles={childProfiles}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <PenTool className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
              {searchQuery ? (
                <>
                  <p>🔍 No entries found matching "{searchQuery}"</p>
                  <p className="text-sm">Try adjusting your search terms or browse all entries.</p>
                </>
              ) : (
                <>
                  <p>📝 No journal entries yet.</p>
                  <p className="text-sm">✨ Start your parenting journey by writing your first entry above! ✨</p>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}