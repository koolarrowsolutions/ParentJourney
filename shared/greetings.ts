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
  "Your parenting journey deserves to be honored. What's your story today?",
  "Every small step forward is progress worth celebrating.",
  "Trust your instincts — you know your child better than anyone.",
  "Growth happens in the quiet moments between the chaos.",
  "Your love is shaping a future you may never fully see.",
  "Patience with yourself creates patience with your children.",
  "Some days you're teaching, some days you're learning. Both matter.",
  "Your consistency is building security in your child's world.",
  "The way you show up today becomes their inner voice tomorrow.",
  "Parenting is the longest conversation you'll ever have with yourself.",
  "Your willingness to reflect shows your commitment to growth.",
  "Every challenge overcome becomes wisdom for the next one.",
  "Your child doesn't need you to be perfect, just present.",
  "The moments you think don't matter often matter the most.",
  "Your emotional awareness is your child's emotional foundation.",
  "Progress isn't always visible, but it's always happening.",
  "The patterns you break now won't be passed to the next generation.",
  "Your questions about parenting show how much you care.",
  "Each day offers a fresh chance to connect and understand.",
  "Your efforts to understand your child build lifelong trust.",
  "The time you invest in reflection pays dividends in connection.",
  "Your growth as a parent mirrors your child's growth as a person.",
  "Every moment of mindfulness creates space for better choices.",
  "Your gentle corrections teach more than your perfect examples.",
  "The safety you create at home becomes their confidence in the world.",
  "Your authenticity gives your child permission to be themselves.",
  "The problems you solve together become their problem-solving skills.",
  "Your emotional regulation teaches them how to handle their big feelings.",
  "The boundaries you set with love become their internal compass.",
  "Your celebration of their uniqueness builds their self-worth.",
  "The attention you give today becomes the foundation they stand on tomorrow.",
  "Your willingness to admit mistakes teaches them it's safe to be human."
];

// Track greeting rotation per user session
let greetingCounter = 0;

export function getRandomGreeting(): string {
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function getDailyGreeting(): string {
  // Use current date as seed for consistent daily greeting
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const greetingIndex = dayOfYear % greetings.length;
  return greetings[greetingIndex];
}

export function getLoginGreeting(): string {
  // Rotate through greetings on each login
  const greeting = greetings[greetingCounter % greetings.length];
  greetingCounter++;
  return greeting;
}