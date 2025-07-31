import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, RotateCcw, ChevronLeft, Clock } from "lucide-react";

interface CalmResetProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const supportiveMessages = [
  "You're not alone. Take this one moment for yourself.",
  "Pause. Breathe. You're doing enough.",
  "Parenting is messy — and you're still showing up.",
  "This feeling will pass. You're stronger than you know.",
  "Take a deep breath. You've got this, one moment at a time.",
  "It's okay to feel overwhelmed. You're human, and you're trying.",
  "Every parent has hard moments. This doesn't define you.",
  "Breathe in peace, breathe out the stress. You're doing great.",
  "Your love for your child shines through, even in difficult times.",
  "Take this pause. You deserve kindness, especially from yourself."
];

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export function CalmReset({ isOpen, onClose, onComplete }: CalmResetProps) {
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [supportiveMessage] = useState(() => 
    supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isActive && countdown === 0) {
      // Move to next phase
      switch (currentPhase) {
        case 'inhale':
          setCurrentPhase('hold');
          setCountdown(4);
          break;
        case 'hold':
          setCurrentPhase('exhale');
          setCountdown(4);
          break;
        case 'exhale':
          setCurrentPhase('pause');
          setCountdown(2);
          break;
        case 'pause':
          setCurrentPhase('inhale');
          setCountdown(4);
          setCycles(prev => prev + 1);
          break;
      }
    }

    return () => clearInterval(interval);
  }, [isActive, countdown, currentPhase]);

  const handleStart = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setCountdown(4);
    setCycles(0);
  };

  const handleStop = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setCountdown(4);
  };

  const handleComplete = () => {
    handleStop();
    
    // Track calm reset usage for analytics
    const calmResetData = {
      timestamp: new Date().toISOString(),
      cycles: cycles,
      duration: (cycles * 14) // Approximate seconds (4+4+4+2 per cycle)
    };
    
    // Store in localStorage for potential future insights
    const existingData = localStorage.getItem('calmResetUsage') || '[]';
    const usageHistory = JSON.parse(existingData);
    usageHistory.push(calmResetData);
    localStorage.setItem('calmResetUsage', JSON.stringify(usageHistory));
    
    onComplete?.();
    onClose();
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'pause':
        return 'Rest';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'text-blue-600';
      case 'hold':
        return 'text-purple-600';
      case 'exhale':
        return 'text-green-600';
      case 'pause':
        return 'text-neutral-500';
    }
  };

  const getCircleScale = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'scale-150';
      case 'hold':
        return 'scale-150';
      case 'exhale':
        return 'scale-100';
      case 'pause':
        return 'scale-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-neutral-800">
            <Heart className="h-5 w-5 text-rose-500" />
            Calm Reset
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Supportive Message */}
          <Card className="bg-white/70 border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-neutral-700 leading-relaxed text-sm">
                {supportiveMessage}
              </p>
            </CardContent>
          </Card>

          {/* Breathing Animation */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative flex items-center justify-center">
              {/* Breathing Circle */}
              <div className={`
                w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 
                flex items-center justify-center transition-all duration-1000 ease-in-out
                ${isActive ? getCircleScale() : 'scale-100'}
                ${isActive && currentPhase === 'inhale' ? 'shadow-lg shadow-blue-200' : ''}
                ${isActive && currentPhase === 'exhale' ? 'shadow-lg shadow-green-200' : ''}
              `}>
                {/* Inner Circle */}
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-inner">
                  <div className={`text-center transition-colors duration-300 ${getPhaseColor()}`}>
                    <div className="text-3xl font-bold tabular-nums">{countdown}</div>
                    {isActive && (
                      <div className="text-xs font-medium uppercase tracking-wider mt-1">
                        {getPhaseText()}
                      </div>
                    )}
                    {!isActive && (
                      <div className="text-xs text-neutral-500 uppercase tracking-wider">
                        Ready
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center space-y-4">
              {!isActive ? (
                <Button 
                  onClick={handleStart}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Breathing
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleStop}
                    variant="outline"
                    className="px-6"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  {cycles >= 3 && (
                    <Button 
                      onClick={handleComplete}
                      className="bg-green-500 hover:bg-green-600 text-white px-6"
                    >
                      I Feel Better
                    </Button>
                  )}
                </div>
              )}

              {/* Progress Indicator */}
              {isActive && (
                <div className="text-center space-y-1">
                  <div className="text-xs text-neutral-600">
                    Breathing cycles completed: {cycles}
                  </div>
                  {cycles >= 3 && (
                    <div className="text-xs text-green-600 font-medium">
                      Great! You can continue or take a moment to journal.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-neutral-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Journal
            </Button>
            {cycles >= 1 && (
              <Button
                onClick={handleComplete}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Continue Writing
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CalmResetTriggerProps {
  selectedEmotions: string[];
  onTrigger: () => void;
}

export function CalmResetTrigger({ selectedEmotions, onTrigger }: CalmResetTriggerProps) {
  const heavyEmotions = ['frustrated', 'overwhelmed', 'guilty', 'angry', 'anxious'];
  const hasHeavyEmotion = selectedEmotions.some(emotion => 
    heavyEmotions.includes(emotion.toLowerCase())
  );

  if (!hasHeavyEmotion) return null;

  return (
    <Card className="bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-neutral-800 mb-1">
                We noticed you selected a heavy emotion
              </p>
              <p className="text-xs text-neutral-600">
                Want a quick reset to help you feel more centered?
              </p>
            </div>
          </div>
          <Button
            onClick={onTrigger}
            size="sm"
            className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shrink-0"
          >
            Reset Me
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}