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
      { value: 'low', label: 'Low', emoji: '🔋' },
      { value: 'tired', label: 'Tired', emoji: '😴' },
      { value: 'average', label: 'Average', emoji: '⚡' },
      { value: 'energized', label: 'Energized', emoji: '🌟' },
      { value: 'overstimulated', label: 'Over-stimulated', emoji: '🤯' }
    ]
  },
  {
    key: 'patienceLevel',
    title: 'Patience Level',
    question: 'How was your patience level today?',
    options: [
      { value: 'very_patient', label: 'Very Patient', emoji: '🧘‍♀️' },
      { value: 'patient', label: 'Patient', emoji: '😌' },
      { value: 'irritable', label: 'Irritable', emoji: '😤' },
      { value: 'snappy', label: 'Snappy', emoji: '😠' },
      { value: 'explosive', label: 'Explosive', emoji: '🤬' }
    ]
  },
  {
    key: 'parentChildConnection',
    title: 'Parent-Child Connection',
    question: 'How was your connection with your child today?',
    options: [
      { value: 'felt_close', label: 'Felt Close', emoji: '🤗' },
      { value: 'felt_distant', label: 'Felt Distant', emoji: '😔' },
      { value: 'lots_of_conflict', label: 'Lots of Conflict', emoji: '⚡' },
      { value: 'warm_and_connected', label: 'Warm & Connected', emoji: '💝' },
      { value: 'avoided_each_other', label: 'Avoided Each Other', emoji: '🚪' }
    ]
  },
  {
    key: 'parentingConfidence',
    title: 'Parenting Confidence',
    question: 'How confident did you feel in your parenting today?',
    options: [
      { value: 'high', label: 'High', emoji: '💪' },
      { value: 'ok', label: 'OK', emoji: '👍' },
      { value: 'low', label: 'Low', emoji: '😕' },
      { value: 'unsure', label: 'Unsure', emoji: '🤷‍♀️' },
      { value: 'overwhelmed', label: 'Overwhelmed', emoji: '😰' }
    ]
  },
  {
    key: 'parentSelfCare',
    title: 'Parent Self-Care',
    question: 'How did you take care of yourself today?',
    options: [
      { value: 'took_time_for_self', label: 'Took Time for Self', emoji: '🛁' },
      { value: 'ate_well', label: 'Ate Well', emoji: '🥗' },
      { value: 'moved_body', label: 'Moved Body', emoji: '🏃‍♀️' },
      { value: 'did_nothing', label: 'Did Nothing', emoji: '😶' },
      { value: 'burned_out', label: 'Burned Out', emoji: '🔥' }
    ]
  },
  {
    key: 'supportSystemContact',
    title: 'Support System Contact',
    question: 'How was your connection with your support system today?',
    options: [
      { value: 'connected_with_someone', label: 'Connected with Someone', emoji: '📞' },
      { value: 'felt_supported', label: 'Felt Supported', emoji: '🤝' },
      { value: 'felt_isolated', label: 'Felt Isolated', emoji: '🏝️' },
      { value: 'asked_for_help', label: 'Asked for Help', emoji: '🆘' },
      { value: 'gave_support', label: 'Gave Support', emoji: '💕' }
    ]
  },
  {
    key: 'argumentsOrTension',
    title: 'Arguments or Tension in Home',
    question: 'How much tension or conflict was there at home today?',
    options: [
      { value: 'none', label: 'None', emoji: '☮️' },
      { value: 'mild', label: 'Mild', emoji: '😐' },
      { value: 'moderate', label: 'Moderate', emoji: '😟' },
      { value: 'severe', label: 'Severe', emoji: '⚠️' }
    ]
  },
  {
    key: 'emotionalRegulation',
    title: 'Emotional Regulation',
    question: 'How well did you handle your emotions today?',
    options: [
      { value: 'handled_emotions_well', label: 'Handled Emotions Well', emoji: '🧘‍♀️' },
      { value: 'struggled_to_handle', label: 'Struggled to Handle Emotions', emoji: '😵‍💫' },
      { value: 'yelled', label: 'Yelled', emoji: '😡' },
      { value: 'avoided', label: 'Avoided', emoji: '🙈' }
    ]
  },
  {
    key: 'disciplineStyle',
    title: 'Discipline Style Used Today',
    question: 'What discipline approach did you use most today?',
    options: [
      { value: 'gentle', label: 'Gentle', emoji: '🌸' },
      { value: 'firm', label: 'Firm', emoji: '✋' },
      { value: 'harsh', label: 'Harsh', emoji: '😤' },
      { value: 'ignored', label: 'Ignored', emoji: '🙄' },
      { value: 'reward_based', label: 'Reward-Based', emoji: '🏆' }
    ]
  },
  {
    key: 'winsOfTheDay',
    title: 'Wins of the Day',
    question: 'What was your biggest win today?',
    options: [
      { value: 'big_breakthrough', label: 'Big Breakthrough', emoji: '🚀' },
      { value: 'small_moment_of_joy', label: 'Small Moment of Joy', emoji: '✨' },
      { value: 'made_child_laugh', label: 'Made Child Laugh', emoji: '😂' },
      { value: 'learned_something', label: 'Learned Something', emoji: '💡' },
      { value: 'survived_the_day', label: 'Survived the Day', emoji: '💪' }
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

          {/* Options */}
          <div className="grid gap-3 max-h-80 overflow-y-auto">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.value}
                variant={responses[currentQuestion.key as keyof DailyCheckInData] === option.value ? "default" : "outline"}
                size="lg"
                className="h-auto p-4 justify-start text-left"
                onClick={() => handleOptionSelect(option.value)}
              >
                <span className="text-2xl mr-3">{option.emoji}</span>
                <span className="text-base">{option.label}</span>
                {responses[currentQuestion.key as keyof DailyCheckInData] === option.value && (
                  <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
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