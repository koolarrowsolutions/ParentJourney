import { differenceInMonths, differenceInYears } from 'date-fns';

export interface DevelopmentalStage {
  key: string;
  label: string;
  ageRange: string;
  description: string;
  milestones: string[];
}

export const DEVELOPMENTAL_STAGES: DevelopmentalStage[] = [
  {
    key: 'infant',
    label: 'Infant',
    ageRange: '0-12 months',
    description: 'Rapid physical and cognitive development',
    milestones: ['Rolling over', 'Sitting up', 'First words', 'Walking']
  },
  {
    key: 'toddler',
    label: 'Toddler',
    ageRange: '1-3 years',
    description: 'Language development and independence',
    milestones: ['Potty training', 'Running', 'Two-word phrases', 'Playing with others']
  },
  {
    key: 'preschooler',
    label: 'Preschooler',
    ageRange: '3-5 years',
    description: 'Social skills and emotional regulation',
    milestones: ['Following rules', 'Drawing shapes', 'Dressing independently', 'Making friends']
  },
  {
    key: 'school_age',
    label: 'School Age',
    ageRange: '6-12 years',
    description: 'Academic learning and peer relationships',
    milestones: ['Reading fluently', 'Team sports', 'Problem solving', 'Independence']
  },
  {
    key: 'adolescent',
    label: 'Adolescent',
    ageRange: '13-18 years',
    description: 'Identity formation and abstract thinking',
    milestones: ['Identity exploration', 'Abstract reasoning', 'Peer influence', 'Future planning']
  },
  {
    key: 'young_adult',
    label: 'Young Adult',
    ageRange: '18+ years',
    description: 'Independence and life decisions',
    milestones: ['Career planning', 'Relationships', 'Financial independence', 'Personal values']
  }
];

export function calculateDevelopmentalStage(dateOfBirth: string): DevelopmentalStage {
  const birthDate = new Date(dateOfBirth);
  const now = new Date();
  const ageInMonths = differenceInMonths(now, birthDate);
  const ageInYears = differenceInYears(now, birthDate);

  if (ageInMonths < 12) {
    return DEVELOPMENTAL_STAGES[0]; // Infant
  } else if (ageInYears < 3) {
    return DEVELOPMENTAL_STAGES[1]; // Toddler
  } else if (ageInYears < 6) {
    return DEVELOPMENTAL_STAGES[2]; // Preschooler
  } else if (ageInYears < 13) {
    return DEVELOPMENTAL_STAGES[3]; // School Age
  } else if (ageInYears < 18) {
    return DEVELOPMENTAL_STAGES[4]; // Adolescent
  } else {
    return DEVELOPMENTAL_STAGES[5]; // Young Adult
  }
}

export function calculateAge(dateOfBirth: string): { years: number; months: number } {
  const birthDate = new Date(dateOfBirth);
  const now = new Date();
  const years = differenceInYears(now, birthDate);
  const months = differenceInMonths(now, birthDate) % 12;
  
  return { years, months };
}

export function formatAge(dateOfBirth: string): string {
  const { years, months } = calculateAge(dateOfBirth);
  
  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else if (years < 2) {
    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} old`;
  }
}