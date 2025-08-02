import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3, Sparkles } from "lucide-react";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { DailyCheckIn, type DailyCheckInData } from "./daily-checkin";
import { format } from "date-fns";

interface DailyCheckInSelectorProps {
  onCheckInComplete?: (data: DailyCheckInData) => void;
}

export function DailyCheckInSelector({ onCheckInComplete }: DailyCheckInSelectorProps) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Mock last completed date - in real app this would come from storage/API
  const lastCompleted = new Date();
  lastCompleted.setDate(lastCompleted.getDate() - 1); // Yesterday as example
  
  // Mock streak count - in real app this would come from storage/API
  const streakCount = 7;

  const handleCheckInComplete = (data: DailyCheckInData) => {
    console.log('Daily check-in completed:', data);
    setShowCheckIn(false);
    onCheckInComplete?.(data);
    // TODO: Save to journal entry or separate endpoint
  };

  return (
    <>
      <Card className="bg-white shadow-lg border-2 border-primary/30 hover-lift opacity-100 visible w-full">
        <CardContent className="p-4 sm:p-6">
          {/* Mobile: Stack layout, Desktop: Horizontal layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4 w-full">
            <div className="flex items-center space-x-4 flex-1">
              <Heart className="text-blue-600 h-6 w-6 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-2">
                  How are you really doing today?
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Take a 2-minute check-in across 10 key areas of your life.
                </p>
                <div className="flex items-center mt-1 text-xs text-amber-600 flex-wrap">
                  <span className="mr-1">🌟</span>
                  <span className="font-semibold">{streakCount} day streak!</span>
                  <span className="mx-2 text-gray-400 hidden xs:inline">•</span>
                  <span className="text-gray-500 ml-2 xs:ml-0">Last: {format(lastCompleted, 'MMM d')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-3 flex-shrink-0 w-full sm:w-auto">
              <Button 
                onClick={() => setShowCheckIn(true)}
                className="bg-primary hover:bg-primary/90 text-white font-medium text-sm px-6 py-3 rounded-lg transition-all hover-scale button-press flex-1 sm:flex-initial"
              >
                <span className="sm:hidden">📝 Check-In</span>
                <span className="hidden sm:inline">📝 Begin My Check-In</span>
              </Button>
              
              <TooltipWrapper content="See My Past Check-Ins">
                <Button 
                  variant="outline"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="border-primary/30 text-primary hover:bg-primary/5 p-2 rounded-lg transition-all hover-scale button-press"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
              
              <TooltipWrapper content="See Personalized Suggestions">
                <Button 
                  variant="outline"
                  className="border-amber-300 text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-all hover-scale button-press"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
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
    </>
  );
}

// Legacy component name for backward compatibility
export const MoodSelector = DailyCheckInSelector;