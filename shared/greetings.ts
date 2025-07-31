export const greetings = [
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

export function getRandomGreeting(): string {
  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
}

export function getDailyGreeting(): string {
  // Use current date as seed for consistent daily greeting
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const greetingIndex = dayOfYear % greetings.length;
  return greetings[greetingIndex];
}