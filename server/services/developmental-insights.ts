// Developmental insights based on child's age
export function generateDevelopmentalInsight(ageInMonths: number): string {
  if (ageInMonths < 6) {
    return "🍼 During the first 6 months, babies need lots of comfort and routine. Crying is their primary way to communicate needs - hunger, tiredness, or wanting connection. Trust your instincts and respond with warmth.";
  }
  
  if (ageInMonths < 12) {
    return "👶 At 6-12 months, babies are rapidly developing motor skills and social awareness. They're learning to trust their caregivers. Consistent, loving responses help build secure attachment.";
  }
  
  if (ageInMonths < 18) {
    return "🚶 Toddlers (12-18 months) are exploring independence while still needing security. They may have separation anxiety and test boundaries. Gentle consistency helps them feel safe while learning.";
  }
  
  if (ageInMonths < 24) {
    return "🗣️ At 18-24 months, language is exploding! Toddlers understand much more than they can express, leading to frustration. Acknowledge their feelings and model the words they're trying to use.";
  }
  
  if (ageInMonths < 36) {
    return "🏃 The 'terrible twos' (2-3 years) are actually 'terrific twos'! This is normal development as children assert independence. Stay calm during tantrums - they're learning to regulate big emotions.";
  }
  
  if (ageInMonths < 48) {
    return "🎨 Preschoolers (3-4 years) are developing imagination and social skills. They're learning to share, take turns, and understand others' feelings. Pretend play is how they process the world.";
  }
  
  if (ageInMonths < 60) {
    return "📚 At 4-5 years, children are preparing for school. They can follow multi-step instructions and are developing self-control. They benefit from structure while still needing plenty of play time.";
  }
  
  if (ageInMonths < 84) {
    return "🎒 School-age children (5-7 years) are learning to navigate friendships and academic challenges. They need encouragement and support to build confidence in their growing abilities.";
  }
  
  if (ageInMonths < 108) {
    return "⚽ Middle childhood (7-9 years) brings increased independence and peer influence. Children at this age benefit from clear expectations and opportunities to develop their interests and talents.";
  }
  
  if (ageInMonths < 132) {
    return "🌱 Pre-teens (9-11 years) are beginning to develop their identity. They may seek more independence while still needing parental guidance. Open communication becomes increasingly important.";
  }
  
  if (ageInMonths < 156) {
    return "🌟 Early adolescence (11-13 years) brings significant physical and emotional changes. Patience, understanding, and maintaining connection while respecting growing independence is key.";
  }
  
  if (ageInMonths < 216) {
    return "🚀 Teenagers (13-18 years) are developing their identity and preparing for adulthood. They need support to make good decisions while learning from natural consequences.";
  }
  
  return "💝 Young adults continue to benefit from parental support and guidance as they navigate life's challenges. The parent-child relationship evolves into a more adult friendship.";
}

export function calculateAgeInMonths(dateOfBirth: Date): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  
  // Adjust if the day hasn't occurred yet this month
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

export function formatAge(ageInMonths: number): string {
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} old`;
  }
  
  if (months === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  }
  
  return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'} old`;
}