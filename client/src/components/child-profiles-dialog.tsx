import { useState, useRef, useEffect } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertChildProfileSchema, type InsertChildProfile, type ChildProfile } from "@shared/schema";
import { PERSONALITY_TRAITS, getTraitsByAge, getTraitByKey, type PersonalityTrait } from "@shared/personality-traits";
import { Users, Plus, Edit, Trash2, Baby, Calendar, User, Sparkles } from "lucide-react";
import { calculateDevelopmentalStage, formatAge, DEVELOPMENTAL_STAGES } from "@/utils/developmental-stages";
import { UpdateTraitsDialog } from "./update-traits-dialog";
import { VoiceInputButton } from "./voice-input";

interface ChildProfileDialogProps {
  trigger?: React.ReactNode;
  editProfile?: ChildProfile;
  onClose?: () => void;
}

function ChildProfileForm({ editProfile, onSuccess }: { editProfile?: ChildProfile; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTraits, setSelectedTraits] = useState<string[]>(editProfile?.personalityTraits || []);
  const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1);
  const [justCreatedChild, setJustCreatedChild] = useState<string | null>(null);
  const traitsScrollRef = useRef<HTMLDivElement>(null);

  const form = useForm<InsertChildProfile>({
    resolver: zodResolver(insertChildProfileSchema),
    defaultValues: {
      name: editProfile?.name || "",
      dateOfBirth: editProfile?.dateOfBirth || "",
      pronouns: editProfile?.pronouns || "",
      gender: editProfile?.gender || "",
      developmentalStage: editProfile?.developmentalStage || "",
      notes: editProfile?.notes || "",
      personalityTraits: editProfile?.personalityTraits || [],
    },
  });

  // Update selectedTraits when editProfile changes (for editing different profiles)
  React.useEffect(() => {
    if (editProfile?.personalityTraits) {
      setSelectedTraits(editProfile.personalityTraits);
    } else {
      setSelectedTraits([]);
    }
  }, [editProfile]);

  // Handle scroll indicator fade
  useEffect(() => {
    const scrollContainer = traitsScrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll <= 0) {
        setScrollIndicatorOpacity(0);
        return;
      }
      
      // Fade out based on scroll progress (fade completely after 20% scroll)
      const scrollProgress = scrollTop / maxScroll;
      const opacity = Math.max(0, 1 - (scrollProgress * 5)); // Multiplied by 5 to fade out faster
      setScrollIndicatorOpacity(opacity);
    };

    // Initial check
    handleScroll();
    
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: InsertChildProfile) => {
      const response = await apiRequest("POST", "/api/child-profiles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      const childName = form.getValues().name;
      setJustCreatedChild(childName);
      toast({
        title: "Profile Created! 👶",
        description: `${childName}'s profile has been saved successfully.`,
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create child profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertChildProfile) => {
      const response = await apiRequest("PUT", `/api/child-profiles/${editProfile!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      toast({
        title: "Profile Updated! ✨",
        description: "Your child's profile has been updated successfully.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update child profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertChildProfile) => {
    const submissionData = {
      ...data,
      personalityTraits: selectedTraits,
    };
    
    if (editProfile) {
      updateMutation.mutate(submissionData);
    } else {
      createMutation.mutate(submissionData);
    }
  };

  const toggleTrait = (traitKey: string) => {
    setSelectedTraits(prev => {
      if (prev.includes(traitKey)) {
        return prev.filter(key => key !== traitKey);
      } else if (prev.length < 7) {
        return [...prev, traitKey];
      } else {
        toast({
          title: "Maximum Traits Selected",
          description: "You can select up to 7 personality traits that best describe your child.",
          variant: "destructive",
        });
        return prev;
      }
    });
  };

  const getRelevantTraits = (): PersonalityTrait[] => {
    const dateOfBirth = form.watch('dateOfBirth');
    if (!dateOfBirth) return PERSONALITY_TRAITS;
    
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    
    return getTraitsByAge(Math.max(0, months));
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
    }
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} old`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-700">
                👶 Child's Name <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter your child's name..."
                    className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                    {...field}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceInputButton
                      onTranscript={(text) => {
                        const currentValue = field.value || '';
                        field.onChange(currentValue + (currentValue ? ' ' : '') + text);
                      }}
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
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-700">
                🎂 Date of Birth <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onDateChange={(date) => {
                    field.onChange(date ? date.toISOString().split('T')[0] : "");
                  }}
                  placeholder="Select date of birth..."
                  className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </FormControl>
              {field.value && (
                <p className="text-xs text-neutral-500">
                  Currently {calculateAge(field.value)}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pronouns"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-700">
                  🗣️ Pronouns <span className="text-neutral-400">(optional)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="e.g., they/them, she/her, he/him" 
                      className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                      {...field} 
                      value={field.value || ""} 
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <VoiceInputButton
                        onTranscript={(text) => {
                          const currentValue = field.value || '';
                          field.onChange(currentValue + (currentValue ? ' ' : '') + text);
                        }}
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
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-700">
                  ⚤ Gender <span className="text-neutral-400">(optional)</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="border-neutral-200 focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select gender..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">👦 Boy</SelectItem>
                    <SelectItem value="female">👧 Girl</SelectItem>
                    <SelectItem value="other">🌈 Other</SelectItem>
                    <SelectItem value="not_specified">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="developmentalStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-700">
                🎯 Developmental Stage <span className="text-neutral-400">(auto-calculated)</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="border-neutral-200 focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Auto-calculate from age..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="auto">Auto-calculate from age</SelectItem>
                  {DEVELOPMENTAL_STAGES.map((stage) => (
                    <SelectItem key={stage.key} value={stage.key}>
                      {stage.label} ({stage.ageRange})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium text-neutral-700">
                  📝 Notes <span className="text-neutral-400">(optional)</span>
                </FormLabel>
                <VoiceInputButton
                  onTranscript={(text) => {
                    const currentValue = field.value || '';
                    field.onChange(currentValue + (currentValue ? ' ' : '') + text);
                  }}
                />
              </div>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Any special notes about your child's personality, interests, developmental milestones, or anything you'd like to remember..."
                  className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="text-sm font-medium text-neutral-700 mb-3 block">
            ✨ Personality Traits <span className="text-neutral-400">(select up to 7)</span>
          </FormLabel>
          <p className="text-xs text-neutral-500 mb-4">
            Choose traits that best describe your child's personality. This helps provide more personalized parenting insights.
            {editProfile && (
              <span className="block mt-1 text-amber-600">
                💡 Update traits as your child grows and develops - personality can evolve over time!
              </span>
            )}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Click trait buttons to select them. We have {PERSONALITY_TRAITS.length} different traits to choose from! These help provide more personalized developmental insights.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">
                Selected: {selectedTraits.length}/7
              </span>
              {selectedTraits.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTraits([])}
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="relative">
              <div 
                ref={traitsScrollRef}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-3 border border-neutral-200 rounded-lg bg-neutral-50/50"
              >
                {getRelevantTraits().map((trait) => (
                  <button
                    key={trait.key}
                    type="button"
                    onClick={() => toggleTrait(trait.key)}
                    className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 min-h-[80px] flex flex-col justify-start ${
                      selectedTraits.includes(trait.key)
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-neutral-200 bg-white hover:bg-neutral-50 hover:shadow-sm"
                    }`}
                    title={trait.description}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-3 flex-shrink-0">{trait.emoji}</span>
                      <span className="font-medium text-sm leading-tight">{trait.label}</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 flex-1">
                      {trait.description}
                    </p>
                  </button>
                ))}
              </div>
              {/* Scroll indicator with fade effect */}
              <div 
                className="absolute bottom-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs text-neutral-500 border border-neutral-200 shadow-sm transition-opacity duration-300 pointer-events-none"
                style={{ opacity: scrollIndicatorOpacity }}
              >
                Scroll for more ↓
              </div>
            </div>
            
            {selectedTraits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTraits.map((traitKey) => {
                  const trait = getTraitByKey(traitKey);
                  return trait ? (
                    <Badge
                      key={traitKey}
                      variant="secondary"
                      className="text-xs"
                    >
                      {trait.emoji} {trait.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-primary text-white hover:bg-primary/90"
          >
            {editProfile ? "💾 Update Profile" : "➕ Add Child Profile"}
          </Button>
        </div>
        
        {/* Add Another Child Button - appears after successful creation */}
        {!editProfile && justCreatedChild && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Great! {justCreatedChild}'s profile was created successfully.
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Want to add another child?
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.reset();
                  setSelectedTraits([]);
                  setJustCreatedChild(null);
                }}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Child
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}

export function ChildProfilesDialog({ trigger, editProfile, onClose }: ChildProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | undefined>(editProfile);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/child-profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      toast({
        title: "Profile Deleted",
        description: "The child profile has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setSelectedProfile(undefined);
    onClose?.();
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
    }
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} old`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            👶 My Children
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Users className="mr-2 h-5 w-5 text-primary" />
            👪 Manage Child Profiles
          </DialogTitle>
          <DialogDescription>
            Create and manage profiles for your children to get personalized parenting insights and track their development journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          <Card className="border border-neutral-200">
            <CardContent className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  {selectedProfile ? "✏️ Edit Profile" : "➕ Add New Child"}
                </h3>
                {!selectedProfile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-800">
                      <strong>👶 Adding multiple children:</strong> You can add as many child profiles as you need! Each child gets their own personality profile with {PERSONALITY_TRAITS.length} trait options and personalized developmental insights.
                    </p>
                  </div>
                )}
              </div>
              <ChildProfileForm
                editProfile={selectedProfile}
                onSuccess={() => {
                  setSelectedProfile(undefined);
                  if (editProfile) handleClose();
                }}
              />
              {selectedProfile && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedProfile(undefined)}
                  className="mt-4"
                >
                  Cancel Edit
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Existing Profiles */}
          <div>
            <h3 className="text-lg font-medium text-neutral-800 mb-4">
              📋 Your Children
            </h3>
            {isLoading ? (
              <div className="text-center py-8 text-neutral-500">
                Loading profiles...
              </div>
            ) : profiles && profiles.length > 0 ? (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="border border-neutral-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Baby className="mr-2 h-4 w-4 text-primary" />
                            <h4 className="font-medium text-neutral-800">
                              {profile.name}
                            </h4>
                            {profile.gender && (
                              <span className="ml-2 text-sm text-neutral-500">
                                {profile.gender === "male" ? "👦" : profile.gender === "female" ? "👧" : "🌈"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-neutral-600 mb-2">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>{formatAge(profile.dateOfBirth)}</span>
                            {profile.pronouns && (
                              <span className="ml-2 text-neutral-500">• {profile.pronouns}</span>
                            )}
                          </div>
                          {(() => {
                            const stage = profile.developmentalStage 
                              ? DEVELOPMENTAL_STAGES.find(s => s.key === profile.developmentalStage)
                              : calculateDevelopmentalStage(profile.dateOfBirth);
                            return stage ? (
                              <div className="text-xs text-primary font-medium mb-2">
                                {stage.label} ({stage.ageRange})
                              </div>
                            ) : null;
                          })()}
                          {profile.notes && (
                            <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                              {profile.notes}
                            </p>
                          )}
                          {profile.personalityTraits && profile.personalityTraits.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {profile.personalityTraits.slice(0, 4).map((traitKey) => {
                                const trait = getTraitByKey(traitKey);
                                return trait ? (
                                  <Badge
                                    key={traitKey}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {trait.emoji} {trait.label}
                                  </Badge>
                                ) : null;
                              })}
                              {profile.personalityTraits.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{profile.personalityTraits.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <UpdateTraitsDialog
                            profile={profile}
                            trigger={
                              <Button variant="outline" size="sm" title="Update personality traits">
                                <Sparkles className="h-3 w-3" />
                              </Button>
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProfile(profile)}
                            title="Edit profile details"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(profile.id)}
                            disabled={deleteMutation.isPending}
                            title="Delete profile"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Baby className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
                <p>👶 No child profiles yet.</p>
                <p className="text-sm">Add your first child profile above to get personalized developmental insights!</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}