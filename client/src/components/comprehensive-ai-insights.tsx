import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Heart, 
  Target, 
  Baby, 
  User, 
  Bot,
  Sparkles,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Loader2,
  X
} from "lucide-react";
import type { JournalEntry, ChildProfile, ParentProfile } from "@shared/schema";

interface ComprehensiveAIInsightsProps {
  onInsightClick?: (insightType: string) => void;
}

export function ComprehensiveAIInsights({ onInsightClick }: ComprehensiveAIInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Fetch data for AI analysis
  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
  });

  const { data: parentProfile } = useQuery<ParentProfile>({
    queryKey: ["/api/parent-profile"],
  });

  const handleInsightClick = async (insightType: string) => {
    setSelectedInsight(insightType);
    setIsLoading(true);
    
    try {
      // Call AI analysis API based on insight type
      const response = await fetch(`/api/ai-analysis/${insightType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: entries || [],
          childProfiles: childProfiles || [],
          parentProfile: parentProfile || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both direct data and fallback data
        setAnalysisData(data.fallback || data);
      } else {
        const errorData = await response.json();
        if (errorData.fallback) {
          setAnalysisData(errorData.fallback);
        } else {
          console.error('Failed to fetch AI analysis:', errorData.error);
          // Set fallback data if no server fallback provided
          setAnalysisData({
            progressOverview: "Your parenting journey shows consistent growth and dedication to understanding your child's needs.",
            strengths: ["Regular reflection and journaling", "Caring attention to child's development", "Commitment to growth"],
            growthAreas: ["Continue current positive practices", "Explore new approaches as needed"],
            nextSteps: "Keep documenting your experiences and celebrating the progress you're making as a parent."
          });
        }
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
    } finally {
      setIsLoading(false);
    }

    onInsightClick?.(insightType);
  };

  const insights = [
    {
      id: "parenting-progress",
      title: "Your Parenting Progress",
      description: "AI analysis of your growth, patterns, and development based on your journal entries and reflections",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
      hoverBorder: "hover:border-primary",
      hoverBg: "hover:bg-primary/10"
    },
    {
      id: "child-development",
      title: "Child Development Patterns", 
      description: "Insights into your child's growth stages, milestones, and behavioral patterns",
      icon: <Baby className="h-5 w-5" />,
      color: "text-accent",
      bgColor: "bg-accent/5",
      borderColor: "border-accent/20",
      hoverBorder: "hover:border-accent",
      hoverBg: "hover:bg-accent/10"
    },
    {
      id: "personalized-tips",
      title: "Personalized Tips",
      description: "Custom recommendations based on your parenting style, child's personality, and recent experiences",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "text-secondary",
      bgColor: "bg-secondary/5",
      borderColor: "border-secondary/20",
      hoverBorder: "hover:border-secondary",
      hoverBg: "hover:bg-secondary/10"
    },
    {
      id: "considerations",
      title: "Have You Considered",
      description: "Three thoughtful suggestions to enhance your parenting journey and family dynamics",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
      hoverBorder: "hover:border-primary",
      hoverBg: "hover:bg-primary/10"
    }
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 animate-pop-fade">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          AI Insights & Guidance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              onClick={() => handleInsightClick(insight.id)}
              className={`${insight.bgColor} rounded-lg p-4 border ${insight.borderColor} interactive-card hover-lift button-press cursor-pointer ${insight.hoverBorder} ${insight.hoverBg} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start mb-2">
                <div className={`${insight.color} mr-2`}>
                  {insight.icon}
                </div>
                <h4 className={`font-medium ${insight.color} flex-1`}>
                  {insight.title}
                </h4>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Dialog */}
      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto relative bg-white border shadow-lg">
          <button
            onClick={() => setSelectedInsight(null)}
            className="absolute top-4 right-4 z-50 p-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 text-neutral-500 hover:text-neutral-700" />
          </button>
          <DialogHeader className="pr-12 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-neutral-900">
              <Brain className="h-5 w-5 text-primary" />
              {insights.find(i => i.id === selectedInsight)?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-neutral-600">Analyzing your parenting journey...</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    This comprehensive analysis considers your journal entries, child profiles, and parenting patterns
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedInsight === "parenting-progress" && (
                  <ParentingProgressAnalysis data={analysisData} />
                )}
                {selectedInsight === "child-development" && (
                  <ChildDevelopmentAnalysis data={analysisData} />
                )}
                {selectedInsight === "personalized-tips" && (
                  <PersonalizedTipsAnalysis data={analysisData} />
                )}
                {selectedInsight === "considerations" && (
                  <ConsiderationsAnalysis data={analysisData} />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ParentingProgressAnalysis({ data }: { data: any }) {
  if (!data) return <div className="text-center py-6 text-neutral-500">No analysis available yet</div>;

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
        <h4 className="font-semibold text-primary mb-4 flex items-center text-lg">
          <TrendingUp className="mr-3 h-5 w-5" />
          Your Parenting Journey
        </h4>
        <p className="text-neutral-700 leading-relaxed">
          {data.progressOverview || "Based on your journal entries and reflections, you're developing consistent parenting practices and growing in self-awareness."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <h5 className="font-medium text-green-800 mb-4 flex items-center">
            <CheckCircle className="mr-3 h-5 w-5" />
            Your Strengths
          </h5>
          <div className="space-y-3">
            {(data.strengths || ["Consistent reflection habits", "Emotional awareness", "Growth mindset"]).map((strength: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-green-700 leading-relaxed">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-4 flex items-center">
            <Target className="mr-3 h-5 w-5" />
            Growth Opportunities
          </h5>
          <div className="space-y-3">
            {(data.growthAreas || ["Consistency in responses", "Patience during challenges"]).map((area: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-blue-700 leading-relaxed">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
        <h5 className="font-medium text-amber-800 mb-4 flex items-center">
          <Sparkles className="mr-3 h-5 w-5" />
          Next Steps
        </h5>
        <p className="text-amber-700 leading-relaxed">
          {data.nextSteps || "Continue documenting your experiences, focus on celebrating small wins, and consider exploring new parenting strategies that align with your values."}
        </p>
      </div>
    </div>
  );
}

function ChildDevelopmentAnalysis({ data }: { data: any }) {
  if (!data) return <div className="text-center py-6 text-neutral-500">No analysis available yet</div>;

  return (
    <div className="space-y-6">
      <div className="bg-accent/5 rounded-xl p-6 border border-accent/20">
        <h4 className="font-semibold text-accent mb-4 flex items-center text-lg">
          <Baby className="mr-3 h-5 w-5" />
          Development Overview
        </h4>
        <p className="text-neutral-700 leading-relaxed">
          {data.developmentOverview || "Your child is showing healthy developmental patterns across multiple areas. Continue supporting their growth with age-appropriate activities."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
          <h5 className="font-medium text-purple-800 mb-4 flex items-center">
            <CheckCircle className="mr-3 h-5 w-5" />
            Recent Milestones
          </h5>
          <div className="space-y-3">
            {(data.milestones || ["Social interaction skills", "Language development"]).map((milestone: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-purple-700 leading-relaxed">{milestone}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
          <h5 className="font-medium text-indigo-800 mb-4 flex items-center">
            <Target className="mr-3 h-5 w-5" />
            Development Focus
          </h5>
          <div className="space-y-3">
            {(data.focusAreas || ["Emotional regulation", "Independence building"]).map((area: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-indigo-700 leading-relaxed">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
        <h5 className="font-medium text-green-800 mb-4 flex items-center">
          <Lightbulb className="mr-3 h-5 w-5" />
          Recommendations
        </h5>
        <p className="text-green-700 leading-relaxed">
          {data.recommendations || "Encourage exploration through play, maintain consistent routines, and provide plenty of positive reinforcement for their efforts and progress."}
        </p>
      </div>
    </div>
  );
}

function PersonalizedTipsAnalysis({ data }: { data: any }) {
  if (!data) return <div className="text-center py-6 text-neutral-500">No analysis available yet</div>;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 rounded-xl p-6 border border-secondary/20">
        <h4 className="font-semibold text-secondary mb-4 flex items-center text-lg">
          <Lightbulb className="mr-3 h-5 w-5" />
          Personalized Tips
        </h4>
        <p className="text-neutral-700 leading-relaxed">
          Based on your parenting style, child's personality, and recent experiences, here are tailored suggestions for your family.
        </p>
      </div>

      <div className="space-y-4">
        {(data.tips || [
          {
            category: "Communication",
            tip: "Try using more descriptive praise when acknowledging your child's efforts.",
            reason: "This builds their understanding of positive behaviors and encourages repetition."
          },
          {
            category: "Connection",
            tip: "Schedule 10 minutes of uninterrupted one-on-one time daily.",
            reason: "This strengthens your bond and gives them a sense of agency while ensuring quality connection time."
          }
        ]).map((tip: any, index: number) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {tip.category}
                  </Badge>
                </div>
                <p className="text-neutral-800 mb-3 font-medium leading-relaxed">
                  {tip.tip}
                </p>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  <strong>Why this helps:</strong> {tip.reason}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsiderationsAnalysis({ data }: { data: any }) {
  if (!data) return <div className="text-center py-6 text-neutral-500">No analysis available yet</div>;

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
        <h4 className="font-semibold text-primary mb-4 flex items-center text-lg">
          <MessageSquare className="mr-3 h-5 w-5" />
          Have You Considered...
        </h4>
        <p className="text-neutral-700 leading-relaxed">
          These concepts might offer new perspectives on your parenting journey and family dynamics.
        </p>
      </div>

      <div className="space-y-6">
        {(data.considerations || [
          {
            concept: "Emotional Co-regulation",
            description: "The practice of helping your child manage their emotions by first managing your own emotional state.",
            importance: "When you remain calm during your child's emotional moments, you provide a secure base that helps them learn to self-regulate over time."
          },
          {
            concept: "Growth Mindset Modeling", 
            description: "Demonstrating how to approach challenges as learning opportunities rather than fixed abilities.",
            importance: "Children who develop a growth mindset are more resilient, creative, and willing to take on challenges throughout their lives."
          }
        ]).map((consideration: any, index: number) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="mb-4">
              <h5 className="font-semibold text-neutral-800 text-lg mb-3 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary text-sm font-bold">{index + 1}</span>
                </div>
                {consideration.concept}
              </h5>
              <p className="text-neutral-700 leading-relaxed mb-4">
                {consideration.description}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <p className="text-blue-800 font-medium mb-2">Why it matters:</p>
              <p className="text-blue-700 leading-relaxed">
                {consideration.importance}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}