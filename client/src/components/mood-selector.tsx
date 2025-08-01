import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3 } from "lucide-react";
import { DailyCheckIn, type DailyCheckInData } from "./daily-checkin";

interface DailyCheckInSelectorProps {
  onCheckInComplete?: (data: DailyCheckInData) => void;
}

export function DailyCheckInSelector({ onCheckInComplete }: DailyCheckInSelectorProps) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
                  Easy Daily Check-In
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  10-category wellness assessment
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowCheckIn(true)}
                className="bg-primary hover:bg-primary/90 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-all hover-scale button-press"
              >
                <Heart className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Start Check-In
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="border-primary/30 text-primary hover:bg-primary/5 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg transition-all hover-scale button-press"
              >
                <BarChart3 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">✨ Analytics</span>
                <span className="sm:hidden">✨</span>
              </Button>
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