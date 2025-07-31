import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

const MOODS = [
  { emoji: "😊", label: "Happy", value: "😊" },
  { emoji: "😰", label: "Stressed", value: "😰" },
  { emoji: "😴", label: "Tired", value: "😴" },
  { emoji: "🤔", label: "Thoughtful", value: "🤔" },
  { emoji: "😅", label: "Overwhelmed", value: "😅" },
  { emoji: "🥰", label: "Grateful", value: "🥰" },
  { emoji: "😔", label: "Sad", value: "😔" },
  { emoji: "😤", label: "Frustrated", value: "😤" },
  { emoji: "😌", label: "Calm", value: "😌" },
  { emoji: "😕", label: "Worried", value: "😕" },
];

interface MoodSelectorProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

export function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  return (
    <Card className="shadow-sm border border-neutral-200 hover-lift animate-slide-in-left stagger-1">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Heart className="text-primary mr-2 h-5 w-5" />
          <h3 className="text-lg font-semibold text-neutral-800">
            How are you feeling today?
          </h3>
        </div>
        <p className="text-neutral-600 mb-4 text-sm">
          Your emotions help our AI provide personalized insights and track your wellness journey.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => onMoodChange(mood.value)}
              className={`px-3 py-2 rounded-full border text-sm transition-all button-press hover-scale animate-wiggle hover:animate-bounce-subtle ${
                selectedMood === mood.value
                  ? "border-primary bg-primary/10 text-primary animate-pulse-glow"
                  : "border-neutral-200 hover:border-primary hover:bg-primary/5"
              }`}
            >
              {mood.emoji} {mood.label}
            </button>
          ))}
        </div>
        
        {selectedMood && (
          <div className="mt-3 text-center">
            <p className="text-xs text-neutral-500">
              Selected: {MOODS.find(m => m.value === selectedMood)?.emoji} {MOODS.find(m => m.value === selectedMood)?.label}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}