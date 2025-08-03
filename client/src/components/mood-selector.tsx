import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3, Sparkles } from "lucide-react";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { DailyCheckIn, type DailyCheckInData } from "./daily-checkin";
import { format } from "date-fns";
import { Link } from "wouter";
import type { JournalEntry } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ComprehensiveAIInsights } from "./comprehensive-ai-insights";

interface DailyCheckInSelectorProps {
  onCheckInComplete?: (data: DailyCheckInData) => void;
}

export function DailyCheckInSelector({ onCheckInComplete }: DailyCheckInSelectorProps) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showPersonalizedSuggestions, setShowPersonalizedSuggestions] = useState(false);
  
  // Fetch real journal entries to calculate actual streaks and last completed
  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    select: (data) => data || [],
  });
  
  // Calculate real streak and last completed from actual data
  const calculateStreak = () => {
    if (!entries.length) return 0;
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const streakCount = calculateStreak();
  
  // Get the most recent entry and validate the date
  const getLastCompleted = () => {
    if (!entries.length) return null;
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const dateStr = sortedEntries[0].createdAt;
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  };
  
  const lastCompleted = getLastCompleted();

  const handleCheckInComplete = async (data: DailyCheckInData) => {
    console.log('Daily check-in completed:', data);
    
    try {
      // Save check-in data to server
      const response = await fetch('/api/daily-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Check-in saved successfully:', result);
        
        // Refresh data by invalidating queries
        // This will trigger a refetch of journal entries and stats
        window.location.reload(); // Simple refresh for now
      } else {
        console.error('Failed to save check-in');
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
    
    setShowCheckIn(false);
    onCheckInComplete?.(data);
  };

  return (
    <>
      <Card className="bg-white shadow-lg border-2 border-primary/30 hover-lift opacity-100 visible">
        <CardContent className="p-3 sm:p-4">
          {/* Mobile: Stack layout, Desktop: Horizontal layout */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Heart className="text-blue-600 h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  How are you really doing today?
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-tight mt-0.5">
                  Take a 2-minute check-in across 10 key areas of your life.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-2 flex-shrink-0">
              <Button 
                onClick={() => setShowCheckIn(true)}
                className="bg-primary hover:bg-primary/90 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-all hover-scale button-press flex-1 sm:flex-initial"
              >
                <span className="sm:hidden">📝 Check-In</span>
                <span className="hidden sm:inline">📝 Begin My Check-In</span>
              </Button>
              
              <TooltipWrapper content="See My Past Check-Ins">
                <Link href="/analytics">
                  <Button 
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/5 p-2 rounded-lg transition-all hover-scale button-press"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipWrapper>
              
              <TooltipWrapper content="See Personalized Suggestions">
                <Button 
                  variant="outline"
                  onClick={() => setShowPersonalizedSuggestions(true)}
                  className="border-amber-300 text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-all hover-scale button-press"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
            </div>

            <div className="flex items-center justify-center text-xs text-amber-600 flex-wrap">
              <span className="mr-1">
                {(() => {
                  if (streakCount === 0) return '🌱';
                  if (streakCount === 1) return '👍';
                  if (streakCount === 2) return '💪';
                  if (streakCount >= 3 && streakCount <= 4) return '⭐';
                  if (streakCount >= 5 && streakCount <= 6) return '🏆';
                  if (streakCount >= 7 && streakCount <= 13) return '🔥';
                  if (streakCount >= 14 && streakCount <= 20) return '🚀';
                  if (streakCount >= 21 && streakCount <= 29) return '💎';
                  if (streakCount >= 30) return '👑';
                  return '🌟';
                })()}
              </span>
              <span className="font-semibold">{streakCount} day streak!</span>
              <span className="mx-2 text-gray-400 hidden xs:inline">•</span>
              <span className="text-gray-500 ml-2 xs:ml-0">
                Last: {lastCompleted ? format(lastCompleted, 'MMM d') : 'No entries yet'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Check-In Modal */}
      {showCheckIn && (
        <DailyCheckIn
          onComplete={handleCheckInComplete}
          onCancel={() => setShowCheckIn(false)}
        />
      )}

      {/* Personalized Suggestions Dialog */}
      <Dialog open={showPersonalizedSuggestions} onOpenChange={setShowPersonalizedSuggestions}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Personalized Parenting Suggestions</DialogTitle>
          </DialogHeader>
          <ComprehensiveAIInsights />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Legacy component name for backward compatibility
export const MoodSelector = DailyCheckInSelector;