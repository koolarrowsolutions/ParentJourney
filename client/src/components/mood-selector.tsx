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
          <div className="flex items-center mb-2 sm:mb-3">
            <Heart className="text-blue-600 mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Daily Check-In
            </h3>
          </div>
          <p className="text-gray-700 mb-3 sm:mb-4 text-xs sm:text-sm font-medium">
            Track your complete wellness journey with our comprehensive daily assessment covering energy, patience, connection, and more.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => setShowCheckIn(true)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium text-sm sm:text-base py-2 sm:py-3 rounded-lg transition-all hover-scale button-press"
            >
              <Heart className="mr-2 h-4 w-4" />
              Start Daily Check-In
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full border-primary/30 text-primary hover:bg-primary/5 font-medium text-xs sm:text-sm py-2 rounded-lg transition-all hover-scale button-press"
            >
              <BarChart3 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              ✨ View Parent Analytics
            </Button>
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