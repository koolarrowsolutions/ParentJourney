import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PenTool, Lightbulb, BarChart3, User, Users } from "lucide-react";
import { JournalForm } from "./journal-form";
import { DailyReflection } from "./daily-reflection";
import { MoodAnalytics } from "./mood-analytics";
import { ParentProfileDialog } from "./parent-profile-dialog";
import { ChildProfilesDialog } from "./child-profiles-dialog";

interface QuickActionsGroupProps {
  selectedMood: string;
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

export function QuickActionsGroup({ selectedMood, triggerSignUpPrompt }: QuickActionsGroupProps) {
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showDailyReflection, setShowDailyReflection] = useState(false);
  const [showMoodAnalytics, setShowMoodAnalytics] = useState(false);

  return (
    <Card className="shadow-sm border border-neutral-200 hover-lift animate-bounce-in stagger-2">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 text-center">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Share Your Parenting Journey */}
          <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center justify-center space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press"
              >
                <PenTool className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium text-sm">Share Your Journey</div>
                  <div className="text-xs text-neutral-500">Write an entry</div>
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
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center justify-center space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press"
            onClick={() => setShowDailyReflection(!showDailyReflection)}
          >
            <Lightbulb className="h-6 w-6 text-accent" />
            <div className="text-center">
              <div className="font-medium text-sm">Daily Reflection</div>
              <div className="text-xs text-neutral-500">Get guided prompts</div>
            </div>
          </Button>

          {/* Mood Analytics */}
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center justify-center space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press"
            onClick={() => setShowMoodAnalytics(!showMoodAnalytics)}
          >
            <BarChart3 className="h-6 w-6 text-secondary" />
            <div className="text-center">
              <div className="font-medium text-sm">Mood Analytics</div>
              <div className="text-xs text-neutral-500">View patterns</div>
            </div>
          </Button>

          {/* My Profile */}
          <ParentProfileDialog
            trigger={
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center justify-center space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press"
              >
                <User className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium text-sm">My Profile</div>
                  <div className="text-xs text-neutral-500">Parent info</div>
                </div>
              </Button>
            }
          />

          {/* My Children */}
          <ChildProfilesDialog
            trigger={
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center justify-center space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press"
              >
                <Users className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium text-sm">My Children</div>
                  <div className="text-xs text-neutral-500">Manage profiles</div>
                </div>
              </Button>
            }
          />
        </div>

        {/* Expandable sections */}
        {showDailyReflection && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <DailyReflection />
          </div>
        )}

        {showMoodAnalytics && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <MoodAnalytics />
          </div>
        )}
      </CardContent>
    </Card>
  );
}