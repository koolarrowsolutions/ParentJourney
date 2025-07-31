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
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center mb-3 sm:mb-4">
          <Heart className="text-primary mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <h3 className="text-base sm:text-lg font-semibold text-neutral-800">
            How are you feeling today?
          </h3>
        </div>
        <p className="text-neutral-600 mb-3 sm:mb-4 text-xs sm:text-sm">
          Your emotions help our AI provide personalized insights and track your wellness journey.
        </p>
        
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => onMoodChange(mood.value)}
              className={`px-2 py-2 sm:px-3 rounded-full border text-xs sm:text-sm transition-all button-press hover-scale animate-wiggle hover:animate-bounce-subtle flex items-center justify-center ${
                selectedMood === mood.value
                  ? "border-primary bg-primary/10 text-primary animate-pulse-glow"
                  : "border-neutral-200 hover:border-primary hover:bg-primary/5"
              }`}
            >
              <span className="text-base sm:text-lg mr-1">{mood.emoji}</span>
              <span className="hidden sm:inline">{mood.label}</span>
              <span className="sm:hidden text-xs">{mood.label}</span>
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