import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, X, Heart, Lightbulb, Timer, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WellnessSuggestion {
  id: string;
  userId: string;
  suggestionId?: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: 'suggested' | 'completed' | 'dismissed';
  pointsAwarded?: number;
  badgeAwarded?: string;
  completedAt?: string;
  dismissedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface WellnessProgress {
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  completedSuggestions: string[];
  preferences: {
    frequencyPreference: 'frequent' | 'occasional' | 'minimal';
    preferredTimes: string[];
    enableGamification: boolean;
    maxSuggestionsPerDay: number;
  };
  lastActivityDate?: string;
}

const categoryIcons = {
  'self-care': Heart,
  'mindfulness': Sparkles,
  'connection': Heart,
  'reflection': Lightbulb,
  'breathing': Timer,
  'movement': Star,
  'gratitude': Heart,
  'rest': Timer,
};

const categoryColors = {
  'self-care': 'bg-rose-100 text-rose-800 border-rose-200',
  'mindfulness': 'bg-purple-100 text-purple-800 border-purple-200',
  'connection': 'bg-blue-100 text-blue-800 border-blue-200',
  'reflection': 'bg-amber-100 text-amber-800 border-amber-200',
  'breathing': 'bg-teal-100 text-teal-800 border-teal-200',
  'movement': 'bg-green-100 text-green-800 border-green-200',
  'gratitude': 'bg-pink-100 text-pink-800 border-pink-200',
  'rest': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export function WellnessSuggestions() {
  const [showProgress, setShowProgress] = useState(false);
  const queryClient = useQueryClient();

  // Get auth headers - removed in favor of using apiRequest for consistency

  // Fetch wellness suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery<WellnessSuggestion[]>({
    queryKey: ['/api/wellness/suggestions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/wellness/suggestions?status=suggested');
      return response.json();
    },
  });

  // Fetch wellness progress
  const { data: progress } = useQuery<WellnessProgress>({
    queryKey: ['/api/wellness/progress'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/wellness/progress');
      return response.json();
    },
  });

  // Generate new suggestions
  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/wellness/generate-suggestions');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/suggestions'] });
    },
  });

  // Complete suggestion
  const completeSuggestionMutation = useMutation({
    mutationFn: async ({ id, points, badge }: { id: string; points: number; badge?: string }) => {
      const response = await apiRequest('PATCH', `/api/wellness/suggestions/${id}/complete`, {
        pointsAwarded: points,
        badgeAwarded: badge
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/progress'] });
    },
  });

  // Dismiss suggestion
  const dismissSuggestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PATCH', `/api/wellness/suggestions/${id}/dismiss`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/suggestions'] });
    },
  });

  const handleComplete = (suggestion: WellnessSuggestion) => {
    const points = getPointsForSuggestion(suggestion);
    const badge = getBadgeForSuggestion(suggestion, progress);
    
    completeSuggestionMutation.mutate({
      id: suggestion.id,
      points,
      badge,
    });
  };

  const handleDismiss = (suggestionId: string) => {
    dismissSuggestionMutation.mutate(suggestionId);
  };

  const handleGenerateNew = () => {
    generateSuggestionsMutation.mutate();
  };

  const getPointsForSuggestion = (suggestion: WellnessSuggestion): number => {
    const basePoints = {
      'self-care': 15,
      'mindfulness': 20,
      'connection': 10,
      'reflection': 12,
      'breathing': 8,
      'movement': 10,
      'gratitude': 5,
      'rest': 15,
    };
    return basePoints[suggestion.category as keyof typeof basePoints] || 10;
  };

  const getBadgeForSuggestion = (suggestion: WellnessSuggestion, progress?: WellnessProgress): string | undefined => {
    if (!progress) return undefined;
    
    const completedCount = progress.completedSuggestions.length + 1;
    const streak = progress.currentStreak + 1;
    
    if (completedCount === 1) return "First Steps";
    if (completedCount === 5) return "Wellness Explorer";
    if (completedCount === 10) return "Self-Care Champion";
    if (streak === 3) return "Consistency Builder";
    if (streak === 7) return "Weekly Warrior";
    if (suggestion.category === 'mindfulness' && completedCount % 3 === 0) return "Mindful Moment";
    
    return undefined;
  };

  if (suggestionsLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
            <CardTitle>Wellness Suggestions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress Section */}
      {progress && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader 
            className="cursor-pointer" 
            onClick={() => setShowProgress(!showProgress)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Wellness Journey</CardTitle>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {progress.totalPoints} points
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {progress.currentStreak} day streak
                </Badge>
              </div>
            </div>
          </CardHeader>
          {showProgress && (
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{progress.badges.length}</div>
                  <div className="text-sm text-gray-600">Badges Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{progress.longestStreak}</div>
                  <div className="text-sm text-gray-600">Longest Streak</div>
                </div>
              </div>
              {progress.badges.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Recent Badges:</div>
                  <div className="flex flex-wrap gap-2">
                    {progress.badges.slice(-3).map((badge, index) => (
                      <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        🏆 {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Suggestions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle>Gentle Wellness Suggestions</CardTitle>
            </div>
            <Button
              onClick={handleGenerateNew}
              disabled={generateSuggestionsMutation.isPending}
              variant="outline"
              size="sm"
            >
              {generateSuggestionsMutation.isPending ? 'Generating...' : 'New Suggestions'}
            </Button>
          </div>
          <CardDescription>
            Personalized suggestions to support your parenting wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No wellness suggestions available right now.</p>
              <Button onClick={handleGenerateNew} disabled={generateSuggestionsMutation.isPending}>
                {generateSuggestionsMutation.isPending ? 'Generating...' : 'Get Personalized Suggestions'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion: WellnessSuggestion) => {
                const IconComponent = categoryIcons[suggestion.category as keyof typeof categoryIcons] || Lightbulb;
                const categoryColor = categoryColors[suggestion.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800 border-gray-200';
                
                return (
                  <div
                    key={suggestion.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-purple-600" />
                        <Badge variant="outline" className={cn("text-xs", categoryColor)}>
                          {suggestion.category}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {getPointsForSuggestion(suggestion)} points
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{suggestion.description}</p>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleDismiss(suggestion.id)}
                        disabled={dismissSuggestionMutation.isPending}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Not Now
                      </Button>
                      <Button
                        onClick={() => handleComplete(suggestion)}
                        disabled={completeSuggestionMutation.isPending}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}