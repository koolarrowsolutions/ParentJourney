import { z } from 'zod';

// Wellness Suggestion Types
export const WellnessSuggestionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'mindfulness', 'connection', 'self-care', 'creative', 'problem-solving', 
    'energy-boost', 'reflection', 'celebration', 'gentle-nudge'
  ]),
  title: z.string(),
  description: z.string(),
  estimatedTime: z.string(), // "2 minutes", "5-10 minutes"
  difficulty: z.enum(['easy', 'moderate', 'gentle']),
  category: z.enum([
    'quick-reset', 'family-connection', 'personal-growth', 
    'stress-relief', 'celebration', 'reflection'
  ]),
  triggerConditions: z.array(z.string()),
  actionSteps: z.array(z.string()),
  completionReward: z.object({
    points: z.number(),
    badge: z.string().optional(),
    message: z.string()
  }),
  isOptional: z.boolean().default(true),
  priority: z.enum(['low', 'medium', 'high']).default('low')
});

export const UserWellnessProgressSchema = z.object({
  userId: z.string(),
  totalPoints: z.number().default(0),
  streak: z.number().default(0),
  badges: z.array(z.string()).default([]),
  completedSuggestions: z.array(z.string()).default([]),
  dismissedSuggestions: z.array(z.string()).default([]),
  preferences: z.object({
    frequencyPreference: z.enum(['minimal', 'occasional', 'regular']).default('occasional'),
    preferredTimes: z.array(z.enum(['morning', 'afternoon', 'evening'])).default(['evening']),
    enableGamification: z.boolean().default(true),
    maxSuggestionsPerDay: z.number().default(2)
  }),
  lastSuggestionDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const SuggestionEngineContextSchema = z.object({
  recentMoodScores: z.array(z.number()),
  recentEntryKeywords: z.array(z.string()),
  stressPatterns: z.array(z.string()),
  successPatterns: z.array(z.string()),
  familyDynamics: z.object({
    childAges: z.array(z.object({
      name: z.string(),
      age: z.number()
    })),
    recentChallenges: z.array(z.string()),
    parentName: z.string()
  }),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
  daysSinceLastSuggestion: z.number()
});

export type WellnessSuggestion = z.infer<typeof WellnessSuggestionSchema>;
export type UserWellnessProgress = z.infer<typeof UserWellnessProgressSchema>;
export type SuggestionEngineContext = z.infer<typeof SuggestionEngineContextSchema>;

// Gentle Gamification Elements
export const WELLNESS_BADGES = {
  'mindful-moment': { name: 'Mindful Moment', icon: '🧘', description: 'Completed 5 mindfulness activities' },
  'connection-builder': { name: 'Connection Builder', icon: '💝', description: 'Strengthened family bonds 3 times' },
  'self-care-champion': { name: 'Self-Care Champion', icon: '🌸', description: 'Prioritized yourself 7 times' },
  'gentle-warrior': { name: 'Gentle Warrior', icon: '🌱', description: 'Faced challenges with grace 5 times' },
  'celebration-expert': { name: 'Celebration Expert', icon: '🎉', description: 'Acknowledged wins 10 times' },
  'pattern-seeker': { name: 'Pattern Seeker', icon: '🔍', description: 'Reflected on patterns 5 times' },
  'energy-guardian': { name: 'Energy Guardian', icon: '⚡', description: 'Boosted energy 8 times' },
  'weekly-wellness': { name: 'Weekly Wellness', icon: '📅', description: '7-day wellness streak' }
};

export const ENCOURAGEMENT_MESSAGES = [
  "Small steps create big changes",
  "You're building beautiful habits",
  "Every moment of self-care matters",
  "Your family benefits from your wellness",
  "Progress, not perfection",
  "You're exactly where you need to be",
  "Your awareness is already growth"
];