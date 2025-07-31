import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WeeklyReflection } from "@/components/weekly-reflection";
import { MoodAnalytics } from "@/components/mood-analytics";
import { AdvancedSearch } from "@/components/advanced-search";
import { EmotionTrendsDashboard } from "@/components/emotion-trends-dashboard";
import { MoodTrendsDashboard } from "@/components/mood-trends-dashboard";
import { useState } from "react";
import { JournalEntry } from "@shared/schema";
// Temporarily remove JournalEntryCard import until it's properly implemented
// import { JournalEntryCard } from "@/components/journal-entry-card";

export default function Analytics() {
  const [searchResults, setSearchResults] = useState<JournalEntry[] | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("all");

  const handleSearchResults = (results: JournalEntry[]) => {
    setSearchResults(results);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
  };

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-fade-in">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover-scale">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journal
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-neutral-800">📊 Analytics & Insights</h1>
              <p className="text-neutral-600">Discover patterns and insights from your parenting journey</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Advanced Search */}
          <AdvancedSearch onResults={handleSearchResults} onClear={handleClearSearch} />

          {/* Search Results */}
          {searchResults && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-800">
                🔍 Search Results ({searchResults.length} entries found)
              </h2>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>No entries match your search criteria.</p>
                  <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {searchResults.map((entry) => (
                    <div key={entry.id} className="p-4 bg-white rounded-lg border border-neutral-200">
                      <h3 className="font-medium text-neutral-800">{entry.title || "Untitled Entry"}</h3>
                      <p className="text-sm text-neutral-600 mt-2">{entry.content.substring(0, 150)}...</p>
                      <div className="flex items-center gap-2 mt-3">
                        {entry.mood && <span className="text-sm">{entry.mood}</span>}
                        <span className="text-xs text-neutral-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Content */}
          {!searchResults && (
            <div className="space-y-8">
              {/* AI Mood Trends Dashboard */}
              <div className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                <MoodTrendsDashboard 
                  selectedChildId={selectedChildId}
                  onChildChange={handleChildChange}
                />
              </div>

              {/* Emotion Trends Dashboard */}
              <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <EmotionTrendsDashboard 
                  selectedChildId={selectedChildId}
                  onChildChange={handleChildChange}
                />
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Reflection */}
                <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                  <WeeklyReflection />
                </div>

                {/* Mood Analytics */}
                <div className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
                  <MoodAnalytics />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}