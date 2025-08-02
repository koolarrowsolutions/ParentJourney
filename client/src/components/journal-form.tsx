import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { TooltipWrapper } from "./tooltip-wrapper";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { journalEntryWithAiSchema, type JournalEntryWithAi, type ChildProfile } from "@shared/schema";
import { getRandomPrompt } from "@shared/prompts";
import { getLoginGreeting } from "@shared/greetings";
import { getSettings } from "@/utils/settings-storage";
import { PenTool, Save, Sparkles, Loader2, Bot, Lightbulb, Heart, Star, Baby, Users, GraduationCap, RefreshCw, Camera, X } from "lucide-react";
import { ChildProfilesDialog } from "./child-profiles-dialog";
import { CalmReset } from "./calm-reset";
import { VoiceInput } from "./voice-input";
import { SparklyStarsLoader } from "@/components/ui/sparkly-stars-loader";

const MOODS = [
  { emoji: "😊", label: "Happy", value: "😊" },
  { emoji: "😰", label: "Stressed", value: "😰" },
  { emoji: "😴", label: "Tired", value: "😴" },
  { emoji: "🤔", label: "Thoughtful", value: "🤔" },
  { emoji: "😅", label: "Overwhelmed", value: "😅" },
  { emoji: "🥰", label: "Grateful", value: "🥰" },
  { emoji: "😔", label: "Sad", value: "😔" },
  { emoji: "😤", label: "Frustrated", value: "😤" },
  { emoji: "😌", label: "Calm", value: "😌" },
  { emoji: "😕", label: "Worried", value: "😕" },
];



interface AiFeedbackDisplayProps {
  feedback: string;
}

interface DevelopmentalInsightDisplayProps {
  insight: string;
  childName?: string;
}

function DevelopmentalInsightDisplay({ insight, childName }: DevelopmentalInsightDisplayProps) {
  return (
    <div className="mt-4 p-6 bg-gradient-accent rounded-lg border border-accent/20">
      <div className="flex items-start">
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
          <GraduationCap className="text-white h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-neutral-800 mb-2">
            Developmental Insight {childName && `for ${childName}`}
          </h4>
          <div className="text-neutral-700 leading-relaxed">
            {insight}
          </div>
        </div>
      </div>
    </div>
  );
}

function AiFeedbackDisplay({ feedback }: AiFeedbackDisplayProps) {
  const sections = feedback.split('\n\n').filter(section => section.trim());
  
  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-neutral-800">
          Your AI Parenting Coach
        </h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          Personalized Insights
        </Badge>
      </div>
      
      <div className="space-y-4">
        {sections.map((section, index) => {
          if (!section.includes(':')) return null;
          
          const [title, ...contentParts] = section.split(':');
          const content = contentParts.join(':').trim();
          
          let icon, bgColor, borderColor, description;
          if (title.includes('Encouragement')) {
            icon = <Heart className="text-pink-600 mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
            bgColor = "bg-pink-50";
            borderColor = "border-l-pink-400";
            description = "Emotional validation and support";
          } else if (title.includes('Insight')) {
            icon = <Lightbulb className="text-amber-600 mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
            bgColor = "bg-amber-50";
            borderColor = "border-l-amber-400";
            description = "A fresh perspective on your situation";
          } else if (title.includes('Suggestion')) {
            icon = <Star className="text-blue-600 mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
            bgColor = "bg-blue-50";
            borderColor = "border-l-blue-400";
            description = "Actionable parenting guidance";
          } else {
            icon = <Sparkles className="text-neutral-600 mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
            bgColor = "bg-neutral-50";
            borderColor = "border-l-neutral-400";
            description = "AI guidance";
          }
          
          return (
            <div key={index} className={`p-4 ${bgColor} rounded-lg border-l-4 ${borderColor} hover-lift transition-all duration-200`}>
              <div className="flex">
                {icon}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-800">
                      {title.replace(/\*\*/g, '').trim()}
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {description}
                    </span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">
                    {content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-xs text-neutral-600 flex items-center">
          <Sparkles className="h-3 w-3 mr-1" />
          These insights are generated based on your entry and child's developmental stage. 
          Remember, you know your child best.
        </p>
      </div>
    </div>
  );
}

interface JournalFormProps {
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
  selectedMood?: string;
}

export function JournalForm({ triggerSignUpPrompt, selectedMood = "" }: JournalFormProps) {

  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [isSubmittingWithAI, setIsSubmittingWithAI] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [developmentalInsight, setDevelopmentalInsight] = useState<string>("");
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>(() => getRandomPrompt());
  const [loginGreeting] = useState<string>(() => getLoginGreeting());
  const [isCalmResetOpen, setIsCalmResetOpen] = useState(false);
  const [settings] = useState(() => getSettings());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  const form = useForm<JournalEntryWithAi>({
    resolver: zodResolver(journalEntryWithAiSchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "",
      emotionTags: [],
      childProfileId: "",
      hasAiFeedback: "false",
      aiFeedback: null,
      developmentalInsight: null,
      requestAiFeedback: false,
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: JournalEntryWithAi) => {
      const response = await apiRequest("POST", "/api/journal-entries", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-stats"] });
      
      if (data.aiFeedback) {
        setAiFeedback(data.aiFeedback);
        setShowAiFeedback(true);
      }
      
      if (data.developmentalInsight) {
        setDevelopmentalInsight(data.developmentalInsight);
      }
      
      toast({
        title: "Entry saved!",
        description: data.aiFeedback 
          ? "Your AI parenting coach has provided insights below."
          : "Your journal entry has been saved.",
      });
      
      // Don't reset AI feedback immediately - let user see it
      if (!data.aiFeedback) {
        // Only reset if no AI feedback to show
        form.reset();
        setSelectedChildIds([]);
        setPhotos([]);
      }
      setIsSubmittingWithAI(false);
      
      // Scroll to top to show AI feedback
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    onError: (error) => {
      console.error("Failed to save entry:", error);
      
      let errorMessage = "Failed to save your journal entry. Please try again.";
      
      // Check for specific AI-related errors
      if (error.message?.includes('OpenAI API key not configured')) {
        errorMessage = "Entry saved, but AI feedback unavailable. Please add your OpenAI API key to enable coaching insights.";
      } else if (error.message?.includes('OpenAI API quota exceeded')) {
        errorMessage = "Entry saved, but AI feedback unavailable due to quota limits. Please check your OpenAI usage.";
      }
      
      toast({
        title: error.message?.includes('OpenAI') ? "Entry Saved" : "Error",
        description: errorMessage,
        variant: error.message?.includes('OpenAI') ? "default" : "destructive",
      });
      setIsSubmittingWithAI(false);
    },
  });

  const onSubmit = (data: JournalEntryWithAi, requestAiFeedback: boolean) => {
    // Check if user needs to sign up before saving
    if (triggerSignUpPrompt && triggerSignUpPrompt('save')) {
      return; // Don't proceed with save, show sign-up prompt instead
    }

    const submissionData = {
      ...data,
      mood: selectedMood || null,
      emotionTags: null,
      childProfileId: selectedChildIds.length > 0 ? selectedChildIds[0] : null,
      requestAiFeedback,
      photos: photos.length > 0 ? photos : null,
    };
    
    if (requestAiFeedback) {
      setIsSubmittingWithAI(true);
      setShowAiFeedback(false);
    }
    
    createEntryMutation.mutate(submissionData);
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const contentLength = form.watch("content")?.length || 0;



  const selectedChildProfiles = childProfiles?.filter(profile => 
    selectedChildIds.includes(profile.id)
  ) || [];

  // Photo upload functions
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: string[] = [];
    const remainingSlots = 5 - photos.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newPhotos.push(result);
          if (newPhotos.length === filesToProcess) {
            setPhotos(prev => [...prev, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  return (
    <Card ref={formRef} className="shadow-sm border border-neutral-200 hover-lift animate-pop-fade">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
              <PenTool className="text-white h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800">
              Share Your Parenting Journey
            </h3>
          </div>
          <p className="text-neutral-600 mb-4">
            Your emotions and experiences help our AI provide personalized parenting insights and track your wellness journey.
          </p>
          
          {/* Parenting Focus Reminder */}
          {settings.parentingFocus && (
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Your focus:</span> {settings.parentingFocus}
              </p>
            </div>
          )}
          

          

          

        </div>

        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    Entry Title <span className="text-neutral-400">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="e.g., Teaching patience today..."
                        className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent input-glow hover-scale pr-12"
                        {...field}
                        value={field.value ?? ""}
                      />
                      <VoiceInput 
                        onTranscription={(text: string) => {
                          const currentValue = field.value || '';
                          field.onChange(currentValue + (currentValue ? ' ' : '') + text);
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      What's on your mind? <span className="text-red-400">*</span>
                    </FormLabel>

                  </div>
                  
                  {/* Writing Prompt Helper integrated into text area */}
                  <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-blue-800 mb-1 flex items-center">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          Writing Prompt Helper
                        </h4>
                        <p className="text-blue-700 text-xs leading-relaxed">
                          {currentPrompt}
                        </p>
                      </div>
                      <TooltipWrapper content="Get another prompt">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPrompt(getRandomPrompt())}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 ml-2 flex-shrink-0 h-6 w-6 p-0"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </TooltipWrapper>
                    </div>
                  </div>
                  
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        rows={5}
                        placeholder="Share your thoughts, challenges, victories, or anything about your day as a parent..."
                        className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none input-glow hover-scale pr-12"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                      <VoiceInput
                        onTranscription={(text: string) => {
                          const currentValue = field.value || '';
                          const newValue = currentValue + (currentValue && !currentValue.endsWith(' ') ? ' ' : '') + text;
                          field.onChange(newValue);
                        }}
                        isInline
                        className="bottom-2"
                      />
                    </div>
                  </FormControl>
                  <div className="text-xs text-neutral-500 mt-1">
                    {contentLength} characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />



            <FormField
              control={form.control}
              name="childProfileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    Which child(ren) is this entry about? <span className="text-neutral-400">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {childProfiles && childProfiles.length > 0 ? (
                        childProfiles.map((profile) => (
                          <div key={profile.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`child-${profile.id}`}
                              checked={selectedChildIds.includes(profile.id)}
                              onChange={(e) => {
                                const newSelectedIds = e.target.checked
                                  ? [...selectedChildIds, profile.id]
                                  : selectedChildIds.filter(id => id !== profile.id);
                                setSelectedChildIds(newSelectedIds);
                                // Update form field with first selected child for backward compatibility
                                field.onChange(newSelectedIds.length > 0 ? newSelectedIds[0] : "");
                              }}
                              className="rounded border-neutral-300 text-primary focus:ring-primary focus:ring-2"
                            />
                            <label 
                              htmlFor={`child-${profile.id}`}
                              className="text-sm text-neutral-700 flex items-center cursor-pointer"
                            >
                              <Baby className="h-4 w-4 mr-2 text-primary" />
                              {profile.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500 italic">No children added yet</p>
                      )}
                    </div>
                  </FormControl>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-neutral-500">
                      Selecting children will provide personalized developmental insights
                    </p>
                    <ChildProfilesDialog
                      trigger={
                        <Button variant="outline" size="sm" type="button" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Add Child
                        </Button>
                      }
                    />
                  </div>
                  {selectedChildIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs text-neutral-500">Selected:</span>
                      {selectedChildIds.map((childId) => {
                        const child = childProfiles?.find(p => p.id === childId);
                        return child ? (
                          <Badge key={childId} variant="secondary" className="text-xs">
                            {child.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload - Compact Version */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">
                  Add Photos <span className="text-neutral-400">(optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  {photos.length > 0 && (
                    <span className="text-xs text-neutral-500">{photos.length}/5 photos</span>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <TooltipWrapper content="Add photos to your entry">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photos.length >= 5}
                      className="text-xs"
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      {photos.length === 0 ? "Add Photos" : "Add More"}
                    </Button>
                  </TooltipWrapper>
                </div>
              </div>
              
              {/* Photo Gallery - Only show if photos exist */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-lg border">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>



            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={() => onSubmit(form.getValues(), true)}
                disabled={createEntryMutation.isPending || !form.getValues().content?.trim()}
                className="flex-1 bg-primary text-white hover:bg-primary/90 button-ripple button-press hover-lift"
              >
                {isSubmittingWithAI ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Save & Get AI Feedback
              </Button>
              <Button
                type="button"
                onClick={() => onSubmit(form.getValues(), false)}
                disabled={createEntryMutation.isPending || !form.getValues().content?.trim()}
                variant="outline"
                className="sm:w-auto button-press hover-scale"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Only
              </Button>
            </div>
          </form>
        </Form>

        {isSubmittingWithAI && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <SparklyStarsLoader 
              message="Your AI parenting coach is analyzing your entry..." 
              size="md" 
            />
            <p className="text-xs text-neutral-500 text-center mt-2">
              This may take a few moments to provide personalized insights
            </p>
          </div>
        )}

        {developmentalInsight && (
          <DevelopmentalInsightDisplay 
            insight={developmentalInsight} 
            childName={selectedChildProfiles.length > 0 ? selectedChildProfiles[0]?.name : undefined}
          />
        )}

        {showAiFeedback && aiFeedback && (
          <>
            <AiFeedbackDisplay feedback={aiFeedback} />
            <div className="mt-6 text-center">
              <Button
                onClick={() => {
                  form.reset();
                  setSelectedChildIds([]);
                  setPhotos([]);
                  setShowAiFeedback(false);
                  setAiFeedback("");
                  setDevelopmentalInsight("");
                }}
                className="hover-scale button-press"
              >
                <PenTool className="mr-2 h-4 w-4" />
                Start New Entry
              </Button>
            </div>
          </>
        )}


      </CardContent>
    </Card>
  );
}
