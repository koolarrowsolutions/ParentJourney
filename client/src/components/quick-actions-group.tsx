import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PenTool, Lightbulb, User, Users, ArrowRight } from "lucide-react";
import { JournalForm } from "./journal-form";
import { DailyReflection } from "./daily-reflection";
import { ParentProfileDialog } from "./parent-profile-dialog";
import { ChildProfilesDialog } from "./child-profiles-dialog";

interface QuickActionsGroupProps {
  selectedMood: string;
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

export function QuickActionsGroup({ selectedMood, triggerSignUpPrompt }: QuickActionsGroupProps) {
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showDailyReflectionDialog, setShowDailyReflectionDialog] = useState(false);

  return (
    <Card className="shadow-sm border border-neutral-200 hover-lift animate-bounce-in stagger-2">
      <CardContent className="p-4 sm:p-6">
        <div className="text-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-1">
            Quick Actions
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600">
            Hover over any action for more details
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {/* Write Reflection - More specific title */}
          <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-auto p-3 sm:p-4 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press relative group"
              >
                <PenTool className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium text-xs sm:text-sm">Write Reflection</div>
                  <div className="text-xs text-neutral-500 hidden sm:block">Start a new entry</div>
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Document your parenting moments and thoughts
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

          {/* Daily Reflection */}
          <Dialog open={showDailyReflectionDialog} onOpenChange={setShowDailyReflectionDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-auto p-3 sm:p-4 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press relative group"
              >
                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                <div className="text-center">
                  <div className="font-medium text-xs sm:text-sm">Daily Reflection</div>
                  <div className="text-xs text-neutral-500 hidden sm:block">Get guided prompts</div>
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Answer thoughtful questions about your day
                  </div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Quick Daily Reflection</DialogTitle>
                <DialogDescription>
                  Take a moment to reflect on your parenting experiences today.
                </DialogDescription>
              </DialogHeader>
              <DailyReflection />
            </DialogContent>
          </Dialog>

          {/* My Profile */}
          <ParentProfileDialog
            trigger={
              <Button 
                variant="outline" 
                className="h-auto p-3 sm:p-4 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press relative group"
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium text-xs sm:text-sm">My Profile</div>
                  <div className="text-xs text-neutral-500 hidden sm:block">Parent info</div>
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Update your personal parenting information
                  </div>
                </div>
              </Button>
            }
          />

          {/* My Children */}
          <ChildProfilesDialog
            trigger={
              <Button 
                variant="outline" 
                className="h-auto p-3 sm:p-4 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press relative group"
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium text-xs sm:text-sm">My Children</div>
                  <div className="text-xs text-neutral-500 hidden sm:block">Manage profiles</div>
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Add or edit your children's profiles
                  </div>
                </div>
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}