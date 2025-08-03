import { useState, useEffect } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertParentProfileSchema, type InsertParentProfile, type ParentProfile } from "@shared/schema";
import { PARENT_PERSONALITY_TRAITS, PARENTING_STYLES, COMMON_STRESSORS, getParentTraitsByCategory, getParentTraitByKey, PARENT_TRAIT_CATEGORIES } from "@shared/parent-traits";
import { User, Edit, Sparkles, Heart, Target, Shield, Users2, Plus, X } from "lucide-react";
import { VoiceInputButton } from "./voice-input";

interface ParentProfileDialogProps {
  trigger?: React.ReactNode;
}

function ParentProfileForm({ existingProfile, onSuccess }: { existingProfile?: ParentProfile; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTraits, setSelectedTraits] = useState<string[]>(existingProfile?.personalityTraits || []);
  const [selectedStressors, setSelectedStressors] = useState<string[]>(existingProfile?.stressors || []);
  const [activeCategory, setActiveCategory] = useState<string>(PARENT_TRAIT_CATEGORIES[0]);

  const form = useForm<InsertParentProfile>({
    resolver: zodResolver(insertParentProfileSchema),
    defaultValues: {
      name: existingProfile?.name ?? "",
      age: existingProfile?.age ?? "",
      parentingStyle: existingProfile?.parentingStyle ?? "",
      parentingPhilosophy: existingProfile?.parentingPhilosophy ?? "",
      personalityTraits: existingProfile?.personalityTraits ?? [],
      parentingGoals: existingProfile?.parentingGoals ?? "",
      stressors: existingProfile?.stressors ?? [],
      supportSystems: existingProfile?.supportSystems ?? "",
      notes: existingProfile?.notes ?? "",
    },
  });

  useEffect(() => {
    if (existingProfile) {
      setSelectedTraits(existingProfile.personalityTraits || []);
      setSelectedStressors(existingProfile.stressors || []);
    }
  }, [existingProfile]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertParentProfile) => {
      const response = await apiRequest("POST", "/api/parent-profile", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-profile"] });
      toast({
        title: "✨ Profile Created!",
        description: "Your parent profile has been created successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Profile creation error:", error);
      toast({
        title: "❌ Creation Failed",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertParentProfile>) => {
      const response = await apiRequest("PATCH", "/api/parent-profile", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-profile"] });
      toast({
        title: "✨ Profile Updated!",
        description: "Your parent profile has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "❌ Update Failed",
        description: `Failed to update your profile. Error: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleTraitToggle = (traitKey: string) => {
    const newTraits = selectedTraits.includes(traitKey)
      ? selectedTraits.filter(t => t !== traitKey)
      : [...selectedTraits, traitKey];
    
    if (newTraits.length <= 7) { // Limit to 7 traits
      setSelectedTraits(newTraits);
      form.setValue("personalityTraits", newTraits);
    }
  };

  const handleStressorToggle = (stressor: string) => {
    const newStressors = selectedStressors.includes(stressor)
      ? selectedStressors.filter(s => s !== stressor)
      : [...selectedStressors, stressor];
    
    setSelectedStressors(newStressors);
    form.setValue("stressors", newStressors);
  };

  const onSubmit = (data: InsertParentProfile) => {
    const profileData = {
      ...data,
      personalityTraits: selectedTraits,
      stressors: selectedStressors,
    };

    if (existingProfile) {
      updateProfileMutation.mutate(profileData);
    } else {
      createProfileMutation.mutate(profileData);
    }
  };

  const isLoading = createProfileMutation.isPending || updateProfileMutation.isPending;
  const categoryTraits = getParentTraitsByCategory(activeCategory);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-sky-200">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium text-sky-800 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter your name" 
                          className="pr-12"
                          {...field}
                          value={field.value ?? ""}
                        />
                        <VoiceInputButton
                          onTranscription={(transcript: string) => {
                            field.onChange(transcript);
                          }}
                          isInline
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 32"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parentingStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parenting Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your parenting style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PARENTING_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-neutral-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Personality Traits */}
        <Card className="border-sky-200">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sky-800 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Your Personality Traits
              </h3>
              <Badge variant="outline" className="text-xs">
                {selectedTraits.length}/7 selected
              </Badge>
            </div>

            {/* Step 1: Category Selection */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">
                Step 1: Please select a category below
              </h4>
              <div className="flex flex-wrap gap-2">
                {PARENT_TRAIT_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={activeCategory === category ? "default" : "outline"}
                    onClick={() => setActiveCategory(category)}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Step 2: Trait Selection */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">
                Step 2: Choose the ones that most closely fit your personality
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryTraits.map((trait) => {
                const isSelected = selectedTraits.includes(trait.key);
                return (
                  <Button
                    key={trait.key}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    
                    onClick={() => handleTraitToggle(trait.key)}
                    className={`justify-start text-left h-auto p-3 ${
                      isSelected ? "bg-sky-600 text-white" : "hover:bg-sky-50"
                    }`}
                    disabled={!isSelected && selectedTraits.length >= 7}
                  >
                    <div>
                      <div className="font-medium text-sm">{trait.label}</div>
                      <div className="text-xs opacity-80">{trait.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Selected Traits Display */}
            {selectedTraits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-sky-700 mb-2">Selected Traits:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTraits.map((traitKey) => {
                    const trait = getParentTraitByKey(traitKey);
                    return (
                      <Badge
                        key={traitKey}
                        variant="secondary"
                        className="bg-sky-100 text-sky-800 hover:bg-sky-200"
                      >
                        {trait?.label}
                        <Button
                          type="button"
                          variant="ghost"
                          
                          className="h-4 w-4 p-0 ml-1 hover:bg-sky-200"
                          onClick={() => handleTraitToggle(traitKey)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          </CardContent>
        </Card>

        {/* Parenting Philosophy & Goals */}
        <Card className="border-sky-200">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium text-sky-800 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Philosophy & Goals
            </h3>

            <FormField
              control={form.control}
              name="parentingPhilosophy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Parenting Philosophy</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Describe your approach to parenting, core beliefs, and values..."
                        className="min-h-[80px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                      <VoiceInputButton
                        onTranscription={(transcript: string) => {
                          const currentValue = field.value ?? "";
                          const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
                          field.onChange(newValue);
                        }}
                        className="self-start"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentingGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What You Hope to Achieve as a Parent</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="What kind of person do you want to help your child become? What values do you want to instill?"
                        className="min-h-[80px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                      <VoiceInputButton
                        onTranscription={(transcript: string) => {
                          const currentValue = field.value ?? "";
                          const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
                          field.onChange(newValue);
                        }}
                        
                        className="self-start"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Common Stressors */}
        <Card className="border-sky-200">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium text-sky-800 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Common Parenting Stressors
            </h3>
            <p className="text-sm text-sky-600">Select the situations that tend to challenge you most:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_STRESSORS.map((stressor) => {
                const isSelected = selectedStressors.includes(stressor);
                return (
                  <Button
                    key={stressor}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    
                    onClick={() => handleStressorToggle(stressor)}
                    className={`justify-start text-left ${
                      isSelected ? "bg-sky-600 text-white" : "hover:bg-sky-50"
                    }`}
                  >
                    {stressor}
                  </Button>
                );
              })}
            </div>

            <FormField
              control={form.control}
              name="supportSystems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Support Systems</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Who or what helps you when parenting gets tough? (family, friends, community, professionals, etc.)"
                        className="min-h-[60px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                      <VoiceInputButton
                        onTranscription={(transcript: string) => {
                          const currentValue = field.value ?? "";
                          const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
                          field.onChange(newValue);
                        }}
                        
                        className="self-start"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="border-sky-200">
          <CardContent className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Any other details about your parenting style, preferences, or circumstances that might help with AI analysis..."
                        className="min-h-[60px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                      <VoiceInputButton
                        onTranscription={(transcript: string) => {
                          const currentValue = field.value ?? "";
                          const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
                          field.onChange(newValue);
                        }}
                        
                        className="self-start"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            {isLoading ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function ParentProfileDialog({ trigger }: ParentProfileDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: parentProfile } = useQuery<ParentProfile>({
    queryKey: ["/api/parent-profile"],
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start p-3 h-auto border-neutral-200 hover:border-primary hover:bg-primary/5 hover-lift button-press interactive-card">
            <User className="text-primary mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium text-neutral-800">My Profile</div>
              <div className="text-xs text-neutral-500">
                {parentProfile ? "Update your information" : "Set up your parent profile"}
              </div>
            </div>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="mr-2 h-5 w-5 text-primary" />
            {parentProfile ? "Update Your Profile" : "Create Your Parent Profile"}
          </DialogTitle>
          <DialogDescription>
            {parentProfile 
              ? "Update your parenting information to improve AI analysis and recommendations."
              : "Tell us about yourself as a parent to get personalized AI insights and feedback."
            }
          </DialogDescription>
        </DialogHeader>
        <ParentProfileForm 
          existingProfile={parentProfile} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}