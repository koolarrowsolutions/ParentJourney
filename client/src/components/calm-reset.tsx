import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Leaf, Heart, Brain, Volume2, Play, Pause, RotateCcw } from "lucide-react";

interface CalmResetProps {
  trigger?: 'inline' | 'standalone';
  onComplete?: () => void;
}

export function CalmReset({ trigger = 'standalone', onComplete }: CalmResetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<string>('breathing');
  const [activeBreathingExercise, setActiveBreathingExercise] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState<NodeJS.Timeout | null>(null);

  const breathingExercises = {
    '4-7-8': {
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8 seconds',
      phases: [
        { name: 'inhale', duration: 4000, instruction: 'Breathe in slowly through your nose' },
        { name: 'hold', duration: 7000, instruction: 'Hold your breath gently' },
        { name: 'exhale', duration: 8000, instruction: 'Exhale completely through your mouth' },
        { name: 'rest', duration: 1000, instruction: 'Rest and prepare for the next cycle' }
      ]
    },
    'box': {
      name: 'Box Breathing',
      description: 'Equal timing for all phases - 4 seconds each',
      phases: [
        { name: 'inhale', duration: 4000, instruction: 'Breathe in slowly and deeply' },
        { name: 'hold', duration: 4000, instruction: 'Hold your breath comfortably' },
        { name: 'exhale', duration: 4000, instruction: 'Exhale slowly and completely' },
        { name: 'rest', duration: 4000, instruction: 'Rest before the next breath' }
      ]
    },
    'calm': {
      name: 'Calm Breathing',
      description: 'Simple 6-second cycles for quick relaxation',
      phases: [
        { name: 'inhale', duration: 3000, instruction: 'Breathe in gently' },
        { name: 'exhale', duration: 3000, instruction: 'Breathe out slowly' }
      ]
    }
  };

  const guidedExercises = [
    {
      id: 'self-compassion',
      title: 'Self-Compassion',
      duration: '2 min',
      description: 'Kind words for difficult parenting moments',
      content: [
        "Take a deep breath and place your hand on your heart.",
        "Remember: Parenting is one of the hardest jobs in the world.",
        "You're doing your best with the resources you have right now.",
        "It's okay to feel overwhelmed - that means you care deeply.",
        "Your love for your child is enough, even when everything feels chaotic.",
        "You are learning and growing alongside your child.",
        "Be as kind to yourself as you would be to a good friend."
      ]
    },
    {
      id: 'present-moment',
      title: 'Present Moment',
      duration: '3 min',
      description: 'Grounding technique for overwhelming situations',
      content: [
        "Notice 5 things you can see around you right now.",
        "Listen for 4 different sounds in your environment.",
        "Touch 3 different textures - your clothes, a surface, your skin.",
        "Identify 2 scents you can smell.",
        "Notice 1 taste in your mouth.",
        "Take three slow, deep breaths.",
        "You are here, in this moment, and that's enough."
      ]
    },
    {
      id: 'energy-reset',
      title: 'Quick Energy Reset',
      duration: '1 min',
      description: 'Fast technique when you need instant calm',
      content: [
        "Shake out your hands and arms for 10 seconds.",
        "Roll your shoulders backward 5 times.",
        "Take 3 deep breaths, making your exhale longer than your inhale.",
        "Close your eyes and imagine your stress melting away.",
        "Open your eyes and give yourself a gentle smile.",
        "You've got this."
      ]
    }
  ];

  const affirmations = [
    "I am a good parent, even when things feel hard.",
    "My child is lucky to have me as their parent.",
    "I'm allowed to take breaks and care for myself too.",
    "Every parent struggles sometimes - I'm not alone.",
    "I'm learning and growing every day.",
    "My love and effort make a real difference.",
    "It's okay to not have all the answers.",
    "I trust myself to figure things out as they come."
  ];

  const startBreathingExercise = (exerciseType: keyof typeof breathingExercises) => {
    setCurrentExercise(exerciseType);
    setActiveBreathingExercise(exerciseType);
    setIsActive(true);
    setProgress(0);
    setCycleCount(0);
    runBreathingCycle(exerciseType, 0);
  };

  const runBreathingCycle = (exerciseType: keyof typeof breathingExercises, phaseIndex: number) => {
    const exercise = breathingExercises[exerciseType];
    const phase = exercise.phases[phaseIndex];
    
    setBreathingPhase(phase.name as any);
    setProgress(0);

    let timeElapsed = 0;
    const interval = setInterval(() => {
      timeElapsed += 100;
      const progressPercent = (timeElapsed / phase.duration) * 100;
      setProgress(progressPercent);

      if (timeElapsed >= phase.duration) {
        clearInterval(interval);
        const nextPhaseIndex = (phaseIndex + 1) % exercise.phases.length;
        
        if (nextPhaseIndex === 0) {
          setCycleCount(prev => prev + 1);
        }

        if (cycleCount < 4) { // Do 4 complete cycles
          runBreathingCycle(exerciseType, nextPhaseIndex);
        } else {
          setIsActive(false);
          setActiveBreathingExercise(null);
          setProgress(100);
          if (onComplete) onComplete();
        }
      }
    }, 100);

    setExerciseTimer(interval);
  };

  const stopExercise = () => {
    setIsActive(false);
    setActiveBreathingExercise(null);
    if (exerciseTimer) {
      clearInterval(exerciseTimer);
      setExerciseTimer(null);
    }
    setProgress(0);
    setCycleCount(0);
  };

  const resetExercise = () => {
    stopExercise();
    setCurrentExercise('breathing');
    setActiveBreathingExercise(null);
  };

  useEffect(() => {
    return () => {
      if (exerciseTimer) {
        clearInterval(exerciseTimer);
      }
    };
  }, [exerciseTimer]);

  const TriggerButton = () => (
    <Button 
      variant={trigger === 'inline' ? 'outline' : 'default'}
      size={trigger === 'inline' ? 'sm' : 'default'}
      className={`
        ${trigger === 'inline' 
          ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
        }
        transition-all duration-300 hover-lift
      `}
      onClick={() => setIsOpen(true)}
    >
      <Leaf className="mr-2 h-4 w-4" />
      {trigger === 'inline' ? 'Calm Reset' : 'Take a Moment to Breathe'}
    </Button>
  );

  const currentBreathingExercise = breathingExercises[currentExercise as keyof typeof breathingExercises];
  const currentPhase = currentBreathingExercise?.phases.find(p => p.name === breathingPhase);

  return (
    <>
      {trigger === 'standalone' ? (
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover-lift">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-3">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-emerald-800">Need a Calm Moment?</CardTitle>
            <p className="text-emerald-700 text-sm">
              Quick breathing exercises and mindfulness techniques for overwhelming moments
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <TriggerButton />
          </CardContent>
        </Card>
      ) : (
        <TriggerButton />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-emerald-800">
              <Leaf className="mr-2 h-5 w-5" />
              Calm Reset
            </DialogTitle>
            <DialogDescription>
              Take a few minutes to reset and recharge. Choose what feels right for you right now.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="breathing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breathing" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Breathing
              </TabsTrigger>
              <TabsTrigger value="guided" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Guided
              </TabsTrigger>
              <TabsTrigger value="affirmations" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Affirmations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breathing" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(breathingExercises).map(([key, exercise]) => (
                  <div key={key} className="space-y-3">
                    <Card className="p-4 border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-emerald-800">{exercise.name}</h4>
                          <p className="text-sm text-emerald-600">{exercise.description}</p>
                        </div>
                        <Button
                          onClick={() => startBreathingExercise(key as keyof typeof breathingExercises)}
                          disabled={isActive}
                          variant="outline"
                          size="sm"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    </Card>

                    {/* Animation appears below the specific exercise that was started */}
                    {isActive && activeBreathingExercise === key && (
                      <Card className="p-6 border-2 border-emerald-300 bg-emerald-50 animate-pop-fade">
                        <div className="text-center space-y-4">
                          <div className="flex items-center justify-center space-x-4">
                            <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                              {exercise.name}
                            </Badge>
                            <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                              Cycle {cycleCount + 1}/4
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-emerald-800 capitalize">
                              {breathingPhase}
                            </h3>
                            <p className="text-emerald-700">
                              {exercise.phases.find(p => p.name === breathingPhase)?.instruction}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Progress value={progress} className="h-3" />
                            <div className="flex justify-center space-x-2">
                              <Button
                                onClick={stopExercise}
                                variant="outline"
                                size="sm"
                                className="border-emerald-300 text-emerald-700"
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Stop
                              </Button>
                              <Button
                                onClick={resetExercise}
                                variant="outline"
                                size="sm"
                                className="border-emerald-300 text-emerald-700"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reset
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guided" className="space-y-4">
              {guidedExercises.map((exercise) => (
                <Card key={exercise.id} className="p-4 border-emerald-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-emerald-800">{exercise.title}</h4>
                        <p className="text-sm text-emerald-600">{exercise.description}</p>
                      </div>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                        {exercise.duration}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {exercise.content.map((step, index) => (
                        <p key={index} className="text-sm text-emerald-700 pl-4 border-l-2 border-emerald-200">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="affirmations" className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-emerald-700">
                  Take a moment to read these affirmations. Choose one that resonates with you today.
                </p>
              </div>
              <div className="grid gap-3">
                {affirmations.map((affirmation, index) => (
                  <Card key={index} className="p-4 border-emerald-200 bg-emerald-50">
                    <p className="text-center text-emerald-800 font-medium">
                      "{affirmation}"
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setIsOpen(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              I'm Ready to Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}