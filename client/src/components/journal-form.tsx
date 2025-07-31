import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { journalEntryWithAiSchema, type JournalEntryWithAi, type ChildProfile } from "@shared/schema";
import { PenTool, Save, Sparkles, Loader2, Bot, Lightbulb, Heart, Star, Baby, Users, GraduationCap } from "lucide-react";
import { ChildProfilesDialog } from "./child-profiles-dialog";
import { PhotoUpload } from "./photo-upload";

const MOODS = [
  { emoji: "😊", label: "Happy", value: "😊" },
  { emoji: "😰", label: "Stressed", value: "😰" },
  { emoji: "😴", label: "Tired", value: "😴" },
  { emoji: "🤔", label: "Thoughtful", value: "🤔" },
  { emoji: "😅", label: "Overwhelmed", value: "😅" },
  { emoji: "🥰", label: "Grateful", value: "🥰" },
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
    <div className="mt-6 p-6 bg-gradient-accent rounded-lg border border-accent/20">
      <div className="flex items-start">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0">
          <Bot className="text-white h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-neutral-800 mb-2">AI Insights & Suggestions</h4>
          <div className="text-neutral-700 leading-relaxed space-y-3">
            {sections.map((section, index) => {
              const [title, ...contentParts] = section.split(':');
              const content = contentParts.join(':').trim();
              
              let icon;
              if (title.includes('Validation')) {
                icon = <Lightbulb className="text-accent mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
              } else if (title.includes('Suggestion')) {
                icon = <Heart className="text-secondary mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
              } else if (title.includes('Growth')) {
                icon = <Star className="text-primary mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
              } else {
                icon = <Bot className="text-accent mr-2 mt-1 h-4 w-4 flex-shrink-0" />;
              }
              
              return (
                <div key={index} className="flex items-start">
                  {icon}
                  <span>
                    {title.includes('*') ? (
                      <>
                        <strong>{title.replace(/\*\*/g, '')}:</strong> {content}
                      </>
                    ) : (
                      section
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function JournalForm() {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [isSubmittingWithAI, setIsSubmittingWithAI] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [developmentalInsight, setDevelopmentalInsight] = useState<string>("");
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
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
          ? "AI insights have been generated for your entry."
          : "Entry saved! AI insights coming soon...",
      });
      
      // Reset form
      form.reset();
      setSelectedMood("");
      setSelectedChildIds([]);
      setIsSubmittingWithAI(false);
      setShowAiFeedback(false);
      setAiFeedback("");
      setDevelopmentalInsight("");
      setPhotos([]);
    },
    onError: (error) => {
      console.error("Failed to save entry:", error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
      setIsSubmittingWithAI(false);
    },
  });

  const onSubmit = (data: JournalEntryWithAi, requestAiFeedback: boolean) => {
    const submissionData = {
      ...data,
      mood: selectedMood || null,
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
            Share your parenting moment and get personalized insights.
          </p>
          
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
                    <Input
                      placeholder="e.g., Teaching patience today..."
                      className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent input-glow hover-scale"
                      {...field}
                      value={field.value ?? ""}
                    />
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
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    What's on your mind? <span className="text-red-400">*</span>
                  </FormLabel>
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
              <span className="text-neutral-700">Getting AI insights for your entry...</span>
            </div>
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
