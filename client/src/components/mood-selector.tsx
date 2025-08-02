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
      <Card className="bg-white shadow-lg border-2 border-primary/30 hover-lift opacity-100 visible">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center">
              <Heart className="text-blue-600 mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  How are you really doing today?
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Take a 2-minute check-in across 10 key areas of your life.
                </p>
                {/* Streak indicator */}
                <div className="flex items-center mt-1 text-xs text-amber-600">
                  <span className="mr-1">🌟</span>
                  <span className="font-semibold">{streakCount} day streak!</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex flex-col items-end space-y-2">
                <Button 
                  onClick={() => setShowCheckIn(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-all hover-scale button-press"
                >
                  <Heart className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  📝 Begin My Check-In
                </Button>
                
                {/* Last completed indicator */}
                <div className="text-xs text-gray-500">
                  Last completed: {format(lastCompleted, 'MMM d')}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <TooltipWrapper content="See My Past Check-Ins">
                  <Button 
                    variant="outline"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="border-primary/30 text-primary hover:bg-primary/5 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg transition-all hover-scale button-press"
                  >
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipWrapper>
                
                <TooltipWrapper content="See Personalized Suggestions">
                  <Button 
                    variant="outline"
                    className="border-amber-300 text-amber-600 hover:bg-amber-50 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg transition-all hover-scale button-press"
                  >
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipWrapper>
              </div>
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