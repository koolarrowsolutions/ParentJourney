import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export interface DailyCheckInData {
  energyLevel: string;
  patienceLevel: string;
  parentChildConnection: string;
  parentingConfidence: string;
  parentSelfCare: string;
  supportSystemContact: string;
  argumentsOrTension: string;
  emotionalRegulation: string;
  disciplineStyle: string;
  winsOfTheDay: string;
}

interface DailyCheckInProps {
  onComplete: (data: DailyCheckInData) => void;
  onCancel: () => void;
}

const checkInQuestions = [
  {
    key: 'energyLevel',
    title: 'Energy Level',
    question: 'How was your energy level today?',
    options: [
      { value: 'completely_drained', label: 'Completely Drained', emoji: '🔋' },
      { value: 'exhausted', label: 'Exhausted', emoji: '😴' },
      { value: 'very_tired', label: 'Very Tired', emoji: '😮‍💨' },
      { value: 'tired', label: 'Tired', emoji: '😔' },
      { value: 'okay', label: 'Okay', emoji: '😐' },
      { value: 'good', label: 'Good', emoji: '🙂' },
      { value: 'energetic', label: 'Energetic', emoji: '😊' },
      { value: 'vibrant', label: 'Vibrant', emoji: '⚡' }
    ]
  },
  {
    key: 'patienceLevel',
    title: 'Patience Level',
    question: 'How was your patience level today?',
    options: [
      { value: 'explosive', label: 'Explosive', emoji: '🤬' },
      { value: 'very_short_fuse', label: 'Very Short Fuse', emoji: '😤' },
      { value: 'short_fuse', label: 'Short Fuse', emoji: '😠' },
      { value: 'impatient', label: 'Impatient', emoji: '😮‍💨' },
      { value: 'neutral', label: 'Neutral', emoji: '😐' },
      { value: 'mostly_patient', label: 'Mostly Patient', emoji: '🙂' },
      { value: 'patient', label: 'Patient', emoji: '😌' },
      { value: 'zen', label: 'Zen', emoji: '🧘' }
    ]
  },
  {
    key: 'parentChildConnection',
    title: 'Parent-Child Connection',
    question: 'How was your connection with your child today?',
    options: [
      { value: 'completely_disconnected', label: 'Completely Disconnected', emoji: '💔' },
      { value: 'very_distant', label: 'Very Distant', emoji: '😔' },
      { value: 'distant', label: 'Distant', emoji: '😕' },
      { value: 'strained', label: 'Strained', emoji: '🤔' },
      { value: 'okay', label: 'Okay', emoji: '😐' },
      { value: 'good', label: 'Good', emoji: '🙂' },
      { value: 'close', label: 'Close', emoji: '😊' },
      { value: 'deeply_bonded', label: 'Deeply Bonded', emoji: '💕' }
    ]
  },
  {
    key: 'parentingConfidence',
    title: 'Parenting Confidence',
    question: 'How confident did you feel in your parenting today?',
    options: [
      { value: 'completely_lost', label: 'Completely Lost', emoji: '😵' },
      { value: 'very_doubting', label: 'Very Doubting', emoji: '😰' },
      { value: 'doubting', label: 'Doubting', emoji: '😟' },
      { value: 'unsure', label: 'Unsure', emoji: '😕' },
      { value: 'neutral', label: 'Neutral', emoji: '😐' },
      { value: 'somewhat_confident', label: 'Somewhat Confident', emoji: '🙂' },
      { value: 'confident', label: 'Confident', emoji: '😊' },
      { value: 'very_empowered', label: 'Very Empowered', emoji: '💪' }
    ]
  },
  {
    key: 'parentSelfCare',
    title: 'Parent Self-Care',
    question: 'How did you take care of yourself today?',
    options: [
      { value: 'completely_neglected', label: 'Completely Neglected', emoji: '💔' },
      { value: 'very_neglected', label: 'Very Neglected', emoji: '😞' },
      { value: 'neglected', label: 'Neglected', emoji: '😔' },
      { value: 'minimal', label: 'Minimal', emoji: '😕' },
      { value: 'basic', label: 'Basic', emoji: '😐' },
      { value: 'decent', label: 'Decent', emoji: '🙂' },
      { value: 'good', label: 'Good', emoji: '😊' },
      { value: 'deeply_nurtured', label: 'Deeply Nurtured', emoji: '🌸' }
    ]
  },
  {
    key: 'supportSystemContact',
    title: 'Support System Contact',
    question: 'How was your connection with your support system today?',
    options: [
      { value: 'completely_isolated', label: 'Completely Isolated', emoji: '🏝️' },
      { value: 'very_isolated', label: 'Very Isolated', emoji: '😔' },
      { value: 'isolated', label: 'Isolated', emoji: '😞' },
      { value: 'alone', label: 'Alone', emoji: '😕' },
      { value: 'some_contact', label: 'Some Contact', emoji: '😐' },
      { value: 'decent_contact', label: 'Decent Contact', emoji: '🙂' },
      { value: 'connected', label: 'Connected', emoji: '😊' },
      { value: 'very_supported', label: 'Very Supported', emoji: '🤝' }
    ]
  },
  {
    key: 'argumentsOrTension',
    title: 'Arguments or Tension in Home',
    question: 'How much tension or conflict was there at home today?',
    options: [
      { value: 'explosive_conflict', label: 'Explosive Conflict', emoji: '💥' },
      { value: 'very_high_conflict', label: 'Very High Conflict', emoji: '😤' },
      { value: 'high_conflict', label: 'High Conflict', emoji: '😠' },
      { value: 'moderate_tension', label: 'Moderate Tension', emoji: '😮‍💨' },
      { value: 'some_tension', label: 'Some Tension', emoji: '😐' },
      { value: 'minor_issues', label: 'Minor Issues', emoji: '🙂' },
      { value: 'mostly_calm', label: 'Mostly Calm', emoji: '😌' },
      { value: 'completely_peaceful', label: 'Completely Peaceful', emoji: '☮️' }
    ]
  },
  {
    key: 'emotionalRegulation',
    title: 'Emotional Regulation',
    question: 'How well did you handle your emotions today?',
    options: [
      { value: 'completely_overwhelmed', label: 'Completely Overwhelmed', emoji: '😵' },
      { value: 'very_overwhelmed', label: 'Very Overwhelmed', emoji: '😰' },
      { value: 'overwhelmed', label: 'Overwhelmed', emoji: '😟' },
      { value: 'struggled', label: 'Struggled', emoji: '😕' },
      { value: 'managed', label: 'Managed', emoji: '😐' },
      { value: 'handled_well', label: 'Handled Well', emoji: '🙂' },
      { value: 'balanced', label: 'Balanced', emoji: '😊' },
      { value: 'completely_centered', label: 'Completely Centered', emoji: '🎯' }
    ]
  },
  {
    key: 'disciplineStyle',
    title: 'Discipline Style Used Today',
    question: 'What discipline approach did you use most today?',
    options: [
      { value: 'very_harsh', label: 'Very Harsh', emoji: '😡' },
      { value: 'too_harsh', label: 'Too Harsh', emoji: '😤' },
      { value: 'harsh', label: 'Harsh', emoji: '😠' },
      { value: 'strict', label: 'Strict', emoji: '😐' },
      { value: 'firm_but_fair', label: 'Firm but Fair', emoji: '⚖️' },
      { value: 'gentle', label: 'Gentle', emoji: '🙂' },
      { value: 'kind', label: 'Kind', emoji: '😊' },
      { value: 'loving_guide', label: 'Loving Guide', emoji: '💕' }
    ]
  },
  {
    key: 'winsOfTheDay',
    title: 'Wins of the Day',
    question: 'What positive moments did you have today?',
    options: [
      { value: 'very_rough_day', label: 'Very Rough Day', emoji: '💔' },
      { value: 'rough_day', label: 'Rough Day', emoji: '😔' },
      { value: 'challenging_day', label: 'Challenging Day', emoji: '😞' },
      { value: 'few_bright_spots', label: 'Few Bright Spots', emoji: '😕' },
      { value: 'some_wins', label: 'Some Wins', emoji: '😐' },
      { value: 'good_moments', label: 'Good Moments', emoji: '🙂' },
      { value: 'great_moments', label: 'Great Moments', emoji: '😊' },
      { value: 'absolutely_amazing', label: 'Absolutely Amazing', emoji: '🌟' }
    ]
  }
];

export function DailyCheckIn({ onComplete, onCancel }: DailyCheckInProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Partial<DailyCheckInData>>({});

  const currentQuestion = checkInQuestions[currentStep];
  const totalSteps = checkInQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleOptionSelect = (value: string) => {
    const newResponses = {
      ...responses,
      [currentQuestion.key]: value
    };
    setResponses(newResponses);

    // Auto-advance to next question after a brief delay
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete the check-in
        onComplete(newResponses as DailyCheckInData);
      }
    }, 500);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const isCurrentAnswered = responses[currentQuestion.key as keyof DailyCheckInData];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-neutral-800">
              Daily Check-In
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              ✕
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Question {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-neutral-800">
              {currentQuestion.title}
            </h3>
            <p className="text-neutral-600">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options - Small buttons like original mood selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.value}
                variant={responses[currentQuestion.key as keyof DailyCheckInData] === option.value ? "default" : "outline"}
                size="sm"
                className={`h-auto p-2 sm:p-3 flex flex-col items-center space-y-1 text-center transition-all hover-scale button-press ${
                  responses[currentQuestion.key as keyof DailyCheckInData] === option.value 
                    ? 'bg-primary text-white shadow-lg scale-105' 
                    : 'hover:bg-primary/5'
                }`}
                onClick={() => handleOptionSelect(option.value)}
              >
                <span className="text-lg sm:text-xl">{option.emoji}</span>
                <span className="text-xs sm:text-sm font-medium leading-tight">{option.label}</span>
                {responses[currentQuestion.key as keyof DailyCheckInData] === option.value && (
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                )}
              </Button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1 || !isCurrentAnswered}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}