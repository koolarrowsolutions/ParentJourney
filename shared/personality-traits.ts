// Developmentally relevant personality traits and characteristics for children
export interface PersonalityTrait {
  key: string;
  emoji: string;
  label: string;
  description: string;
  ageRelevant: string; // Age ranges where this trait is most relevant
}

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  // Social & Emotional Development
  {
    key: "social_butterfly",
    emoji: "🦋",
    label: "Social Butterfly",
    description: "Loves being around people, makes friends easily",
    ageRelevant: "2-18 years"
  },
  {
    key: "sensitive_soul",
    emoji: "🌸",
    label: "Sensitive Soul", 
    description: "Feels emotions deeply, empathetic to others",
    ageRelevant: "1-18 years"
  },
  {
    key: "independent_spirit",
    emoji: "🦅",
    label: "Independent Spirit",
    description: "Prefers doing things alone, self-reliant",
    ageRelevant: "2-18 years"
  },
  {
    key: "people_pleaser",
    emoji: "😊",
    label: "People Pleaser",
    description: "Wants to make everyone happy, avoids conflict",
    ageRelevant: "3-18 years"
  },

  // Energy & Activity Levels
  {
    key: "energizer_bunny",
    emoji: "⚡",
    label: "Energizer Bunny",
    description: "High energy, always on the move",
    ageRelevant: "1-18 years"
  },
  {
    key: "calm_observer",
    emoji: "🧘",
    label: "Calm Observer",
    description: "Thoughtful, prefers watching before acting",
    ageRelevant: "2-18 years"
  },
  {
    key: "thrill_seeker",
    emoji: "🎢",
    label: "Thrill Seeker",
    description: "Loves adventure and taking risks",
    ageRelevant: "3-18 years"
  },

  // Learning & Curiosity
  {
    key: "little_scientist",
    emoji: "🔬",
    label: "Little Scientist",
    description: "Always asking 'why?', loves experimenting",
    ageRelevant: "2-18 years"
  },
  {
    key: "creative_artist",
    emoji: "🎨",
    label: "Creative Artist",
    description: "Loves art, music, and creative expression",
    ageRelevant: "2-18 years"
  },
  {
    key: "bookworm",
    emoji: "📚",
    label: "Bookworm",
    description: "Loves stories, reading, and learning",
    ageRelevant: "3-18 years"
  },
  {
    key: "perfectionist",
    emoji: "💎",
    label: "Perfectionist",
    description: "Wants everything done just right",
    ageRelevant: "4-18 years"
  },

  // Communication & Expression
  {
    key: "chatterbox",
    emoji: "💬",
    label: "Chatterbox",
    description: "Loves to talk and share stories",
    ageRelevant: "2-18 years"
  },
  {
    key: "quiet_thinker",
    emoji: "🤔",
    label: "Quiet Thinker",
    description: "Processes internally, speaks thoughtfully",
    ageRelevant: "2-18 years"
  },
  {
    key: "class_clown",
    emoji: "🤡",
    label: "Class Clown",
    description: "Loves making others laugh, entertainer",
    ageRelevant: "3-18 years"
  },

  // Behavior & Temperament
  {
    key: "rule_follower",
    emoji: "📋",
    label: "Rule Follower",
    description: "Likes structure and following directions",
    ageRelevant: "3-18 years"
  },
  {
    key: "rebel_spirit",
    emoji: "😤",
    label: "Rebel Spirit",
    description: "Questions authority, pushes boundaries",
    ageRelevant: "2-18 years"
  },
  {
    key: "helper_heart",
    emoji: "🤝",
    label: "Helper Heart",
    description: "Loves helping others and being useful",
    ageRelevant: "2-18 years"
  },
  {
    key: "strong_willed",
    emoji: "💪",
    label: "Strong-Willed",
    description: "Determined, knows what they want",
    ageRelevant: "1-18 years"
  },

  // Anxiety & Comfort
  {
    key: "cautious_cat",
    emoji: "🐱",
    label: "Cautious Cat",
    description: "Takes time to warm up, prefers familiar",
    ageRelevant: "1-18 years"
  },
  {
    key: "routine_lover",
    emoji: "🕐",
    label: "Routine Lover",
    description: "Thrives on predictability and schedules",
    ageRelevant: "1-18 years"
  },
  {
    key: "flexible_friend",
    emoji: "🌈",
    label: "Flexible Friend",
    description: "Adapts easily to changes and new situations",
    ageRelevant: "2-18 years"
  },

  // Physical & Sensory
  {
    key: "sensory_seeker",
    emoji: "🌀",
    label: "Sensory Seeker",
    description: "Needs lots of physical input and movement",
    ageRelevant: "1-18 years"
  },
  {
    key: "sensory_sensitive",
    emoji: "🎧",
    label: "Sensory Sensitive",
    description: "Overwhelmed by loud noises or textures",
    ageRelevant: "1-18 years"
  },
  {
    key: "nature_lover",
    emoji: "🌿",
    label: "Nature Lover",
    description: "Happiest outdoors, loves animals and plants",
    ageRelevant: "1-18 years"
  },

  // Leadership & Social Dynamics
  {
    key: "natural_leader",
    emoji: "👑",
    label: "Natural Leader",
    description: "Takes charge, organizes others",
    ageRelevant: "3-18 years"
  },
  {
    key: "team_player",
    emoji: "⚽",
    label: "Team Player",
    description: "Works well with others, collaborative",
    ageRelevant: "3-18 years"
  },
  {
    key: "gentle_giant",
    emoji: "🐻",
    label: "Gentle Giant",
    description: "Big heart, protective of younger/smaller ones",
    ageRelevant: "3-18 years"
  }
];

export function getTraitsByAge(ageInMonths: number): PersonalityTrait[] {
  const ageInYears = Math.floor(ageInMonths / 12);
  
  return PERSONALITY_TRAITS.filter(trait => {
    const [minAge, maxAge] = trait.ageRelevant.split('-').map(age => parseInt(age));
    return ageInYears >= minAge && ageInYears <= maxAge;
  });
}

export function getTraitByKey(key: string): PersonalityTrait | undefined {
  return PERSONALITY_TRAITS.find(trait => trait.key === key);
}