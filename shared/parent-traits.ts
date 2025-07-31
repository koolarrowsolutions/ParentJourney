export interface ParentPersonalityTrait {
  key: string;
  label: string;
  description: string;
  category: string;
}

export const PARENT_PERSONALITY_TRAITS: ParentPersonalityTrait[] = [
  // Communication Style
  { key: "direct-communicator", label: "Direct Communicator", description: "Clear and straightforward in conversations", category: "Communication" },
  { key: "gentle-communicator", label: "Gentle Communicator", description: "Soft-spoken and nurturing in approach", category: "Communication" },
  { key: "active-listener", label: "Active Listener", description: "Pays close attention to what children say", category: "Communication" },
  { key: "storyteller", label: "Storyteller", description: "Uses stories and examples to teach and connect", category: "Communication" },

  // Emotional Style
  { key: "patient", label: "Patient", description: "Maintains calm in challenging situations", category: "Emotional" },
  { key: "empathetic", label: "Empathetic", description: "Understands and shares children's feelings", category: "Emotional" },
  { key: "optimistic", label: "Optimistic", description: "Focuses on positive aspects and possibilities", category: "Emotional" },
  { key: "mindful", label: "Mindful", description: "Present and aware in parenting moments", category: "Emotional" },
  { key: "resilient", label: "Resilient", description: "Bounces back from parenting challenges", category: "Emotional" },

  // Teaching & Guidance Style
  { key: "structured", label: "Structured", description: "Prefers clear rules and consistent routines", category: "Teaching" },
  { key: "flexible", label: "Flexible", description: "Adapts approach based on situation", category: "Teaching" },
  { key: "encouraging", label: "Encouraging", description: "Focuses on building confidence and self-esteem", category: "Teaching" },
  { key: "educational", label: "Educational", description: "Turns everyday moments into learning opportunities", category: "Teaching" },
  { key: "democratic", label: "Democratic", description: "Involves children in decision-making when appropriate", category: "Teaching" },

  // Energy & Approach
  { key: "energetic", label: "Energetic", description: "High energy and enthusiasm for activities", category: "Energy" },
  { key: "calm", label: "Calm", description: "Maintains peaceful energy and demeanor", category: "Energy" },
  { key: "playful", label: "Playful", description: "Enjoys games, humor, and fun activities", category: "Energy" },
  { key: "spontaneous", label: "Spontaneous", description: "Embraces unexpected moments and adventures", category: "Energy" },
  { key: "thoughtful", label: "Thoughtful", description: "Considers decisions carefully and plans ahead", category: "Energy" },

  // Values & Priorities
  { key: "independence-focused", label: "Independence-Focused", description: "Prioritizes building self-reliance", category: "Values" },
  { key: "connection-focused", label: "Connection-Focused", description: "Prioritizes emotional bonds and relationships", category: "Values" },
  { key: "achievement-oriented", label: "Achievement-Oriented", description: "Values accomplishments and goal-setting", category: "Values" },
  { key: "process-oriented", label: "Process-Oriented", description: "Values effort and learning over outcomes", category: "Values" },
  { key: "creative", label: "Creative", description: "Encourages artistic expression and imagination", category: "Values" },

  // Problem-Solving Style
  { key: "analytical", label: "Analytical", description: "Approaches problems methodically", category: "Problem-Solving" },
  { key: "intuitive", label: "Intuitive", description: "Trusts instincts in parenting decisions", category: "Problem-Solving" },
  { key: "collaborative", label: "Collaborative", description: "Works with children to solve problems together", category: "Problem-Solving" },
  { key: "protective", label: "Protective", description: "Prioritizes safety and security", category: "Problem-Solving" },
];

export const PARENTING_STYLES = [
  { value: "authoritative", label: "Authoritative", description: "High responsiveness, high demands. Warm but firm with clear expectations." },
  { value: "permissive", label: "Permissive", description: "High responsiveness, low demands. Warm and accepting with few rules." },
  { value: "authoritarian", label: "Authoritarian", description: "Low responsiveness, high demands. Strict with clear rules and expectations." },
  { value: "uninvolved", label: "Uninvolved", description: "Low responsiveness, low demands. Hands-off approach with minimal involvement." },
  { value: "balanced", label: "Balanced/Adaptive", description: "Flexible approach that adapts based on situation and child's needs." },
  { value: "gentle", label: "Gentle Parenting", description: "Emphasizes empathy, respect, understanding, and boundaries." },
  { value: "positive", label: "Positive Parenting", description: "Focuses on positive reinforcement and building strong relationships." },
];

export const COMMON_STRESSORS = [
  "Tantrums and meltdowns",
  "Sleep issues",
  "Meal times and picky eating",
  "Screen time management",
  "Homework and school challenges",
  "Sibling conflicts",
  "Discipline and setting boundaries",
  "Time management and scheduling",
  "Work-life balance",
  "Financial pressures",
  "Extended family dynamics",
  "Social pressures and comparisons",
  "Child's emotional needs",
  "Safety concerns",
  "Developmental milestones",
];

export function getParentTraitsByCategory(category?: string): ParentPersonalityTrait[] {
  if (!category) return PARENT_PERSONALITY_TRAITS;
  return PARENT_PERSONALITY_TRAITS.filter(trait => trait.category === category);
}

export function getParentTraitByKey(key: string): ParentPersonalityTrait | undefined {
  return PARENT_PERSONALITY_TRAITS.find(trait => trait.key === key);
}

export const PARENT_TRAIT_CATEGORIES = [
  "Communication",
  "Emotional", 
  "Teaching",
  "Energy",
  "Values",
  "Problem-Solving"
];