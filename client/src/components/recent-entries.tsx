import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { History, ArrowRight, Bot, PenTool, Baby, GraduationCap, Edit2, Trash2, MoreHorizontal } from "lucide-react";
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
  const [, setLocation] = useLocation();
  
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", searchQuery ? "20" : "5"); // Show more results when searching
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

  return (
    <div className="bg-white/70 rounded-lg border border-emerald-100">
        <div className="flex items-center justify-between mb-2">
          {!searchQuery && (
            <Button 
              variant="ghost" 
              className="text-xs px-2 py-1 h-6 ml-auto"
              onClick={() => setLocation('/journal-history')}
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
        


        <div className="space-y-2">
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
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-emerald-600 font-medium">Read full entry →</span>
                  </div>
                </div>
              ))}
              {entries.length > 2 && (
                <Link href="/journal-history">
                  <button className="w-full text-xs text-emerald-600 hover:text-emerald-700 text-center py-2 hover:bg-emerald-50 rounded transition-colors">
                    See {entries.length - 2} more journal entries
                  </button>
                </Link>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-neutral-500">No entries yet</p>
            </div>
          )}
        </div>
    </div>
  );
}