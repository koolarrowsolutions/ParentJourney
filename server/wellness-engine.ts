import OpenAI from 'openai';
import { WellnessSuggestion, SuggestionEngineContext, ENCOURAGEMENT_MESSAGES } from '../shared/wellness-suggestions';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Predefined gentle suggestions to avoid overwhelming users
const GENTLE_WELLNESS_LIBRARY: Omit<WellnessSuggestion, 'id'>[] = [
  // Quick Reset (2-3 minutes)
  {
    type: 'mindfulness',
    title: 'Three Deep Breaths',
    description: 'Take three slow, intentional breaths to reset your energy',
    estimatedTime: '1 minute',
    difficulty: 'easy',
    category: 'quick-reset',
    triggerConditions: ['stress_detected', 'overwhelm_keywords'],
    actionSteps: [
      'Sit comfortably and close your eyes',
      'Breathe in slowly for 4 counts',
      'Hold for 2 counts, then exhale for 6 counts',
      'Repeat two more times with intention'
    ],
    completionReward: {
      points: 5,
      message: 'You just gave yourself a precious moment of calm'
    },
    isOptional: true,
    priority: 'low'
  },
  
  {
    type: 'self-care',
    title: 'Micro Self-Care Check-In',
    description: 'A gentle 2-minute check-in with yourself',
    estimatedTime: '2 minutes',
    difficulty: 'easy',
    category: 'personal-growth',
    triggerConditions: ['low_energy', 'busy_day_detected'],
    actionSteps: [
      'Ask yourself: "What do I need right now?"',
      'Notice any tension in your body',
      'Give yourself one small comfort (water, stretch, kind thought)',
      'Acknowledge that you\'re doing your best'
    ],
    completionReward: {
      points: 8,
      message: 'Self-awareness is the first step to self-care'
    },
    isOptional: true,
    priority: 'low'
  },

  {
    type: 'connection',
    title: 'Gratitude Moment with Family',
    description: 'Share one thing you appreciate about each family member',
    estimatedTime: '3 minutes',
    difficulty: 'easy',
    category: 'family-connection',
    triggerConditions: ['positive_mood', 'evening_time'],
    actionSteps: [
      'Gather your family for a quick moment',
      'Share one specific thing you appreciated today about each person',
      'Let them know why it mattered to you',
      'No need for responses - just appreciation'
    ],
    completionReward: {
      points: 12,
      badge: 'connection-builder',
      message: 'You just strengthened your family bonds'
    },
    isOptional: true,
    priority: 'medium'
  },

  {
    type: 'celebration',
    title: 'Tiny Win Acknowledgment',
    description: 'Celebrate something small that went well today',
    estimatedTime: '1 minute',
    difficulty: 'easy',
    category: 'celebration',
    triggerConditions: ['journal_entry_completed', 'positive_patterns'],
    actionSteps: [
      'Think of one small thing that went well today',
      'Say out loud: "I handled that well"',
      'Take a moment to feel proud of yourself',
      'No achievement is too small to acknowledge'
    ],
    completionReward: {
      points: 6,
      message: 'Celebrating progress builds momentum'
    },
    isOptional: true,
    priority: 'low'
  },

  {
    type: 'creative',
    title: 'Emotion Doodle',
    description: 'Draw your current feeling - no artistic skill needed',
    estimatedTime: '3 minutes',
    difficulty: 'easy',
    category: 'stress-relief',
    triggerConditions: ['mixed_emotions', 'processing_day'],
    actionSteps: [
      'Get any paper and pen/pencil',
      'Draw shapes, lines, or patterns that match your current mood',
      'No rules - just let your hand move freely',
      'Notice what emerges without judgment'
    ],
    completionReward: {
      points: 10,
      message: 'Creative expression is healing'
    },
    isOptional: true,
    priority: 'low'
  },

  {
    type: 'energy-boost',
    title: 'Gentle Movement Moment',
    description: 'Move your body in whatever way feels good right now',
    estimatedTime: '2 minutes',
    difficulty: 'easy',
    category: 'stress-relief',
    triggerConditions: ['low_energy', 'sitting_too_long'],
    actionSteps: [
      'Stand up and stretch your arms overhead',
      'Roll your shoulders and neck gently',
      'Take a few steps or sway to imaginary music',
      'End with one deep breath and a smile'
    ],
    completionReward: {
      points: 7,
      message: 'Your body thanks you for the movement'
    },
    isOptional: true,
    priority: 'low'
  },

  {
    type: 'reflection',
    title: 'Pattern Pause',
    description: 'Gently notice a pattern from your recent experiences',
    estimatedTime: '4 minutes',
    difficulty: 'gentle',
    category: 'personal-growth',
    triggerConditions: ['multiple_entries_this_week', 'growth_opportunity'],
    actionSteps: [
      'Think about your last few days',
      'Notice one thing that keeps coming up (good or challenging)',
      'Ask yourself: "What is this teaching me?"',
      'Thank yourself for being aware'
    ],
    completionReward: {
      points: 15,
      badge: 'pattern-seeker',
      message: 'Awareness is the beginning of transformation'
    },
    isOptional: true,
    priority: 'medium'
  }
];

export class WellnessEngine {
  private suggestions: Map<string, WellnessSuggestion> = new Map();

  constructor() {
    this.initializeSuggestions();
  }

  private initializeSuggestions() {
    GENTLE_WELLNESS_LIBRARY.forEach((suggestion, index) => {
      const id = `wellness_${suggestion.type}_${index}`;
      this.suggestions.set(id, { ...suggestion, id });
    });
  }

  // Intelligently select suggestions based on context without being overwhelming
  async generatePersonalizedSuggestions(
    context: SuggestionEngineContext,
    userPreferences: { maxSuggestionsPerDay: number; frequencyPreference: string; enableGamification: boolean }
  ): Promise<WellnessSuggestion[]> {
    
    // Respect user's frequency preferences
    if (userPreferences.frequencyPreference === 'minimal' && context.daysSinceLastSuggestion < 3) {
      return [];
    }
    
    if (userPreferences.frequencyPreference === 'occasional' && context.daysSinceLastSuggestion < 1) {
      return [];
    }

    const matchingSuggestions = Array.from(this.suggestions.values()).filter(suggestion => {
      return this.matchesTriggerConditions(suggestion, context);
    });

    // Sort by priority and select gently
    const sortedSuggestions = matchingSuggestions
      .sort((a, b) => {
        const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, Math.min(userPreferences.maxSuggestionsPerDay, 2)); // Never more than 2 per day

    // Personalize suggestions with user's family context
    return this.personalizeWithContext(sortedSuggestions, context);
  }

  private matchesTriggerConditions(suggestion: WellnessSuggestion, context: SuggestionEngineContext): boolean {
    const triggers = suggestion.triggerConditions;
    
    // Stress detection
    if (triggers.includes('stress_detected')) {
      const avgMood = context.recentMoodScores.reduce((a, b) => a + b, 0) / context.recentMoodScores.length;
      if (avgMood < 6) return true;
    }

    // Positive mood
    if (triggers.includes('positive_mood')) {
      const avgMood = context.recentMoodScores.reduce((a, b) => a + b, 0) / context.recentMoodScores.length;
      if (avgMood >= 7) return true;
    }

    // Overwhelm keywords
    if (triggers.includes('overwhelm_keywords')) {
      const overwhelmWords = ['overwhelm', 'exhausted', 'too much', 'stressed', 'difficult'];
      if (context.recentEntryKeywords.some(keyword => 
        overwhelmWords.some(word => keyword.toLowerCase().includes(word))
      )) return true;
    }

    // Evening time
    if (triggers.includes('evening_time') && context.timeOfDay === 'evening') {
      return true;
    }

    // Always allow gentle, low-priority suggestions
    if (suggestion.priority === 'low' && Math.random() > 0.7) {
      return true;
    }

    return false;
  }

  private personalizeWithContext(suggestions: WellnessSuggestion[], context: SuggestionEngineContext): WellnessSuggestion[] {
    return suggestions.map(suggestion => {
      let personalizedDescription = suggestion.description;
      let personalizedSteps = [...suggestion.actionSteps];

      // Add gentle personalization with family context
      if (context.familyDynamics.parentName && suggestion.type === 'self-care') {
        personalizedDescription = `${context.familyDynamics.parentName}, ${suggestion.description.toLowerCase()}`;
      }

      if (suggestion.type === 'connection' && context.familyDynamics.childAges.length > 0) {
        const childNames = context.familyDynamics.childAges.map(c => c.name).join(' and ');
        personalizedSteps = personalizedSteps.map(step => 
          step.replace('family member', childNames)
        );
      }

      return {
        ...suggestion,
        description: personalizedDescription,
        actionSteps: personalizedSteps
      };
    });
  }

  // Generate AI-powered personalized suggestion when appropriate
  async generateAIPersonalizedSuggestion(context: SuggestionEngineContext): Promise<WellnessSuggestion | null> {
    try {
      const prompt = `Based on this parent's recent experiences, suggest ONE gentle wellness activity:

Parent: ${context.familyDynamics.parentName}
Children: ${context.familyDynamics.childAges.map(c => `${c.name} (${c.age} years)`).join(', ')}
Recent mood pattern: ${context.recentMoodScores.join(', ')}/10
Recent themes: ${context.recentEntryKeywords.slice(0, 5).join(', ')}
Recent challenges: ${context.familyDynamics.recentChallenges.join(', ')}

Guidelines:
- Keep it simple (2-5 minutes maximum)
- Make it optional and gentle
- Focus on self-compassion, not pressure
- Address their specific situation
- Make it actionable and realistic

Please provide a JSON response with this structure:
{
  "title": "Brief, encouraging title",
  "description": "Gentle description that acknowledges their situation",
  "estimatedTime": "X minutes",
  "actionSteps": ["Simple step 1", "Simple step 2", "Simple step 3"],
  "encouragementMessage": "Supportive message that validates their efforts"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 400
      });

      const aiSuggestion = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        id: `ai_personalized_${Date.now()}`,
        type: 'gentle-nudge',
        title: aiSuggestion.title,
        description: aiSuggestion.description,
        estimatedTime: aiSuggestion.estimatedTime,
        difficulty: 'gentle' as const,
        category: 'personal-growth' as const,
        triggerConditions: ['ai_personalized'],
        actionSteps: aiSuggestion.actionSteps,
        completionReward: {
          points: 20,
          message: aiSuggestion.encouragementMessage
        },
        isOptional: true,
        priority: 'medium' as const
      };

    } catch (error) {
      console.error('Error generating AI personalized suggestion:', error);
      return null;
    }
  }

  getRandomEncouragement(): string {
    return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
  }
}

export const wellnessEngine = new WellnessEngine();