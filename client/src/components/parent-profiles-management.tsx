import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Plus, Edit, User, Heart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertParentProfileSchema, type InsertParentProfile, type ParentProfile } from "@shared/schema";
import { VoiceInputButton } from "./voice-input";
import { ProfilePhotoUpload } from "./profile-photo-upload";

// Enhanced personality traits with consistent format
const PERSONALITY_TRAIT_CATEGORIES = {
  communication: {
    title: "Communication Style",
    description: "How you prefer to communicate and connect",
    maxSelections: 2,
    options: [
      { key: "direct-communicator", label: "Direct Communicator", description: "Clear, straightforward communication" },
      { key: "gentle-communicator", label: "Gentle Communicator", description: "Soft, nurturing communication style" },
      { key: "active-listener", label: "Active Listener", description: "Focused on hearing and understanding" },
      { key: "expressive", label: "Expressive", description: "Openly shares emotions and thoughts" },
      { key: "encouraging", label: "Encouraging", description: "Motivates and supports others" }
    ]
  },
  parenting: {
    title: "Parenting Approach",
    description: "Your core parenting philosophy and methods",
    maxSelections: 2,
    options: [
      { key: "structured", label: "Structured", description: "Values routines and clear boundaries" },
      { key: "flexible", label: "Flexible", description: "Adapts to situations and changing needs" },
      { key: "nurturing", label: "Nurturing", description: "Focuses on emotional support and care" },
      { key: "educational", label: "Educational", description: "Emphasizes learning and development" },
      { key: "adventure-seeking", label: "Adventure-Seeking", description: "Encourages exploration and new experiences" }
    ]
  },
  emotional: {
    title: "Emotional Tendencies",
    description: "How you typically handle emotions and stress",
    maxSelections: 2,
    options: [
      { key: "patient", label: "Patient", description: "Maintains calm under pressure" },
      { key: "energetic", label: "Energetic", description: "High energy and enthusiasm" },
      { key: "reflective", label: "Reflective", description: "Takes time to think things through" },
      { key: "optimistic", label: "Optimistic", description: "Focuses on positive outcomes" },
      { key: "empathetic", label: "Empathetic", description: "Deeply understands others' feelings" }
    ]
  },
  problem_solving: {
    title: "Problem-Solving Style",
    description: "How you approach challenges and decisions",
    maxSelections: 1,
    options: [
      { key: "analytical", label: "Analytical", description: "Uses logic and data to make decisions" },
      { key: "intuitive", label: "Intuitive", description: "Relies on gut feelings and instincts" },
      { key: "collaborative", label: "Collaborative", description: "Seeks input and works with others" },
      { key: "decisive", label: "Decisive", description: "Makes quick, confident decisions" },
      { key: "research-oriented", label: "Research-Oriented", description: "Gathers information before deciding" }
    ]
  }
};

interface ParentProfileFormProps {
  editProfile?: ParentProfile;
  onSuccess: () => void;
  isAddingNew?: boolean;
}

function ParentProfileForm({ editProfile, onSuccess, isAddingNew = false }: ParentProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string[]>>(
    editProfile?.personalityTraits ? 
      (typeof editProfile.personalityTraits === 'object' ? editProfile.personalityTraits : {}) : 
      {}
  );

  const form = useForm<InsertParentProfile>({
    resolver: zodResolver(insertParentProfileSchema),
    defaultValues: {
      name: editProfile?.name || "",
      age: editProfile?.age || "",
      relationship: editProfile?.relationship || "Primary",
      parentingStyle: editProfile?.parentingStyle || "",
      parentingPhilosophy: editProfile?.parentingPhilosophy || "",
      personalityTraits: editProfile?.personalityTraits || [],
      parentingGoals: editProfile?.parentingGoals || "",
      stressors: editProfile?.stressors || [],
      supportSystems: editProfile?.supportSystems || "",
      notes: editProfile?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertParentProfile) => {
      const endpoint = editProfile && !isAddingNew ? `/api/parent-profiles/${editProfile.id}` : "/api/parent-profiles";
      const method = editProfile && !isAddingNew ? "PUT" : "POST";
      
      return apiRequest(endpoint, {
        method,
        body: JSON.stringify({ ...data, personalityTraits: selectedTraits }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parent-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parent-profile"] });
      toast({
        title: isAddingNew ? "Parent Added!" : "Profile Updated!",
        description: isAddingNew ? "New parent profile has been created successfully." : "Your profile has been updated successfully.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isAddingNew ? 'add parent' : 'update profile'}. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleTraitToggle = (category: string, traitKey: string) => {
    const categoryData = PERSONALITY_TRAIT_CATEGORIES[category as keyof typeof PERSONALITY_TRAIT_CATEGORIES];
    const currentCategoryTraits = selectedTraits[category] || [];
    
    if (currentCategoryTraits.includes(traitKey)) {
      // Remove trait
      setSelectedTraits(prev => ({
        ...prev,
        [category]: currentCategoryTraits.filter(t => t !== traitKey)
      }));
    } else {
      // Add trait (check max limit)
      if (currentCategoryTraits.length < categoryData.maxSelections) {
        setSelectedTraits(prev => ({
          ...prev,
          [category]: [...currentCategoryTraits, traitKey]
        }));
      } else {
        toast({
          title: "Selection Limit",
          description: `You can only select up to ${categoryData.maxSelections} ${category} trait(s).`,
          variant: "destructive"
        });
      }
    }
  };

  const getTotalSelectedTraits = () => {
    return Object.values(selectedTraits).reduce((total, traits) => total + traits.length, 0);
  };

  const onSubmit = (data: InsertParentProfile) => {
    if (getTotalSelectedTraits() > 7) {
      toast({
        title: "Too Many Traits",
        description: "Please select no more than 7 personality traits total.",
        variant: "destructive"
      });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter your name..." {...field} />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <VoiceInputButton
                          onTranscription={(text: string) => {
                            field.onChange(text);
                          }}
                          isInline
                        />
                      </div>
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
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your age..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship to Family</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Primary">Primary Parent</SelectItem>
                    <SelectItem value="Partner">Partner</SelectItem>
                    <SelectItem value="Co-Parent">Co-Parent</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Personality Traits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Personality Traits
            </h3>
            <Badge variant="outline">
              {getTotalSelectedTraits()}/7 selected
            </Badge>
          </div>
          
          <div className="space-y-6">
            {Object.entries(PERSONALITY_TRAIT_CATEGORIES).map(([categoryKey, category]) => (
              <div key={categoryKey} className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-medium text-neutral-800">{category.title}</h4>
                  <p className="text-sm text-neutral-600">{category.description}</p>
                  <p className="text-xs text-primary">
                    Select up to {category.maxSelections} option{category.maxSelections > 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.options.map((trait) => {
                    const isSelected = selectedTraits[categoryKey]?.includes(trait.key) || false;
                    return (
                      <Card
                        key={trait.key}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                            : 'hover:border-primary/50 hover:bg-primary/5'
                        }`}
                        onClick={() => handleTraitToggle(categoryKey, trait.key)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-neutral-800">{trait.label}</h5>
                              <p className="text-sm text-neutral-600 mt-1">{trait.description}</p>
                            </div>
                            {isSelected && (
                              <div className="ml-2 flex-shrink-0">
                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Parenting Details
          </h3>
          
          <FormField
            control={form.control}
            name="parentingGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parenting Goals</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea 
                      placeholder="What are your main goals as a parent?"
                      className="min-h-[80px] pr-12"
                      {...field} 
                    />
                    <div className="absolute right-2 top-2">
                      <VoiceInputButton
                        onTranscription={(text: string) => {
                          const currentValue = field.value || '';
                          field.onChange(currentValue + (currentValue ? ' ' : '') + text);
                        }}
                        isInline
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea 
                      placeholder="Any additional information about yourself..."
                      className="min-h-[80px] pr-12"
                      {...field} 
                    />
                    <div className="absolute right-2 top-2">
                      <VoiceInputButton
                        onTranscription={(text: string) => {
                          const currentValue = field.value || '';
                          field.onChange(currentValue + (currentValue ? ' ' : '') + text);
                        }}
                        isInline
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? "Saving..." : (isAddingNew ? "Add Parent" : "Update Profile")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function ParentProfilesManagement() {
  const [showAddParent, setShowAddParent] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);

  // Fetch parent profiles (assuming multiple parents possible)
  const { data: parentProfiles = [] } = useQuery<ParentProfile[]>({
    queryKey: ["/api/parent-profiles"],
  });

  const { data: currentParentProfile } = useQuery<ParentProfile>({
    queryKey: ["/api/parent-profile"],
  });

  const handleProfilePhotoUpdate = (photoUrl: string) => {
    // Handle photo update logic
    console.log('Photo updated:', photoUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-800">Parent Profiles</h2>
        <div className="flex gap-2">
          <Dialog open={showUpdateProfile} onOpenChange={setShowUpdateProfile}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover-scale">
                <Edit className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Your Profile</DialogTitle>
              </DialogHeader>
              <ParentProfileForm 
                editProfile={currentParentProfile} 
                onSuccess={() => setShowUpdateProfile(false)}
                isAddingNew={false}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showAddParent} onOpenChange={setShowAddParent}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                Add Parent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Parent</DialogTitle>
              </DialogHeader>
              <ParentProfileForm 
                onSuccess={() => setShowAddParent(false)}
                isAddingNew={true}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Parent Profile Display */}
      {currentParentProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <ProfilePhotoUpload
                currentPhotoUrl={currentParentProfile.profilePhoto}
                onPhotoUpdate={handleProfilePhotoUpdate}
                profileName={currentParentProfile.name}
                isChild={false}
              />
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800">{currentParentProfile.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
                    <span>{currentParentProfile.age} years old</span>
                    <Badge variant="outline">{currentParentProfile.relationship}</Badge>
                  </div>
                </div>

                {currentParentProfile.parentingGoals && (
                  <div>
                    <h4 className="font-medium text-neutral-700 mb-1">Parenting Goals</h4>
                    <p className="text-sm text-neutral-600">{currentParentProfile.parentingGoals}</p>
                  </div>
                )}

                {currentParentProfile.personalityTraits && Object.keys(currentParentProfile.personalityTraits).length > 0 && (
                  <div>
                    <h4 className="font-medium text-neutral-700 mb-2">Personality Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(currentParentProfile.personalityTraits).map(([category, traits]) => 
                        (traits as string[]).map((trait) => (
                          <Badge key={`${category}-${trait}`} variant="secondary" className="text-xs">
                            {trait.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Parent Profiles */}
      {parentProfiles.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Other Parents ({parentProfiles.length - 1})</h3>
          <div className="grid gap-4">
            {parentProfiles
              .filter(parent => parent.id !== currentParentProfile?.id)
              .map((parent) => (
                <Card key={parent.id} className="border-neutral-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <ProfilePhotoUpload
                        currentPhotoUrl={parent.profilePhoto}
                        onPhotoUpdate={handleProfilePhotoUpdate}
                        profileName={parent.name}
                        isChild={false}
                      />
                      <div>
                        <h4 className="font-medium text-neutral-800">{parent.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
                          <span>{parent.age} years old</span>
                          <Badge variant="outline" className="text-xs">{parent.relationship}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}