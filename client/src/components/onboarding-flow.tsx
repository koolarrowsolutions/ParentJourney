import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { User, Baby, Users, Clock, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import type { InsertParentProfile, InsertChildProfile, InsertFamily } from "@shared/schema";

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  showLaterButton?: boolean;
}

type OnboardingStep = 'welcome' | 'family' | 'parent' | 'child' | 'complete';

export function OnboardingFlow({ isOpen, onClose, onComplete, showLaterButton = false }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [familyData, setFamilyData] = useState<InsertFamily>({ name: "" });
  const [parentData, setParentData] = useState<InsertParentProfile>({
    name: "",
    age: "",
    relationship: "Primary",
    parentingStyle: "",
    parentingPhilosophy: "",
    personalityTraits: [],
    parentingGoals: "",
    stressors: [],
    supportSystems: "",
    notes: "",
    familyId: ""
  });
  const [childData, setChildData] = useState<InsertChildProfile>({
    name: "",
    dateOfBirth: "",
    gender: "",
    notes: "",
    personalityTraits: [],
    familyId: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFamilyMutation = useMutation({
    mutationFn: async (data: InsertFamily) => {
      const response = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create family");
      return response.json();
    },
    onSuccess: (family) => {
      setParentData(prev => ({ ...prev, familyId: family.id }));
      setChildData(prev => ({ ...prev, familyId: family.id }));
      setCurrentStep('parent');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create family profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createParentMutation = useMutation({
    mutationFn: async (data: InsertParentProfile) => {
      const response = await fetch("/api/parent-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create parent profile");
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep('child');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create parent profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createChildMutation = useMutation({
    mutationFn: async (data: InsertChildProfile) => {
      const response = await fetch("/api/child-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create child profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      setCurrentStep('complete');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create child profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('family');
        break;
      case 'family':
        if (familyData.name.trim()) {
          createFamilyMutation.mutate(familyData);
        }
        break;
      case 'parent':
        if (parentData.name.trim()) {
          createParentMutation.mutate(parentData);
        }
        break;
      case 'child':
        if (childData.name.trim() && childData.dateOfBirth) {
          createChildMutation.mutate(childData);
        }
        break;
      case 'complete':
        if (onComplete) {
          onComplete();
        } else {
          onClose();
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'family':
        setCurrentStep('welcome');
        break;
      case 'parent':
        setCurrentStep('family');
        break;
      case 'child':
        setCurrentStep('parent');
        break;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'family':
        return familyData.name.trim().length > 0;
      case 'parent':
        return parentData.name.trim().length > 0;
      case 'child':
        return childData.name.trim().length > 0 && childData.dateOfBirth.length > 0;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-neutral-800 mb-2">
                Welcome to ParentJourney!
              </h2>
              <p className="text-neutral-600 max-w-md mx-auto">
                Let's set up your profile to provide you with the best personalized experience. This will take just a few minutes but is important for creating tailored insights and guidance.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500 mb-6">
              <Clock className="h-4 w-4" />
              <span>Takes about 3-4 minutes</span>
            </div>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                <User className="h-3 w-3 mr-1" />
                Family Setup
              </Badge>
              <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20">
                <Baby className="h-3 w-3 mr-1" />
                Child Profiles
              </Badge>
            </div>
          </div>
        );

      case 'family':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Family Setup</h2>
              <p className="text-neutral-600">Let's start by creating your family profile</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Family Name
                </label>
                <Input
                  value={familyData.name}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="The Smith Family"
                  className="w-full"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  This helps organize multiple parents and children in your household
                </p>
              </div>
            </div>
          </div>
        );

      case 'parent':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Your Profile</h2>
              <p className="text-neutral-600">Tell us about yourself as a parent</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Your Name
                  </label>
                  <Input
                    value={parentData.name}
                    onChange={(e) => setParentData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Age (Optional)
                  </label>
                  <Input
                    value={parentData.age || ""}
                    onChange={(e) => setParentData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Your age"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Parenting Goals (Optional)
                </label>
                <Textarea
                  value={parentData.parentingGoals || ""}
                  onChange={(e) => setParentData(prev => ({ ...prev, parentingGoals: e.target.value }))}
                  placeholder="What do you hope to achieve as a parent?"
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        );

      case 'child':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Your Child</h2>
              <p className="text-neutral-600">Add your first child's profile</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Child's Name
                  </label>
                  <Input
                    value={childData.name}
                    onChange={(e) => setChildData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Child's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={childData.dateOfBirth}
                    onChange={(e) => setChildData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Notes (Optional)
                </label>
                <Textarea
                  value={childData.notes || ""}
                  onChange={(e) => setChildData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special notes about your child..."
                  className="min-h-[60px]"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  You can add more children later from the main interface
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-neutral-800 mb-2">
                Welcome to Your Parenting Journey!
              </h2>
              <p className="text-neutral-600 max-w-md mx-auto">
                Your profile is all set up. You can now start documenting your parenting experiences and receive personalized AI insights.
              </p>
            </div>
            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <p className="text-sm text-primary font-medium">
                💡 Tip: The more you journal, the better insights you'll receive about your parenting journey!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentStep === 'welcome' ? 'Getting Started' :
             currentStep === 'family' ? 'Step 1 of 3' :
             currentStep === 'parent' ? 'Step 2 of 3' :
             currentStep === 'child' ? 'Step 3 of 3' :
             'Complete!'}
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <div className="flex items-center space-x-2">
            {currentStep !== 'welcome' && currentStep !== 'complete' && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={createFamilyMutation.isPending || createParentMutation.isPending || createChildMutation.isPending}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {showLaterButton && currentStep === 'welcome' && (
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-700"
              >
                Later
              </Button>
            )}
          </div>
          
          <div className="flex-1" />
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || createFamilyMutation.isPending || createParentMutation.isPending || createChildMutation.isPending}
            className="ml-auto"
          >
            {currentStep === 'complete' ? 'Start Journaling' :
             createFamilyMutation.isPending || createParentMutation.isPending || createChildMutation.isPending ? 'Saving...' :
             currentStep === 'welcome' ? 'Let\'s Begin' : 'Next'}
            {currentStep !== 'complete' && !createFamilyMutation.isPending && !createParentMutation.isPending && !createChildMutation.isPending && (
              <ArrowRight className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}