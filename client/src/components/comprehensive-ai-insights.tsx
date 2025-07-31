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
  Loader2
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
        setAnalysisData(data);
      } else {
        console.error('Failed to fetch AI analysis');
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
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
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
  if (!data) return <div className="text-center py-4 text-neutral-500">No analysis available yet</div>;

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
        <h4 className="font-semibold text-primary mb-2 flex items-center">
          <TrendingUp className="mr-2 h-4 w-4" />
          Progress Overview
        </h4>
        <p className="text-neutral-700 text-sm leading-relaxed">
          {data.progressOverview || "Based on your journal entries and reflections, you're developing consistent parenting practices and growing in self-awareness."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h5 className="font-medium text-green-800 mb-2 flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Strengths Identified
          </h5>
          <ul className="text-sm text-green-700 space-y-1">
            {(data.strengths || ["Consistent reflection habits", "Emotional awareness", "Growth mindset"]).map((strength: string, index: number) => (
              <li key={index} className="flex items-start">
                <ArrowRight className="mr-2 h-3 w-3 mt-0.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-2 flex items-center">
            <Target className="mr-2 h-4 w-4" />
            Growth Areas
          </h5>
          <ul className="text-sm text-blue-700 space-y-1">
            {(data.growthAreas || ["Consistency in responses", "Patience during challenges", "Self-care prioritization"]).map((area: string, index: number) => (
              <li key={index} className="flex items-start">
                <ArrowRight className="mr-2 h-3 w-3 mt-0.5 flex-shrink-0" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <h5 className="font-medium text-amber-800 mb-2 flex items-center">
          <Sparkles className="mr-2 h-4 w-4" />
          Recommended Next Steps
        </h5>
        <p className="text-sm text-amber-700 leading-relaxed">
          {data.nextSteps || "Continue documenting your experiences, focus on celebrating small wins, and consider exploring new parenting strategies that align with your values."}
        </p>
      </div>
    </div>
  );
}

function ChildDevelopmentAnalysis({ data }: { data: any }) {
  if (!data) return <div className="text-center py-4 text-neutral-500">No analysis available yet</div>;

  return (
    <div className="space-y-4">
      <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
        <h4 className="font-semibold text-accent mb-2 flex items-center">
          <Baby className="mr-2 h-4 w-4" />
          Development Overview
        </h4>
        <p className="text-neutral-700 text-sm leading-relaxed">
          {data.developmentOverview || "Your child is showing healthy developmental patterns across multiple areas. Continue supporting their growth with age-appropriate activities."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h5 className="font-medium text-purple-800 mb-2">Milestones Achieved</h5>
          <ul className="text-sm text-purple-700 space-y-1">
            {(data.milestones || ["Social interaction skills", "Language development", "Motor skill progress"]).map((milestone: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="mr-2 h-3 w-3 mt-0.5 flex-shrink-0" />
                {milestone}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h5 className="font-medium text-indigo-800 mb-2">Focus Areas</h5>
          <ul className="text-sm text-indigo-700 space-y-1">
            {(data.focusAreas || ["Emotional regulation", "Independence building", "Creative expression"]).map((area: string, index: number) => (
              <li key={index} className="flex items-start">
                <Target className="mr-2 h-3 w-3 mt-0.5 flex-shrink-0" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h5 className="font-medium text-green-800 mb-2 flex items-center">
          <Lightbulb className="mr-2 h-4 w-4" />
          Developmental Recommendations
        </h5>
        <p className="text-sm text-green-700 leading-relaxed">
          {data.recommendations || "Encourage exploration through play, maintain consistent routines, and provide plenty of positive reinforcement for their efforts and progress."}
        </p>
      </div>
    </div>
  );
}

function PersonalizedTipsAnalysis({ data }: { data: any }) {
  if (!data) return <div className="text-center py-4 text-neutral-500">No analysis available yet</div>;

  return (
    <div className="space-y-4">
      <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/20">
        <h4 className="font-semibold text-secondary mb-2 flex items-center">
          <Lightbulb className="mr-2 h-4 w-4" />
          Personalized Recommendations
        </h4>
        <p className="text-neutral-700 text-sm leading-relaxed">
          Based on your parenting style, child's personality, and recent experiences, here are tailored suggestions for your family.
        </p>
      </div>

      <div className="space-y-3">
        {(data.tips || [
          {
            category: "Communication",
            tip: "Try using more descriptive praise when acknowledging your child's efforts. Instead of 'good job,' specify what they did well.",
            reason: "This builds their understanding of positive behaviors and encourages repetition."
          },
          {
            category: "Routine",
            tip: "Consider implementing a visual schedule for daily activities to increase independence and reduce conflicts.",
            reason: "Visual cues help children anticipate transitions and feel more in control of their day."
          },
          {
            category: "Connection",
            tip: "Schedule 10 minutes of uninterrupted one-on-one time daily, letting your child choose the activity.",
            reason: "This strengthens your bond and gives them a sense of agency while ensuring quality connection time."
          }
        ]).map((tip: any, index: number) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-neutral-200 shadow-sm">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white text-xs font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Badge variant="secondary" className="mr-2 text-xs">
                    {tip.category}
                  </Badge>
                </div>
                <p className="text-neutral-800 text-sm mb-2 font-medium">
                  {tip.tip}
                </p>
                <p className="text-neutral-600 text-xs leading-relaxed">
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
  if (!data) return <div className="text-center py-4 text-neutral-500">No analysis available yet</div>;

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <h4 className="font-semibold text-neutral-800 mb-2 flex items-center">
          <MessageSquare className="mr-2 h-4 w-4" />
          Thoughtful Considerations
        </h4>
        <p className="text-neutral-700 text-sm leading-relaxed">
          Three important concepts to consider for enhancing your parenting journey and family dynamics.
        </p>
      </div>

      <div className="space-y-4">
        {(data.considerations || [
          {
            concept: "Emotional Co-regulation",
            description: "The practice of helping your child manage their emotions by first managing your own emotional state.",
            importance: "When you remain calm during your child's emotional moments, you provide a secure base that helps them learn to self-regulate over time.",
            relevance: "This builds emotional intelligence and strengthens your parent-child relationship while reducing behavioral challenges."
          },
          {
            concept: "Growth Mindset Modeling",
            description: "Demonstrating how to approach challenges as learning opportunities rather than fixed abilities.",
            importance: "Children who develop a growth mindset are more resilient, creative, and willing to take on challenges throughout their lives.",
            relevance: "Your attitude toward mistakes and learning directly influences how your child will approach difficulties and setbacks."
          },
          {
            concept: "Play-Based Connection",
            description: "Using unstructured play time as a primary method for building relationship and understanding your child.",
            importance: "Play is how children naturally process their experiences, express their feelings, and develop crucial life skills.",
            relevance: "Regular play-based interaction strengthens your bond while giving you insights into your child's inner world and developmental needs."
          }
        ]).map((consideration: any, index: number) => (
          <div key={index} className="bg-white rounded-lg p-5 border border-neutral-200 shadow-sm">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white text-sm font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-neutral-800 mb-2 flex items-center">
                  {consideration.concept}
                </h5>
                <p className="text-neutral-700 text-sm mb-3 leading-relaxed">
                  {consideration.description}
                </p>
                <div className="space-y-2">
                  <div className="bg-blue-50 rounded p-3 border-l-4 border-blue-400">
                    <p className="text-xs text-blue-800">
                      <strong>Why it matters:</strong> {consideration.importance}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded p-3 border-l-4 border-green-400">
                    <p className="text-xs text-green-800">
                      <strong>Relevance to you:</strong> {consideration.relevance}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}