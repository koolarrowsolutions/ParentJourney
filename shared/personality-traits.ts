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
    description: "Loves art, music, and imaginative play",
    ageRelevant: "2-18 years"
  },
  {
    key: "bookworm",
    emoji: "📚",
    label: "Bookworm",
    description: "Loves stories, reading, and being read to",
    ageRelevant: "3-18 years"
  },
  {
    key: "builder_engineer",
    emoji: "🔧",
    label: "Builder & Engineer",
    description: "Loves building, taking things apart, and figuring out how things work",
    ageRelevant: "2-18 years"
  },
  {
    key: "nature_lover",
    emoji: "🌿",
    label: "Nature Lover",
    description: "Fascinated by animals, plants, and outdoor adventures",
    ageRelevant: "1-18 years"
  },
  {
    key: "performer",
    emoji: "🎭",
    label: "Performer",
    description: "Loves being on stage, singing, dancing, or acting",
    ageRelevant: "3-18 years"
  },
  {
    key: "helper",
    emoji: "🤝",
    label: "Little Helper",
    description: "Always wants to help with chores and take care of others",
    ageRelevant: "2-18 years"
  },
  {
    key: "leader",
    emoji: "👑",
    label: "Natural Leader",
    description: "Takes charge, organizes play, and guides other children",
    ageRelevant: "4-18 years"
  },
  {
    key: "follower",
    emoji: "👥",
    label: "Team Player",
    description: "Prefers following others' lead, cooperative in group settings",
    ageRelevant: "3-18 years"
  },
  {
    key: "detail_oriented",
    emoji: "🔍",
    label: "Detail Detective",
    description: "Notices small details others miss, very observant",
    ageRelevant: "4-18 years"
  },
  {
    key: "big_picture",
    emoji: "🌅",
    label: "Big Picture Thinker",
    description: "Sees the overall picture, thinks about abstract concepts",
    ageRelevant: "5-18 years"
  },
  {
    key: "cautious",
    emoji: "🛡️",
    label: "Cautious & Careful",
    description: "Thinks before acting, prefers safe and familiar situations",
    ageRelevant: "2-18 years"
  },
  {
    key: "competitive",
    emoji: "🏆",
    label: "Competitive Spirit",
    description: "Loves games, sports, and winning challenges",
    ageRelevant: "4-18 years"
  },
  {
    key: "collaborative",
    emoji: "🤗",
    label: "Collaborator",
    description: "Prefers working together rather than competing",
    ageRelevant: "3-18 years"
  },
  {
    key: "routine_lover",
    emoji: "⏰",
    label: "Routine Lover",
    description: "Thrives with predictable schedules and familiar patterns",
    ageRelevant: "1-18 years"
  },
  {
    key: "spontaneous",
    emoji: "🎲",
    label: "Spontaneous Spirit",
    description: "Loves surprises, changes, and unexpected adventures",
    ageRelevant: "3-18 years"
  },
  {
    key: "verbal_processor",
    emoji: "💬",
    label: "Chatty Communicator",
    description: "Processes thoughts by talking, loves conversations",
    ageRelevant: "2-18 years"
  },
  {
    key: "quiet_thinker",
    emoji: "🤫",
    label: "Quiet Thinker",
    description: "Processes internally, prefers listening to talking",
    ageRelevant: "2-18 years"
  },
  {
    key: "morning_person",
    emoji: "🌅",
    label: "Early Bird",
    description: "Most energetic and cheerful in the morning",
    ageRelevant: "1-18 years"
  },
  {
    key: "night_owl",
    emoji: "🦉",
    label: "Night Owl",
    description: "More alert and active in the evening",
    ageRelevant: "2-18 years"
  },
  {
    key: "hugger",
    emoji: "🤗",
    label: "Affectionate Hugger",
    description: "Shows love through physical touch and cuddles",
    ageRelevant: "0-18 years"
  },
  {
    key: "space_needer",
    emoji: "🏠",
    label: "Space Needer",
    description: "Prefers personal space and less physical affection",
    ageRelevant: "3-18 years"
  }
];

// Helper functions to get traits by age group  
export function getTraitsByAge(ageInMonths: number): PersonalityTrait[] {
  return PERSONALITY_TRAITS; // For now, return all traits regardless of age
}

export function getTraitByKey(key: string): PersonalityTrait | undefined {
  return PERSONALITY_TRAITS.find(trait => trait.key === key);
}