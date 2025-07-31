import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Book, Settings } from "lucide-react";
import { markSignedUp } from "@/utils/onboarding-storage";

interface SignUpPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  trigger: 'save' | 'bookmark' | 'export' | 'settings';
}

const TRIGGER_MESSAGES = {
  save: "Want to save your progress and keep your journal entries secure?",
  bookmark: "Want to save your favorite entries and access them anytime?",
  export: "Want to export your entries and unlock premium features?",
  settings: "Want to personalize your experience and save your preferences?"
};

const TRIGGER_ICONS = {
  save: Heart,
  bookmark: Book,
  export: Sparkles,
  settings: Settings
};

export function SignUpPrompt({ isOpen, onClose, onSignUp, trigger }: SignUpPromptProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleSignUp = () => {
    setIsAnimating(true);
    markSignedUp();
    setTimeout(() => {
      onSignUp();
      onClose();
    }, 300);
  };

  const handleMaybeLater = () => {
    onClose();
  };

  const Icon = TRIGGER_ICONS[trigger];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold text-neutral-800">
            {TRIGGER_MESSAGES[trigger]}
          </DialogTitle>
          <DialogDescription className="text-neutral-600 mt-2">
            Create a free account to unlock your full parenting journey experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-neutral-700">Save and sync all your journal entries</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-neutral-700">Get personalized AI insights and feedback</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-neutral-700">Access analytics and mood tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-neutral-700">Export entries and manage child profiles</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col space-y-3">
          <Button 
            onClick={handleSignUp}
            className={`w-full ${isAnimating ? 'animate-pulse' : ''}`}
            disabled={isAnimating}
          >
            {isAnimating ? 'Setting up your account...' : 'Sign Up - It\'s Free!'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleMaybeLater}
            className="w-full text-neutral-600 hover:text-neutral-800"
            disabled={isAnimating}
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-neutral-500 text-center mt-4">
          No spam, no hassle. Just a better parenting journal experience.
        </p>
      </DialogContent>
    </Dialog>
  );
}