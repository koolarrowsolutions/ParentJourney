export const prompts = [
  "What's something small that made you smile today as a parent?",
  "Describe a recent parenting win — big or small.",
  "What was a tough moment today, and how did you handle it?",
  "What did your child teach you today?",
  "If you could press pause today, what would you want to remember?",
  "What's one thing you're grateful for about your parenting journey?",
  "How did you show love to your child today?",
  "What's a challenge you overcame this week?",
  "Describe a moment when you felt really proud of your child.",
  "What's something you want to remember about this stage of your child's life?",
  "How are you taking care of yourself as a parent?",
  "What made your child laugh today?",
  "What's a new skill or milestone your child is working on?",
  "How did you handle frustration or stress today?",
  "What's your favorite thing about bedtime routine lately?",
  "Describe a sweet conversation you had with your child.",
  "What's something you're learning about your child's personality?",
  "How did you and your child connect today?",
  "What's a tradition or routine that's working well for your family?",
  "What would you tell another parent going through a similar experience?"
];

export function getRandomPrompt(): string {
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}

export function getDailyPrompt(): string {
  // Use current date as seed for consistent daily prompt
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const promptIndex = dayOfYear % prompts.length;
  return prompts[promptIndex];
}