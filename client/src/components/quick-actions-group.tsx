import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PenTool, Lightbulb, User, Users } from "lucide-react";
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
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 text-center">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <Dialog open={showDailyReflectionDialog} onOpenChange={setShowDailyReflectionDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center justify-center space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press"
              >
                <Lightbulb className="h-6 w-6 text-accent" />
                <div className="text-center">
                  <div className="font-medium text-sm">Quick Daily Reflection</div>
                  <div className="text-xs text-neutral-500">Get guided prompts</div>
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
      </CardContent>
    </Card>
  );
}