export const journalPrompts = [
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

export const supportiveGreetings = [
  "You're doing better than you think 💛",
  "Every day counts — even the hard ones 🌿",
  "Your reflections matter. You matter.",
  "Thanks for showing up today. Let's reflect together.",
  "Parenting isn't perfect — but your effort is powerful.",
  "You're doing an amazing job. What's on your heart today?",
  "Every parent needs a safe space to reflect. How are you feeling?",
  "Your thoughts and experiences matter. What would you like to share?",
  "Parenting is a journey of growth. What's happening in yours today?",
  "You're not alone in this adventure. What's been on your mind?",
  "Take a moment for yourself. What's worth remembering from today?",
  "Your parenting story is unique and valuable. What chapter are you living?",
  "This is your space to be honest and real. What's in your heart?",
  "Every day brings new lessons in parenting. What did today teach you?",
  "Your feelings and experiences are valid. What would you like to process?",
  "Parenting moments, big and small, all matter. What's yours today?",
  "This is a judgment-free space for your thoughts. What's happening?",
  "You deserve recognition for all you do. What's been challenging or wonderful?",
  "Your parenting journey deserves to be honored. What's your story today?"
];

export function getRandomPrompt(): string {
  const randomIndex = Math.floor(Math.random() * journalPrompts.length);
  return journalPrompts[randomIndex];
}

export function getRandomGreeting(): string {
  const randomIndex = Math.floor(Math.random() * supportiveGreetings.length);
  return supportiveGreetings[randomIndex];
}

export function getDailyPrompt(): string {
  // Use current date as seed for consistent daily prompt
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const promptIndex = dayOfYear % journalPrompts.length;
  return journalPrompts[promptIndex];
}

export function getDailyGreeting(): string {
  // Use current date as seed for consistent daily greeting
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const greetingIndex = dayOfYear % supportiveGreetings.length;
  return supportiveGreetings[greetingIndex];
}