import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, RefreshCw, PenTool, Sparkles, Clock, BookOpen, Heart, Baby } from "lucide-react";
import type { ChildProfile } from "@shared/schema";

interface ReflectionPrompt {
  id: string;
  category: string;
  icon: string;
  prompt: string;
  followUp?: string;
}

const reflectionPrompts: ReflectionPrompt[] = [
  {
    id: "gratitude",
    category: "Gratitude",
    icon: "💝",
    prompt: "What is one small moment with your child today that made you smile?",
    followUp: "How did this moment make you feel as a parent?"
  },
  {
    id: "challenge",
    category: "Growth",
    icon: "🌱",
    prompt: "What was the most challenging part of parenting today, and what did you learn from it?",
    followUp: "How might you handle a similar situation differently next time?"
  },
  {
    id: "connection",
    category: "Connection",
    icon: "🤗",
    prompt: "Describe a moment today when you felt truly connected with your child.",
    followUp: "What made this connection special?"
  },
  {
    id: "patience",
    category: "Mindfulness",
    icon: "🧘‍♀️",
    prompt: "When did you practice patience today, and how did it affect the situation?",
    followUp: "What helps you stay centered during difficult moments?"
  },
  {
    id: "joy",
    category: "Joy",
    icon: "😄",
    prompt: "What brought you and your child joy today?",
    followUp: "How can you create more moments like this?"
  },
  {
    id: "growth",
    category: "Development",
    icon: "🌟",
    prompt: "What new skill, behavior, or milestone did you notice in your child today?",
    followUp: "How did witnessing this growth make you feel?"
  },
  {
    id: "self-care",
    category: "Self-Care",
    icon: "💕",
    prompt: "How did you take care of yourself as a parent today?",
    followUp: "What would help you feel more supported tomorrow?"
  },
  {
    id: "communication",
    category: "Communication",
    icon: "💬",
    prompt: "Describe a conversation or interaction with your child that stood out today.",
    followUp: "What did you learn about your child from this interaction?"
  },
  {
    id: "routine",
    category: "Routine",
    icon: "⏰",
    prompt: "What part of your daily routine with your child worked well today?",
    followUp: "What would you like to improve about your routines?"
  },
  {
    id: "love",
    category: "Love",
    icon: "❤️",
    prompt: "How did you show love to your child today, and how did they show love to you?",
    followUp: "What does your child's love language seem to be?"
  }
];

export function DailyReflection() {
  const [currentPrompt, setCurrentPrompt] = useState<ReflectionPrompt | null>(null);
  const [reflection, setReflection] = useState("");
  const [followUpReflection, setFollowUpReflection] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
  });

  const generateRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * reflectionPrompts.length);
    const prompt = reflectionPrompts[randomIndex];
    setCurrentPrompt(prompt);
    setReflection("");
    setFollowUpReflection("");
    setShowFollowUp(false);
  };

  const saveReflectionMutation = useMutation({
    mutationFn: async (data: { content: string; title: string }) => {
      const response = await fetch("/api/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          hasAiFeedback: "false",
        }),
      });
      if (!response.ok) throw new Error("Failed to save reflection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-stats"] });
      toast({
        title: "✅ Reflection Saved!",
        description: "Your daily reflection has been added to your journal.",
      });
      setReflection("");
      setFollowUpReflection("");
      setCurrentPrompt(null);
      setShowFollowUp(false);
    },
    onError: () => {
      toast({
        title: "❌ Save Failed",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveReflection = () => {
    if (!currentPrompt || !reflection.trim()) return;

    const title = `💭 Daily Reflection: ${currentPrompt.category}`;
    let content = `**${currentPrompt.icon} ${currentPrompt.prompt}**\n\n${reflection.trim()}`;
    
    if (showFollowUp && followUpReflection.trim()) {
      content += `\n\n**${currentPrompt.followUp}**\n\n${followUpReflection.trim()}`;
    }

    saveReflectionMutation.mutate({ title, content });
  };

  const getTodaysDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-neutral-800 flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-accent" />
          📱 Daily Reflection
        </CardTitle>
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">
            Get guided prompts to help you reflect on your parenting journey
          </p>
          <div className="flex items-center text-xs text-neutral-500">
            <Clock className="mr-1 h-3 w-3" />
            {getTodaysDate()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!currentPrompt ? (
          <div className="text-center py-6">
            <div className="mb-4">
              <Sparkles className="mx-auto h-12 w-12 text-accent opacity-60" />
            </div>
            <h3 className="font-medium text-neutral-800 mb-2">
              🌟 Ready for today's reflection?
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Get a personalized prompt to help you reflect on your parenting journey
            </p>
            <Button 
              onClick={generateRandomPrompt}
              className="bg-primary hover:bg-primary/90"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Get My Prompt
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Prompt */}
            <div className="bg-gradient-primary rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="secondary" className="bg-white/80 text-neutral-700">
                  {currentPrompt.icon} {currentPrompt.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateRandomPrompt}
                  className="h-8 w-8 p-0 hover:bg-white/20"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-neutral-800 font-medium">
                {currentPrompt.prompt}
              </p>
            </div>

            {/* Reflection Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                💭 Your Reflection
              </label>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Take your time and share your thoughts..."
                className="min-h-[100px] border-neutral-200 focus:border-primary resize-none"
              />
            </div>

            {/* Follow-up Question */}
            {currentPrompt.followUp && !showFollowUp && reflection.trim() && (
              <Button
                variant="outline"
                onClick={() => setShowFollowUp(true)}
                className="w-full border-dashed border-neutral-300 text-neutral-600 hover:border-primary hover:text-primary"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Answer Follow-up Question
              </Button>
            )}

            {showFollowUp && (
              <div>
                <div className="bg-neutral-50 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-neutral-700">
                    {currentPrompt.followUp}
                  </p>
                </div>
                <Textarea
                  value={followUpReflection}
                  onChange={(e) => setFollowUpReflection(e.target.value)}
                  placeholder="Dive a little deeper..."
                  className="min-h-[80px] border-neutral-200 focus:border-primary resize-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPrompt(null);
                  setReflection("");
                  setFollowUpReflection("");
                  setShowFollowUp(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveReflection}
                disabled={!reflection.trim() || saveReflectionMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {saveReflectionMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <PenTool className="mr-2 h-4 w-4" />
                    💾 Save to Journal
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="border-t border-neutral-200 pt-4">
          <div className="text-xs text-neutral-500 space-y-1">
            <div className="flex items-center">
              <Heart className="mr-1 h-3 w-3" />
              <span>💡 Tip: There's no right or wrong answer - just be honest</span>
            </div>
            {childProfiles && childProfiles.length > 0 && (
              <div className="flex items-center">
                <Baby className="mr-1 h-3 w-3" />
                <span>👶 You can mention specific children in your reflection</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}