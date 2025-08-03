import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Heart, PenTool, Lightbulb, Sparkles } from "lucide-react";
import { JournalForm } from "@/components/journal-form";
import { DailyReflection } from "@/components/daily-reflection";

interface StorySharingSectionProps {
  selectedMood: string;
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

export function StorySharingSection({ selectedMood, triggerSignUpPrompt }: StorySharingSectionProps) {
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showDailyReflectionDialog, setShowDailyReflectionDialog] = useState(false);

  return (
    <Card className="shadow-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 hover-lift animate-bounce-in">
      <CardContent className="p-3 sm:p-6">
        {/* Header Section - Mobile Optimized */}
        <div className="text-center mb-2 sm:mb-6">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <Heart className="h-3 w-3 sm:h-6 sm:w-6 text-rose-500 mr-1 sm:mr-2" />
            <h3 className="text-sm sm:text-xl font-semibold text-neutral-800">
              Tell Your Story
            </h3>
            <Sparkles className="h-3 w-3 sm:h-6 sm:w-6 text-amber-500 ml-1 sm:ml-2" />
          </div>

          
          {/* AI Insights messaging - Informational, not clickable */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4 select-none">
            <p className="text-xs sm:text-sm text-blue-800 text-center leading-relaxed pointer-events-none">
              <span className="font-semibold">✨ The more you check in, the smarter your parenting support gets.</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-blue-700">Every entry helps us tailor tips, patterns, and reminders just for you and your family.</span>
            </p>
          </div>
        </div>

        {/* Story Sharing Options - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {/* Deep Reflection Option */}
          <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-auto min-h-[180px] sm:min-h-[200px] p-4 sm:p-6 flex flex-col items-center justify-center space-y-3 sm:space-y-4 border-rose-200 bg-gradient-to-br from-white to-rose-50 hover:border-rose-300 hover:bg-rose-100/50 hover-lift button-press w-full group transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98]"
              >
                <div className="bg-rose-100 p-1.5 sm:p-3 rounded-full group-hover:bg-rose-200 transition-colors">
                  <PenTool className="h-4 w-4 sm:h-7 sm:w-7 text-rose-600" />
                </div>
                <div className="text-center px-4 sm:px-6 w-full">
                  <div className="font-semibold text-sm sm:text-base text-neutral-800 mb-2 sm:mb-3">
                    Share Journey
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed text-center break-words whitespace-normal">
                    Write or voice record your full thoughts and experiences - perfect for detailed reflection and deeper journaling
                  </div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share Your Parenting Journey</DialogTitle>
                <DialogDescription>
                  Document your experiences, challenges, and victories as a parent.
                </DialogDescription>
              </DialogHeader>
              <JournalForm 
                selectedMood={selectedMood} 
                triggerSignUpPrompt={triggerSignUpPrompt}
              />
            </DialogContent>
          </Dialog>

          {/* Quick Reflection Option */}
          <Dialog open={showDailyReflectionDialog} onOpenChange={setShowDailyReflectionDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-auto min-h-[180px] sm:min-h-[200px] p-4 sm:p-6 flex flex-col items-center justify-center space-y-3 sm:space-y-4 border-amber-200 bg-gradient-to-br from-white to-amber-50 hover:border-amber-300 hover:bg-amber-100/50 hover-lift button-press w-full group transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98]"
              >
                <div className="bg-amber-100 p-1.5 sm:p-3 rounded-full group-hover:bg-amber-200 transition-colors">
                  <Lightbulb className="h-4 w-4 sm:h-7 sm:w-7 text-amber-600" />
                </div>
                <div className="text-center px-4 sm:px-6 w-full">
                  <div className="font-semibold text-sm sm:text-base text-neutral-800 mb-2 sm:mb-3">
                    Quick Moment
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed text-center break-words whitespace-normal">
                    Quick reflection with a sentence or photo - perfect for capturing moments on the go
                  </div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Quick Daily Reflection</DialogTitle>
                <DialogDescription>
                  Take a moment to reflect on a specific aspect of your parenting day.
                </DialogDescription>
              </DialogHeader>
              <DailyReflection />
            </DialogContent>
          </Dialog>
        </div>


      </CardContent>
    </Card>
  );
}