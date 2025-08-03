import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { User, Baby, Users, Clock, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import type { InsertParentProfile, InsertChildProfile, InsertFamily } from "@shared/schema";

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  showLaterButton?: boolean;
}

type OnboardingStep = 'welcome' | 'privacy' | 'family' | 'parent' | 'child' | 'complete';

export function OnboardingFlow({ isOpen, onClose, onComplete, showLaterButton = false }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
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
  const { isAuthenticated } = useAuth();
  
  // Check if we're in demo mode (testing without authentication)
  const isDemoMode = !isAuthenticated;

  const createFamilyMutation = useMutation({
    mutationFn: async (data: InsertFamily) => {
      // In demo mode, simulate family creation
      if (isDemoMode) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: "demo-family-id", name: data.name });
          }, 500);
        });
      }
      
      const token = localStorage.getItem('parentjourney_token');
      const response = await fetch("/api/families", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
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
        description: isDemoMode ? "Demo mode error" : "Failed to create family profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createParentMutation = useMutation({
    mutationFn: async (data: InsertParentProfile) => {
      // In demo mode, simulate parent profile creation
      if (isDemoMode) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: "demo-parent-id", ...data });
          }, 500);
        });
      }
      
      const token = localStorage.getItem('parentjourney_token');
      const response = await fetch("/api/parent-profiles", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
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
        description: isDemoMode ? "Demo mode error" : "Failed to create parent profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createChildMutation = useMutation({
    mutationFn: async (data: InsertChildProfile) => {
      // In demo mode, simulate child profile creation
      if (isDemoMode) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: "demo-child-id", ...data });
          }, 500);
        });
      }
      
      const token = localStorage.getItem('parentjourney_token');
      const response = await fetch("/api/child-profiles", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create child profile");
      return response.json();
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["/api/parent-profiles"] });
        queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      }
      setCurrentStep('complete');
    },
    onError: () => {
      toast({
        title: "Error",
        description: isDemoMode ? "Demo mode error" : "Failed to create child profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('privacy');
        break;
      case 'privacy':
        if (privacyAccepted) {
          setCurrentStep('family');
        }
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
      case 'privacy':
        setCurrentStep('welcome');
        break;
      case 'family':
        setCurrentStep('privacy');
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
      case 'privacy':
        return privacyAccepted;
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
            {isDemoMode && (
              <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> This is a preview of the onboarding experience. No data will be saved.
                </p>
              </div>
            )}
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
            <div className="flex justify-center space-x-4 mb-4">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                <User className="h-3 w-3 mr-1" />
                Family Setup
              </Badge>
              <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20">
                <Baby className="h-3 w-3 mr-1" />
                Child Profiles
              </Badge>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-600">
              You can skip this setup and complete your profile information later in the main app
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Privacy & Data Usage</h2>
              <p className="text-neutral-600">Important information about how we handle your data</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-900 mb-3">AI-Powered Insights</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  ParentJourney uses OpenAI's advanced AI technology to provide personalized parenting insights, 
                  mood analysis, and developmental guidance. To deliver these features, your journal entries, 
                  family information, and child profiles are securely processed by OpenAI's systems.
                </p>
                
                <div className="bg-blue-100 rounded-md p-4 mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">What we share with AI services:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Journal entries and reflections</li>
                    <li>• Child profiles and developmental information</li>
                    <li>• Parent profiles and family dynamics</li>
                    <li>• Milestone tracking and progress data</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-md p-4 border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Your data protection:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• No personal health information is stored permanently</li>
                    <li>• Data is encrypted and transmitted securely</li>
                    <li>• You can delete your data at any time</li>
                    <li>• We follow industry-standard privacy practices</li>
                  </ul>
                </div>

                <p className="text-xs text-neutral-600 mt-4">
                  By continuing, you acknowledge that you understand and consent to this data processing. 
                  You can review our full{" "}
                  <button 
                    onClick={() => window.open('/privacy-policy', '_blank')}
                    className="text-primary underline hover:text-primary/80"
                  >
                    Privacy Policy
                  </button>
                  {" "}for complete details.
                </p>

                <div className="flex items-start space-x-3 mt-6">
                  <input
                    type="checkbox"
                    id="privacy-consent"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="privacy-consent" className="text-sm text-neutral-700 leading-relaxed">
                    I understand and consent to sharing my family information with OpenAI for AI-powered 
                    parenting insights and analysis. I acknowledge that this helps provide personalized 
                    recommendations and developmental guidance.
                  </label>
                </div>
              </div>
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
            {isDemoMode && (
              <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Demo Complete!</strong> You've experienced the full onboarding flow. To actually create an account, click "Get Started" and sign up.
                </p>
              </div>
            )}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-neutral-800 mb-2">
                {isDemoMode ? "Demo Complete!" : "Welcome to Your Parenting Journey!"}
              </h2>
              <p className="text-neutral-600 max-w-md mx-auto">
                {isDemoMode 
                  ? "You've seen how easy it is to set up your profile. Ready to start your real parenting journey with us?"
                  : "Your profile is all set up. You can now start documenting your parenting experiences and receive personalized AI insights."
                }
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
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
                I'll complete my info in the app
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