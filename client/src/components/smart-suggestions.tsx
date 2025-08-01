import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Palette, 
  Play, 
  Heart, 
  Sunrise, 
  Users, 
  Camera, 
  Calendar,
  Brain,
  Zap,
  ChevronRight,
  X
} from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'mood' | 'interaction' | 'personalization' | 'wellness' | 'family';
  icon: React.ReactNode;
  priority: number;
  conditions: string[];
  action?: () => void;
}

interface SmartSuggestionsProps {
  context: {
    currentPage?: string;
    recentMood?: string;
    hasChildren?: boolean;
    entryCount?: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    isFirstTime?: boolean;
  };
  onSuggestionClick?: (suggestionId: string) => void;
  className?: string;
}

export function SmartSuggestions({ context, onSuggestionClick, className = "" }: SmartSuggestionsProps) {
  const [visibleSuggestions, setVisibleSuggestions] = useState<Suggestion[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [clickedSuggestions, setClickedSuggestions] = useState<string[]>([]);

  const allSuggestions: Suggestion[] = [
    {
      id: 'mood-palette',
      title: 'Interactive AI-powered mood color palette generator',
      description: 'Visualize your emotions with dynamic color schemes that adapt to your journal entries',
      category: 'mood',
      icon: <Palette className="h-4 w-4" />,
      priority: 8,
      conditions: ['hasEntries', 'moodTracking']
    },
    {
      id: 'breathing-tutorial',
      title: 'Playful breathing exercise tutorial with character animations',
      description: 'Guided breathing with friendly animated characters to make wellness fun',
      category: 'wellness',
      icon: <Play className="h-4 w-4" />,
      priority: 9,
      conditions: ['stressIndicators', 'firstTimeWellness']
    },
    {
      id: 'emotion-transitions',
      title: 'Micro-interactions for emotional state transitions',
      description: 'Smooth animations that respond to your mood changes throughout the day',
      category: 'interaction',
      icon: <Heart className="h-4 w-4" />,
      priority: 7,
      conditions: ['moodVariations', 'multipleEntries']
    },
    {
      id: 'adaptive-themes',
      title: "Adaptive background themes based on user's emotional journey",
      description: 'Interface colors and themes that evolve with your parenting experiences',
      category: 'personalization',
      icon: <Sunrise className="h-4 w-4" />,
      priority: 6,
      conditions: ['longTermUser', 'emotionalPatterns']
    },
    {
      id: 'empathetic-onboarding',
      title: 'Gentle onboarding experience with empathetic AI guide',
      description: 'Personalized welcome journey that understands your unique parenting situation',
      category: 'family',
      icon: <Users className="h-4 w-4" />,
      priority: 10,
      conditions: ['firstTime', 'noChildren']
    },
    {
      id: 'photo-storytelling',
      title: 'AI-powered photo storytelling for milestone memories',
      description: 'Transform your photos into narrative stories with AI-generated captions',
      category: 'family',
      icon: <Camera className="h-4 w-4" />,
      priority: 8,
      conditions: ['hasPhotos', 'milestoneTracking']
    },
    {
      id: 'predictive-prompts',
      title: 'Smart journaling prompts based on parenting patterns',
      description: 'AI suggests personalized writing prompts based on your family dynamics',
      category: 'mood',
      icon: <Brain className="h-4 w-4" />,
      priority: 9,
      conditions: ['regularJournaling', 'hasChildren']
    },
    {
      id: 'energy-boost',
      title: 'Quick energy boost activities for overwhelmed moments',
      description: '2-minute personalized activities to restore your parenting energy',
      category: 'wellness',
      icon: <Zap className="h-4 w-4" />,
      priority: 9,
      conditions: ['stressIndicators', 'timeConstrained']
    }
  ];

  useEffect(() => {
    const relevantSuggestions = allSuggestions
      .filter(suggestion => !dismissedSuggestions.includes(suggestion.id))
      .filter(suggestion => {
        // Context-based filtering logic
        if (context.isFirstTime && suggestion.conditions.includes('firstTime')) return true;
        if (context.hasChildren && suggestion.conditions.includes('hasChildren')) return true;
        if (context.entryCount && context.entryCount > 5 && suggestion.conditions.includes('regularJournaling')) return true;
        if (context.recentMood === 'overwhelmed' && suggestion.conditions.includes('stressIndicators')) return true;
        if (context.currentPage === 'home' && suggestion.conditions.includes('hasEntries')) return true;
        
        // Default suggestions for any context
        return suggestion.conditions.includes('universal') || 
               Math.random() > 0.7; // Some randomness for discovery
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, isExpanded ? 6 : 3);

    setVisibleSuggestions(relevantSuggestions);
  }, [context, dismissedSuggestions, isExpanded]);

  const handleSuggestionClick = (suggestionId: string) => {
    setClickedSuggestions(prev => [...prev, suggestionId]);
    onSuggestionClick?.(suggestionId);
  };

  const handleDismiss = (suggestionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedSuggestions(prev => [...prev, suggestionId]);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      mood: 'bg-purple-50 text-purple-700 border-purple-200',
      interaction: 'bg-blue-50 text-blue-700 border-blue-200',
      personalization: 'bg-green-50 text-green-700 border-green-200',
      wellness: 'bg-pink-50 text-pink-700 border-pink-200',
      family: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return colors[category as keyof typeof colors] || 'bg-neutral-50 text-neutral-700 border-neutral-200';
  };

  if (visibleSuggestions.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-neutral-800">Smart Suggestions</h3>
          <Badge variant="secondary" className="text-xs">
            AI-Powered
          </Badge>
        </div>
        {allSuggestions.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {visibleSuggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
            className={`hover-lift cursor-pointer transition-all duration-200 border-l-4 hover:shadow-md ${
              clickedSuggestions.includes(suggestion.id) 
                ? 'border-l-green-500 bg-green-50/50 ring-2 ring-green-200' 
                : 'border-l-primary/30 hover:border-l-primary'
            }`}
            onClick={() => handleSuggestionClick(suggestion.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {suggestion.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900 text-sm leading-snug mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed mb-2">
                        {suggestion.description}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(suggestion.category)}`}
                      >
                        {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDismiss(suggestion.id, e)}
                        className="h-6 w-6 p-0 hover:bg-neutral-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {visibleSuggestions.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-neutral-500">
            Suggestions are personalized based on your parenting journey and app usage
          </p>
        </div>
      )}
    </div>
  );
}