import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { journalEntryWithAiSchema, type JournalEntryWithAi, type ChildProfile } from "@shared/schema";
import { getRandomPrompt } from "@shared/prompts";
import { getDailyGreeting } from "@shared/greetings";
import { getSettings } from "@/utils/settings-storage";
import { PenTool, Save, Sparkles, Loader2, Bot, Lightbulb, Heart, Star, Baby, Users, GraduationCap, RefreshCw } from "lucide-react";
import { ChildProfilesDialog } from "./child-profiles-dialog";
import { PhotoUpload } from "./photo-upload";
import { CalmReset } from "./calm-reset";
import { VoiceInputButton, VoiceInput } from "./voice-input";

const MOODS = [
  { emoji: "😊", label: "Happy", value: "😊" },
  { emoji: "😰", label: "Stressed", value: "😰" },
  { emoji: "😴", label: "Tired", value: "😴" },
  { emoji: "🤔", label: "Thoughtful", value: "🤔" },
  { emoji: "😅", label: "Overwhelmed", value: "😅" },
  { emoji: "🥰", label: "Grateful", value: "🥰" },
];

const EMOTIONS = [
  { label: "Happy", value: "happy", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
  { label: "Calm", value: "calm", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { label: "Frustrated", value: "frustrated", color: "bg-red-100 border-red-300 text-red-800" },
  { label: "Guilty", value: "guilty", color: "bg-purple-100 border-purple-300 text-purple-800" },
  { label: "Overwhelmed", value: "overwhelmed", color: "bg-orange-100 border-orange-300 text-orange-800" },
  { label: "Proud", value: "proud", color: "bg-green-100 border-green-300 text-green-800" },
  { label: "Tired", value: "tired", color: "bg-gray-100 border-gray-300 text-gray-800" },
  { label: "Grateful", value: "grateful", color: "bg-pink-100 border-pink-300 text-pink-800" },
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
        <Bot className="h-5 w-5 text-primary" />
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
            icon = <Bot className="text-neutral-600 mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
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
          <Bot className="h-3 w-3 mr-1" />
          These insights are generated based on your entry and child's developmental stage. 
          Remember, you know your child best.
        </p>
      </div>
    </div>
  );
}

interface JournalFormProps {
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

export function JournalForm({ triggerSignUpPrompt }: JournalFormProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [isSubmittingWithAI, setIsSubmittingWithAI] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [developmentalInsight, setDevelopmentalInsight] = useState<string>("");
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>(() => getRandomPrompt());
  const [dailyGreeting] = useState<string>(() => getDailyGreeting());
  const [isCalmResetOpen, setIsCalmResetOpen] = useState(false);
  const [settings] = useState(() => getSettings());
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      
      // Reset form
      form.reset();
      setSelectedMood("");
      setSelectedEmotions([]);
      setSelectedChildIds([]);
      setIsSubmittingWithAI(false);
      setShowAiFeedback(false);
      setAiFeedback("");
      setDevelopmentalInsight("");
      setPhotos([]);
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
      emotionTags: selectedEmotions.length > 0 ? selectedEmotions : null,
      childProfileId: data.childProfileId || null,
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

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotion)) {
        return prev.filter(e => e !== emotion);
      } else {
        return [...prev, emotion];
      }
    });
  };

  const selectedChildProfile = childProfiles?.find(profile => 
    profile.id === form.watch("childProfileId")
  );

  return (
    <Card className="shadow-sm border border-neutral-200 hover-lift animate-fade-in">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
              <PenTool className="text-white h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800">
              How are you feeling today?
            </h3>
          </div>
          <p className="text-neutral-600 mb-4">
            {dailyGreeting}
          </p>
          
          {/* Parenting Focus Reminder */}
          {settings.parentingFocus && (
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Your focus:</span> {settings.parentingFocus}
              </p>
            </div>
          )}
          
          {/* Daily Prompt Helper */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Today's Writing Prompt Helper
                </h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {currentPrompt}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPrompt(getRandomPrompt())}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 ml-2 flex-shrink-0"
                title="Get another prompt"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Mood Selection - Moved to top */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={`px-3 py-2 rounded-full border text-sm transition-all button-press hover-scale animate-wiggle ${
                  selectedMood === mood.value
                    ? "border-primary bg-primary/10 text-primary animate-pulse-glow"
                    : "border-neutral-200 hover:border-primary hover:bg-primary/5"
                }`}
              >
                {mood.emoji} {mood.label}
              </button>
            ))}
          </div>
          
          {/* Emotion Tags Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-neutral-700 block mb-3">
              What emotions are you feeling? <span className="text-neutral-400">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((emotion) => (
                <Button
                  key={emotion.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleEmotion(emotion.value)}
                  className={`text-xs transition-all duration-200 hover-scale ${
                    selectedEmotions.includes(emotion.value)
                      ? `${emotion.color} border-2 animate-bounce-subtle`
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {emotion.label}
                </Button>
              ))}
            </div>
            {selectedEmotions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-neutral-500">Selected:</span>
                {selectedEmotions.map((emotion) => {
                  const emotionData = EMOTIONS.find(e => e.value === emotion);
                  return (
                    <Badge
                      key={emotion}
                      variant="secondary"
                      className={`text-xs ${emotionData?.color || ''}`}
                    >
                      {emotionData?.label || emotion}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
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
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <VoiceInputButton
                          onTranscript={(text) => {
                            const currentValue = field.value || '';
                            field.onChange(currentValue + (currentValue ? ' ' : '') + text);
                          }}
                          disabled={createEntryMutation.isPending}
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      What's on your mind? <span className="text-red-400">*</span>
                    </FormLabel>
                    <VoiceInput
                      onTranscript={(text) => {
                        const currentValue = field.value || '';
                        field.onChange(currentValue + (currentValue ? ' ' : '') + text);
                      }}
                      disabled={createEntryMutation.isPending}
                      className="mb-2"
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Share your thoughts, challenges, victories, or anything about your day as a parent..."
                      className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none input-glow hover-scale"
                      {...field}
                    />
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
                    Which child is this entry about? <span className="text-neutral-400">(optional)</span>
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const actualValue = value === "none" ? "" : value;
                      field.onChange(actualValue);
                      setSelectedChildIds(actualValue ? [actualValue] : []);
                    }} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent">
                        <SelectValue placeholder="Select a child (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No specific child</SelectItem>
                      {childProfiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          <div className="flex items-center">
                            <Baby className="h-4 w-4 mr-2 text-primary" />
                            {profile.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-neutral-500">
                      Selecting a child will provide personalized developmental insights
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <div>
              <PhotoUpload 
                photos={photos} 
                onPhotosChange={setPhotos}
                maxPhotos={5}
              />
            </div>

            {/* Quick Calm Reset for overwhelming moments */}
            <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-emerald-700">Feeling overwhelmed while writing?</p>
                <CalmReset trigger="inline" />
              </div>
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
            <div className="flex items-center">
              <Loader2 className="animate-spin h-5 w-5 text-primary mr-3" />
              <span className="text-neutral-700">Getting AI coaching insights...</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              This may take a few moments as your AI parenting coach analyzes your entry
            </p>
          </div>
        )}

        {developmentalInsight && (
          <DevelopmentalInsightDisplay 
            insight={developmentalInsight} 
            childName={selectedChildIds.length > 0 ? childProfiles?.find(p => p.id === selectedChildIds[0])?.name : undefined}
          />
        )}

        {showAiFeedback && aiFeedback && (
          <AiFeedbackDisplay feedback={aiFeedback} />
        )}


      </CardContent>
    </Card>
  );
}
