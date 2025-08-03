import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";
import { ParentProfileDialog } from "./parent-profile-dialog";
import { ChildProfilesDialog } from "./child-profiles-dialog";

interface QuickActionsGroupProps {
  selectedMood: string;
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

export function QuickActionsGroup({ selectedMood, triggerSignUpPrompt }: QuickActionsGroupProps) {
  return (
    <Card className="shadow-sm border border-neutral-200 hover-lift animate-bounce-in stagger-2">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4 text-center">
          Family Profiles
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">

          {/* My Profile */}
          <ParentProfileDialog
            trigger={
              <Button 
                variant="outline" 
                className="h-20 sm:h-24 p-3 sm:p-4 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press w-full"
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <div className="text-center">
                  <div className="font-medium text-xs sm:text-sm leading-tight">My Profile</div>
                  <div className="text-xs text-neutral-500 leading-tight mt-0.5">Manage parent info</div>
                </div>
              </Button>
            }
          />

          {/* My Children */}
          <ChildProfilesDialog
            trigger={
              <Button 
                variant="outline" 
                className="h-20 sm:h-24 p-3 sm:p-4 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press w-full"
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <div className="text-center">
                  <div className="font-medium text-xs sm:text-sm leading-tight">My Children</div>
                  <div className="text-xs text-neutral-500 leading-tight mt-0.5">Manage child profiles</div>
                </div>
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}