// Age-appropriate milestone system for children

export interface Milestone {
  id: string;
  title: string;
  description: string;
  ageRange: {
    min: number; // months
    max: number; // months
  };
  category: 'physical' | 'cognitive' | 'social' | 'emotional' | 'language';
  priority: 'high' | 'medium' | 'low';
  isCustom?: boolean;
}

export const DEVELOPMENTAL_MILESTONES: Milestone[] = [
  // 0-6 months
  {
    id: 'smile-social',
    title: 'First Social Smile',
    description: 'Smiles in response to others, not just reflexively',
    ageRange: { min: 1, max: 3 },
    category: 'social',
    priority: 'high'
  },
  {
    id: 'hold-head',
    title: 'Holds Head Up',
    description: 'Can hold head steady when sitting with support',
    ageRange: { min: 2, max: 4 },
    category: 'physical',
    priority: 'high'
  },
  {
    id: 'roll-over',
    title: 'Rolls Over',
    description: 'Rolls from tummy to back or back to tummy',
    ageRange: { min: 4, max: 6 },
    category: 'physical',
    priority: 'high'
  },
  {
    id: 'respond-name',
    title: 'Responds to Name',
    description: 'Turns head or shows recognition when name is called',
    ageRange: { min: 4, max: 7 },
    category: 'language',
    priority: 'high'
  },

  // 6-12 months
  {
    id: 'sits-alone',
    title: 'Sits Without Support',
    description: 'Can sit independently without falling over',
    ageRange: { min: 6, max: 9 },
    category: 'physical',
    priority: 'high'
  },
  {
    id: 'stranger-anxiety',
    title: 'Shows Stranger Anxiety',
    description: 'Shows wariness or distress around unfamiliar people',
    ageRange: { min: 6, max: 12 },
    category: 'emotional',
    priority: 'medium'
  },
  {
    id: 'crawls',
    title: 'Crawls',
    description: 'Moves around by crawling on hands and knees',
    ageRange: { min: 7, max: 10 },
    category: 'physical',
    priority: 'high'
  },
  {
    id: 'says-mama-dada',
    title: 'Says "Mama" or "Dada"',
    description: 'Says first words with meaning, not just babbling',
    ageRange: { min: 8, max: 12 },
    category: 'language',
    priority: 'high'
  },
  {
    id: 'pulls-to-stand',
    title: 'Pulls to Stand',
    description: 'Can pull themselves up to standing position',
    ageRange: { min: 9, max: 12 },
    category: 'physical',
    priority: 'high'
  },

  // 12-18 months
  {
    id: 'walks-alone',
    title: 'Walks Independently',
    description: 'Takes first independent steps without support',
    ageRange: { min: 12, max: 18 },
    category: 'physical',
    priority: 'high'
  },
  {
    id: 'first-words',
    title: 'Says 2-3 Words',
    description: 'Has a vocabulary of 2-3 clear words besides mama/dada',
    ageRange: { min: 12, max: 18 },
    category: 'language',
    priority: 'high'
  },
  {
    id: 'points-objects',
    title: 'Points to Objects',
    description: 'Points to things they want or find interesting',
    ageRange: { min: 12, max: 16 },
    category: 'cognitive',
    priority: 'medium'
  },

  // 18-24 months
  {
    id: 'runs',
    title: 'Runs',
    description: 'Can run, though may be unsteady',
    ageRange: { min: 16, max: 24 },
    category: 'physical',
    priority: 'medium'
  },
  {
    id: 'two-word-phrases',
    title: 'Uses Two-Word Phrases',
    description: 'Combines words like "more milk" or "go car"',
    ageRange: { min: 18, max: 24 },
    category: 'language',
    priority: 'high'
  },
  {
    id: 'parallel-play',
    title: 'Parallel Play',
    description: 'Plays alongside other children, but not directly with them',
    ageRange: { min: 18, max: 30 },
    category: 'social',
    priority: 'medium'
  },

  // 2-3 years
  {
    id: 'potty-training',
    title: 'Potty Training',
    description: 'Shows interest in or begins potty training',
    ageRange: { min: 20, max: 36 },
    category: 'physical',
    priority: 'high'
  },
  {
    id: 'speaks-sentences',
    title: 'Speaks in Sentences',
    description: 'Uses 3-4 word sentences regularly',
    ageRange: { min: 24, max: 36 },
    category: 'language',
    priority: 'high'
  },
  {
    id: 'plays-pretend',
    title: 'Pretend Play',
    description: 'Engages in imaginative play (feeding dolls, pretend cooking)',
    ageRange: { min: 24, max: 36 },
    category: 'cognitive',
    priority: 'medium'
  },

  // 3-4 years
  {
    id: 'pedals-tricycle',
    title: 'Pedals Tricycle',
    description: 'Can pedal and steer a tricycle',
    ageRange: { min: 30, max: 48 },
    category: 'physical',
    priority: 'medium'
  },
  {
    id: 'tells-stories',
    title: 'Tells Simple Stories',
    description: 'Can tell short stories or describe events',
    ageRange: { min: 36, max: 48 },
    category: 'language',
    priority: 'medium'
  },
  {
    id: 'plays-with-others',
    title: 'Cooperative Play',
    description: 'Plays cooperatively with other children',
    ageRange: { min: 36, max: 48 },
    category: 'social',
    priority: 'high'
  },

  // 4-5 years
  {
    id: 'hops-one-foot',
    title: 'Hops on One Foot',
    description: 'Can hop on one foot several times',
    ageRange: { min: 42, max: 60 },
    category: 'physical',
    priority: 'medium'
  },
  {
    id: 'draws-person',
    title: 'Draws a Person',
    description: 'Can draw a person with 2-4 body parts',
    ageRange: { min: 48, max: 60 },
    category: 'cognitive',
    priority: 'medium'
  },
  {
    id: 'understands-rules',
    title: 'Understands Game Rules',
    description: 'Can understand and follow simple game rules',
    ageRange: { min: 48, max: 60 },
    category: 'cognitive',
    priority: 'medium'
  },

  // 5-6 years
  {
    id: 'rides-bike',
    title: 'Rides Bike with Training Wheels',
    description: 'Can ride a bicycle with training wheels',
    ageRange: { min: 48, max: 72 },
    category: 'physical',
    priority: 'medium'
  },
  {
    id: 'counts-to-ten',
    title: 'Counts to 10',
    description: 'Can count from 1 to 10 correctly',
    ageRange: { min: 48, max: 72 },
    category: 'cognitive',
    priority: 'high'
  },
  {
    id: 'writes-name',
    title: 'Writes Own Name',
    description: 'Can write their first name, even if letters are imperfect',
    ageRange: { min: 54, max: 72 },
    category: 'cognitive',
    priority: 'high'
  },

  // 6-8 years (Elementary School)
  {
    id: 'reads-independently',
    title: 'Reads Simple Books Independently',
    description: 'Can read age-appropriate books without help',
    ageRange: { min: 72, max: 96 },
    category: 'cognitive',
    priority: 'high'
  },
  {
    id: 'basic-math',
    title: 'Basic Math Skills',
    description: 'Can add and subtract simple numbers',
    ageRange: { min: 72, max: 96 },
    category: 'cognitive',
    priority: 'high'
  },
  {
    id: 'rides-bike-no-training',
    title: 'Rides Bike Without Training Wheels',
    description: 'Can balance and ride a two-wheel bicycle',
    ageRange: { min: 72, max: 108 },
    category: 'physical',
    priority: 'medium'
  },
  {
    id: 'team-sports',
    title: 'Participates in Team Sports',
    description: 'Can follow rules and work as part of a team',
    ageRange: { min: 84, max: 120 },
    category: 'social',
    priority: 'medium'
  },

  // 8-10 years (Middle Elementary)
  {
    id: 'multiplication-tables',
    title: 'Knows Multiplication Tables',
    description: 'Can recite basic multiplication facts',
    ageRange: { min: 96, max: 120 },
    category: 'cognitive',
    priority: 'high'
  },
  {
    id: 'complex-friendships',
    title: 'Forms Complex Friendships',
    description: 'Develops deeper friendships with shared interests',
    ageRange: { min: 96, max: 132 },
    category: 'social',
    priority: 'high'
  },
  {
    id: 'household-responsibilities',
    title: 'Takes on Household Responsibilities',
    description: 'Can complete age-appropriate chores independently',
    ageRange: { min: 96, max: 144 },
    category: 'emotional',
    priority: 'medium'
  },

  // 10-12 years (Pre-adolescence)
  {
    id: 'abstract-thinking',
    title: 'Develops Abstract Thinking',
    description: 'Can understand concepts beyond concrete experiences',
    ageRange: { min: 120, max: 144 },
    category: 'cognitive',
    priority: 'high'
  },
  {
    id: 'peer-acceptance',
    title: 'Seeks Peer Acceptance',
    description: 'Shows increased concern about fitting in with peers',
    ageRange: { min: 120, max: 156 },
    category: 'social',
    priority: 'high'
  },
  {
    id: 'body-changes-awareness',
    title: 'Awareness of Body Changes',
    description: 'Begins to notice and understand physical development',
    ageRange: { min: 120, max: 156 },
    category: 'physical',
    priority: 'high'
  },

  // 12-14 years (Early Adolescence)
  {
    id: 'identity-exploration',
    title: 'Identity Exploration',
    description: 'Begins exploring personal identity and values',
    ageRange: { min: 144, max: 168 },
    category: 'emotional',
    priority: 'high'
  },
  {
    id: 'peer-influence',
    title: 'Strong Peer Influence',
    description: 'Peer opinions become very important in decision-making',
    ageRange: { min: 144, max: 180 },
    category: 'social',
    priority: 'high'
  },
  {
    id: 'puberty-changes',
    title: 'Puberty Development',
    description: 'Experiences significant physical and hormonal changes',
    ageRange: { min: 132, max: 180 },
    category: 'physical',
    priority: 'high'
  },
  {
    id: 'emotional-intensity',
    title: 'Emotional Intensity',
    description: 'Experiences heightened emotions and mood swings',
    ageRange: { min: 144, max: 180 },
    category: 'emotional',
    priority: 'high'
  },

  // 14-16 years (Mid Adolescence)
  {
    id: 'independence-seeking',
    title: 'Seeks Independence',
    description: 'Strong desire for autonomy and independence from parents',
    ageRange: { min: 168, max: 192 },
    category: 'emotional',
    priority: 'high'
  },
  {
    id: 'romantic-interests',
    title: 'Romantic Interests',
    description: 'Develops interest in romantic relationships',
    ageRange: { min: 156, max: 204 },
    category: 'social',
    priority: 'medium'
  },
  {
    id: 'future-planning',
    title: 'Future Planning',
    description: 'Begins thinking seriously about future goals and careers',
    ageRange: { min: 168, max: 204 },
    category: 'cognitive',
    priority: 'high'
  },
  {
    id: 'risk-taking-behavior',
    title: 'Risk-Taking Awareness',
    description: 'May engage in risk-taking behaviors while developing judgment',
    ageRange: { min: 168, max: 204 },
    category: 'emotional',
    priority: 'high'
  },

  // 16-18 years (Late Adolescence)
  {
    id: 'adult-responsibilities',
    title: 'Adult Responsibilities',
    description: 'Takes on more adult-like responsibilities and decision-making',
    ageRange: { min: 192, max: 216 },
    category: 'emotional',
    priority: 'high'
  },
  {
    id: 'driving-independence',
    title: 'Driving Independence',
    description: 'Learns to drive and gains transportation independence',
    ageRange: { min: 192, max: 216 },
    category: 'physical',
    priority: 'medium'
  },
  {
    id: 'college-preparation',
    title: 'College/Career Preparation',
    description: 'Actively prepares for post-secondary education or career',
    ageRange: { min: 192, max: 216 },
    category: 'cognitive',
    priority: 'high'
  },
  {
    id: 'value-system',
    title: 'Personal Value System',
    description: 'Develops a more stable personal value system and beliefs',
    ageRange: { min: 192, max: 216 },
    category: 'emotional',
    priority: 'high'
  },
  {
    id: 'transition-adulthood',
    title: 'Transition to Adulthood',
    description: 'Prepares for the transition from adolescence to young adulthood',
    ageRange: { min: 204, max: 216 },
    category: 'emotional',
    priority: 'high'
  }
];

// Calculate child's age in months from birth date
export function calculateAgeInMonths(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const currentDate = new Date();
  
  const yearDiff = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();
  
  return yearDiff * 12 + monthDiff;
}

// Get age-appropriate milestones for a child
export function getAgeAppropriateMilestones(dateOfBirth: string, customMilestones: Milestone[] = []): Milestone[] {
  const ageInMonths = calculateAgeInMonths(dateOfBirth);
  
  // Include milestones that are relevant within 6 months before to 12 months after current age
  const relevantMilestones = DEVELOPMENTAL_MILESTONES.filter(milestone => {
    const isRelevant = (
      milestone.ageRange.min <= ageInMonths + 12 && // Not too far in future
      milestone.ageRange.max >= ageInMonths - 6    // Not too far in past
    );
    return isRelevant;
  });

  // Add custom milestones
  const allMilestones = [...relevantMilestones, ...customMilestones];
  
  // Sort by priority (high first) then by age range
  return allMilestones.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    return a.ageRange.min - b.ageRange.min;
  });
}

// Get milestone status based on child's age
export function getMilestoneStatus(milestone: Milestone, childAgeInMonths: number): 'upcoming' | 'current' | 'overdue' | 'past' {
  if (childAgeInMonths < milestone.ageRange.min) {
    return 'upcoming';
  } else if (childAgeInMonths >= milestone.ageRange.min && childAgeInMonths <= milestone.ageRange.max) {
    return 'current';
  } else if (childAgeInMonths > milestone.ageRange.max && childAgeInMonths <= milestone.ageRange.max + 6) {
    return 'overdue';
  } else {
    return 'past';
  }
}

// Format age range for display
export function formatAgeRange(ageRange: { min: number; max: number }): string {
  const formatMonths = (months: number): string => {
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years}y`;
    return `${years}y ${remainingMonths}mo`;
  };

  return `${formatMonths(ageRange.min)} - ${formatMonths(ageRange.max)}`;
}

// Get category emoji
export function getCategoryEmoji(category: Milestone['category']): string {
  const emojiMap = {
    physical: '🏃‍♂️',
    cognitive: '🧠',
    social: '👥',
    emotional: '💕',
    language: '🗣️'
  };
  return emojiMap[category];
}

// Get status color
export function getStatusColor(status: ReturnType<typeof getMilestoneStatus>): string {
  const colorMap = {
    upcoming: 'bg-blue-100 text-blue-800',
    current: 'bg-green-100 text-green-800',
    overdue: 'bg-amber-100 text-amber-800', 
    past: 'bg-gray-100 text-gray-600'
  };
  return colorMap[status];
}