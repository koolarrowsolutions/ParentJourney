import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Waves, Heart, Brain, Volume2, Play, Pause, RotateCcw, Square } from "lucide-react";

interface CalmResetProps {
  trigger?: 'inline' | 'standalone';
  onComplete?: () => void;
}

export function CalmReset({ trigger = 'standalone', onComplete }: CalmResetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<'breathing' | 'mindfulness' | 'affirmations' | 'guided-videos'>('breathing');
  const [activeBreathingExercise, setActiveBreathingExercise] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<SpeechSynthesisUtterance | HTMLAudioElement | null>(null);
  const [selectedBackgroundSound, setSelectedBackgroundSound] = useState<string>('ocean');
  const [backgroundAudio, setBackgroundAudio] = useState<HTMLAudioElement | any | null>(null);

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

  const backgroundSounds = {
    ocean: { 
      name: 'Ocean Waves', 
      description: 'Gentle ocean wave sounds',
      url: 'https://www.soundjay.com/misc/sounds-799.mp3'
    },
    creek: { 
      name: 'Running Creek', 
      description: 'Peaceful flowing water',
      url: 'https://www.soundjay.com/misc/sounds-1022.mp3'
    },
    birds: { 
      name: 'Chirping Birds', 
      description: 'Calming bird songs',
      url: 'https://www.soundjay.com/misc/sounds-1143.mp3'
    },
    rain: { 
      name: 'Gentle Rain', 
      description: 'Soft rainfall sounds',
      url: 'https://www.soundjay.com/misc/sounds-1164.mp3'
    },
    none: { name: 'No Background', description: 'Voice only', url: '' }
  };

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

  // Since external video validation is unreliable, we provide guided affirmation content
  // with our AI voice system for consistent availability
  const guidedAffirmationContent = [
    {
      id: 'morning-confidence',
      title: 'Morning Confidence Affirmations',
      duration: '2:00',
      description: 'Powerful "I am" statements to start your day strong',
      affirmations: [
        "I am confident and capable of handling whatever comes my way today",
        "I am worthy of love, success, and happiness", 
        "I am growing stronger and wiser with each experience",
        "I am grateful for this new day and all its possibilities",
        "I am choosing to focus on what I can control",
        "I am enough, exactly as I am right now"
      ]
    },
    {
      id: 'self-love',
      title: 'Self-Love & Acceptance',
      duration: '1:45',
      description: 'Gentle affirmations for self-compassion',
      affirmations: [
        "I am treating myself with kindness and compassion",
        "I am learning to forgive myself for past mistakes",
        "I am celebrating my unique strengths and qualities", 
        "I am worthy of respect and love from myself and others",
        "I am honoring my needs and setting healthy boundaries"
      ]
    },
    {
      id: 'stress-relief',
      title: 'Calm & Peace Affirmations',
      duration: '1:30',
      description: 'Soothing statements for inner tranquility',
      affirmations: [
        "I am breathing deeply and releasing all tension",
        "I am safe and secure in this present moment",
        "I am letting go of what I cannot control",
        "I am surrounded by peace and calm energy",
        "I am choosing thoughts that bring me peace"
      ]
    },
    {
      id: 'positive-energy',
      title: 'Energy & Motivation Boost',
      duration: '2:15',
      description: 'Uplifting affirmations for positive momentum',
      affirmations: [
        "I am filled with positive energy and enthusiasm",
        "I am attracting good things into my life",
        "I am capable of achieving my goals and dreams",
        "I am radiating joy and positivity to those around me",
        "I am grateful for all the abundance in my life",
        "I am creating a life that brings me fulfillment and joy"
      ]
    },
    {
      id: 'evening-gratitude',
      title: 'Evening Gratitude & Release',
      duration: '1:50',
      description: 'Peaceful affirmations to end your day',
      affirmations: [
        "I am grateful for all the good moments in my day",
        "I am proud of myself for showing up and trying my best",
        "I am releasing any stress or worry from today",
        "I am at peace with how today unfolded",
        "I am looking forward to rest and renewal tonight",
        "I am blessed and loved beyond measure"
      ]
    }
  ];

  const startGuidedAudio = async (content: string[]) => {
    console.log('Audio button clicked, current playing state:', isPlaying);
    
    if (isPlaying) {
      stopGuidedAudio();
      return;
    }

    setIsPlaying(true);
    console.log('Starting audio with content:', content);
    
    // Start background sound
    if (selectedBackgroundSound !== 'none') {
      const soundConfig = backgroundSounds[selectedBackgroundSound as keyof typeof backgroundSounds];
      console.log(`Starting background: ${soundConfig.description}`);
      
      try {
        // For demo, we'll create a simple ambient sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure based on sound type
        if (selectedBackgroundSound === 'ocean') {
          oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
          oscillator.type = 'sine';
          filter.frequency.setValueAtTime(200, audioContext.currentTime);
        } else if (selectedBackgroundSound === 'rain') {
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
          oscillator.type = 'sawtooth';
          filter.frequency.setValueAtTime(400, audioContext.currentTime);
        } else if (selectedBackgroundSound === 'birds') {
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.type = 'triangle';
          filter.frequency.setValueAtTime(1000, audioContext.currentTime);
        } else {
          oscillator.frequency.setValueAtTime(120, audioContext.currentTime);
          oscillator.type = 'sine';
          filter.frequency.setValueAtTime(300, audioContext.currentTime);
        }
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        
        // Add some variation to make it sound more natural
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.setValueAtTime(0.5, audioContext.currentTime);
        lfo.type = 'sine';
        lfoGain.gain.setValueAtTime(20, audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        oscillator.start();
        lfo.start();
        
        console.log('Background sound started successfully');
        setBackgroundAudio({ oscillator, lfo, audioContext } as any);
      } catch (error) {
        console.log('Background audio not available:', error);
      }
    }

    // Try OpenAI TTS first, fallback to browser TTS
    try {
      await playWithOpenAI(content);
    } catch (error) {
      console.log('OpenAI TTS not available, using browser TTS');
      playWithBrowserTTS(content);
    }
  };

  const playWithOpenAI = async (content: string[]) => {
    const fullText = content.join('. ');
    console.log('Attempting OpenAI TTS for:', fullText.substring(0, 100) + '...');
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fullText,
          voice: 'nova' // Natural female voice
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI TTS API failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        console.log('OpenAI audio finished');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        stopGuidedAudio();
      };
      
      audio.onerror = () => {
        console.error('Audio playback failed');
        setIsPlaying(false);
        stopGuidedAudio();
      };
      
      setCurrentAudio(audio as any);
      console.log('Starting OpenAI audio playback');
      await audio.play();
      
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw error;
    }
  };

  const playWithBrowserTTS = (content: string[]) => {
    let currentIndex = 0;
    
    const speakNext = () => {
      if (currentIndex >= content.length || !isPlaying) {
        setIsPlaying(false);
        return;
      }

      const text = content[currentIndex];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.pitch = 0.8;
      utterance.volume = 0.9;
      
      const voices = speechSynthesis.getVoices();
      const bestVoice = voices.find(voice => 
        voice.lang.includes('en') && (
          voice.name.includes('Google UK English Female') ||
          voice.name.includes('Microsoft Zira') ||
          voice.name.includes('Samantha')
        )
      );
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onend = () => {
        currentIndex++;
        setTimeout(() => {
          if (isPlaying) speakNext();
        }, 1500);
      };

      utterance.onerror = () => {
        currentIndex++;
        setTimeout(() => {
          if (isPlaying) speakNext();
        }, 1000);
      };

      setCurrentAudio(utterance);
      speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const stopGuidedAudio = () => {
    console.log('Stopping audio guidance');
    setIsPlaying(false);
    speechSynthesis.cancel();
    
    // Stop current audio (OpenAI TTS or speech synthesis)
    if (currentAudio) {
      try {
        if (currentAudio instanceof HTMLAudioElement) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        } else if (currentAudio instanceof SpeechSynthesisUtterance) {
          // SpeechSynthesis is handled by speechSynthesis.cancel() above
        }
      } catch (error) {
        console.log('Audio cleanup error:', error);
      }
      setCurrentAudio(null);
    }
    
    // Stop background audio
    if (backgroundAudio) {
      try {
        if (backgroundAudio instanceof HTMLAudioElement) {
          backgroundAudio.pause();
          backgroundAudio.currentTime = 0;
        } else if (backgroundAudio && typeof backgroundAudio === 'object') {
          // Handle custom audio context objects
          const audioObj = backgroundAudio as any;
          if (audioObj.oscillator && typeof audioObj.oscillator.stop === 'function') {
            audioObj.oscillator.stop();
          }
          if (audioObj.lfo && typeof audioObj.lfo.stop === 'function') {
            audioObj.lfo.stop();
          }
          if (audioObj.audioContext && typeof audioObj.audioContext.close === 'function') {
            audioObj.audioContext.close();
          }
        }
        console.log('Background audio stopped successfully');
      } catch (error) {
        console.log('Background audio cleanup error:', error);
      }
      setBackgroundAudio(null);
    }
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
          ? 'border-sky-200 text-sky-700 hover:bg-sky-50' 
          : 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white'
        }
        transition-all duration-300 hover-lift
      `}
      onClick={() => setIsOpen(true)}
    >
      <Waves className="mr-2 h-4 w-4" />
      {trigger === 'inline' ? 'Calm Reset' : 'Take a Moment to Breathe'}
    </Button>
  );

  const currentBreathingExercise = breathingExercises[currentExercise as keyof typeof breathingExercises];
  const currentPhase = currentBreathingExercise?.phases.find(p => p.name === breathingPhase);

  return (
    <>
      {trigger === 'standalone' ? (
        <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 hover-lift">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-full flex items-center justify-center mb-3">
              <Waves className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-sky-800">Need a Calm Moment?</CardTitle>
            <p className="text-sky-700 text-sm">
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
            <DialogTitle className="flex items-center text-sky-800">
              <Waves className="mr-2 h-5 w-5" />
              Calm Reset
            </DialogTitle>
            <DialogDescription>
              Take a few minutes to reset and recharge. Choose what feels right for you right now.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="breathing" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
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
              <TabsTrigger value="guided-videos" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breathing" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(breathingExercises).map(([key, exercise]) => (
                  <div key={key} className="space-y-3">
                    <Card className="p-4 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sky-800">{exercise.name}</h4>
                          <p className="text-sm text-sky-600">{exercise.description}</p>
                        </div>
                        <Button
                          onClick={() => startBreathingExercise(key as keyof typeof breathingExercises)}
                          disabled={isActive}
                          variant="outline"
                          size="sm"
                          className="border-sky-300 text-sky-700 hover:bg-sky-100 shadow-sm transition-all duration-200"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    </Card>

                    {/* Animation appears below the specific exercise that was started */}
                    {isActive && activeBreathingExercise === key && (
                      <Card className="p-8 border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 shadow-lg animate-gentle-fade">
                        <div className="text-center space-y-6">
                          <div className="flex items-center justify-center space-x-4">
                            <Badge variant="outline" className="border-sky-300 text-sky-700 bg-white/50">
                              {exercise.name}
                            </Badge>
                            <Badge variant="outline" className="border-sky-300 text-sky-700 bg-white/50">
                              Cycle {cycleCount + 1}/4
                            </Badge>
                          </div>
                          
                          {/* Enhanced breathing visualization */}
                          <div className="flex flex-col items-center space-y-6">
                            {/* Main breathing circle with ripple effect */}
                            <div className="relative">
                              {/* Outer ripple rings */}
                              <div className={`
                                absolute inset-0 w-32 h-32 rounded-full border-2 border-sky-300/30
                                transition-all duration-1000 ease-in-out
                                ${breathingPhase === 'inhale' ? 'scale-150 opacity-20' : 
                                  breathingPhase === 'hold' ? 'scale-150 opacity-30' : 
                                  'scale-100 opacity-10'}
                              `}></div>
                              <div className={`
                                absolute inset-0 w-32 h-32 rounded-full border-2 border-sky-400/20
                                transition-all duration-1000 ease-in-out delay-150
                                ${breathingPhase === 'inhale' ? 'scale-125 opacity-30' : 
                                  breathingPhase === 'hold' ? 'scale-125 opacity-40' : 
                                  'scale-100 opacity-15'}
                              `}></div>
                              
                              {/* Main breathing circle - outer container */}
                              <div className="w-32 h-32 rounded-full border-4 border-sky-300 bg-gradient-to-br from-sky-50 via-blue-25 to-sky-50 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                {/* Inner circle with phase-specific behavior */}
                                <div 
                                  className={`absolute inset-0 rounded-full bg-gradient-to-br from-sky-200/60 to-blue-300/60 flex items-center justify-center transition-all duration-300 ease-out
                                    ${breathingPhase === 'hold' ? 'animate-calm-hold' : ''}
                                  `}
                                  style={{ 
                                    transform: `scale(${
                                      breathingPhase === 'inhale' ? 0.1 + (progress / 100) * 0.9 :
                                      breathingPhase === 'hold' ? 1.0 :
                                      breathingPhase === 'exhale' ? 1.0 - (progress / 100) * 0.9 :
                                      0.1 + (progress / 100) * 0.9
                                    })`,
                                    opacity: progress > 5 ? 0.8 : 0.2
                                  }}
                                >
                                  <Waves className="h-6 w-6 text-sky-700" />
                                </div>
                                
                                {/* Always visible center icon for reference */}
                                <div className="relative z-10">
                                  <Waves className="h-4 w-4 text-sky-400/60" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Phase indicator and instructions */}
                            <div className="space-y-3 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <div className={`w-2 h-2 rounded-full transition-all duration-500
                                  ${breathingPhase === 'inhale' ? 'bg-sky-500 scale-150' : 'bg-sky-300'}`}></div>
                                <h3 className="text-2xl font-light text-sky-800 capitalize tracking-wider min-w-[100px]">
                                  {breathingPhase}
                                </h3>
                                <div className={`w-2 h-2 rounded-full transition-all duration-500
                                  ${breathingPhase === 'exhale' ? 'bg-sky-500 scale-150' : 'bg-sky-300'}`}></div>
                              </div>
                              <p className="text-sky-700 text-base max-w-sm leading-relaxed font-light">
                                {exercise.phases.find(p => p.name === breathingPhase)?.instruction}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Cycle dots indicator */}
                            <div className="flex justify-center space-x-2">
                              {Array.from({length: 4}).map((_, index) => (
                                <div 
                                  key={index}
                                  className={`w-3 h-3 rounded-full transition-all duration-500
                                    ${index <= cycleCount 
                                      ? 'bg-sky-500 scale-110 shadow-md' 
                                      : 'bg-sky-200'}`}
                                ></div>
                              ))}
                            </div>
                            <div className="flex justify-center space-x-3">
                              <Button
                                onClick={stopExercise}
                                variant="outline"
                                size="sm"
                                className="border-sky-300 text-sky-700 hover:bg-sky-50 shadow-sm"
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                              <Button
                                onClick={resetExercise}
                                variant="outline"
                                size="sm"
                                className="border-sky-300 text-sky-700 hover:bg-sky-50 shadow-sm"
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
              {/* Audio Controls */}
              <Card className="p-4 border-sky-200 bg-sky-25">
                <div className="space-y-3">
                  <h4 className="font-medium text-sky-800 flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Audio Guidance
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-sky-700">Background Sound:</label>
                      <select 
                        value={selectedBackgroundSound}
                        onChange={(e) => setSelectedBackgroundSound(e.target.value)}
                        className="px-3 py-1 border border-sky-300 rounded-md text-sm bg-white"
                      >
                        {Object.entries(backgroundSounds).map(([key, sound]) => (
                          <option key={key} value={key}>{sound.name}</option>
                        ))}
                      </select>
                    </div>
                    {isPlaying && (
                      <div className="text-sm text-sky-600 flex items-center">
                        <div className="animate-pulse w-2 h-2 bg-sky-500 rounded-full mr-2"></div>
                        Playing with natural AI voice...
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-sky-600 bg-sky-50 p-2 rounded">
                    💡 Tip: Uses natural AI voices (Nova) when available, with calming background sounds for a spa-like experience.
                  </div>
                </div>
              </Card>

              {guidedExercises.map((exercise) => (
                <Card key={exercise.id} className="p-4 border-sky-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sky-800">{exercise.title}</h4>
                        <p className="text-sm text-sky-600">{exercise.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-sky-300 text-sky-700">
                          {exercise.duration}
                        </Badge>
                        <Button
                          onClick={() => startGuidedAudio(exercise.content)}
                          variant={isPlaying ? "destructive" : "default"}
                          size="sm"
                          className={isPlaying 
                            ? "bg-red-500 hover:bg-red-600 text-white" 
                            : "bg-sky-600 hover:bg-sky-700 text-white"
                          }
                        >
                          {isPlaying ? (
                            <>
                              <Square className="h-3 w-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Listen
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {exercise.content.map((step, index) => (
                        <p key={index} className="text-sm text-sky-700 pl-4 border-l-2 border-sky-200">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="affirmations" className="space-y-4">
              {/* Audio Controls for Affirmations */}
              <Card className="p-4 border-sky-200 bg-sky-25">
                <div className="space-y-3">
                  <h4 className="font-medium text-sky-800 flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Audio Affirmations
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-sky-700">Background Sound:</label>
                      <select 
                        value={selectedBackgroundSound}
                        onChange={(e) => setSelectedBackgroundSound(e.target.value)}
                        className="px-3 py-1 border border-sky-300 rounded-md text-sm bg-white"
                      >
                        {Object.entries(backgroundSounds).map(([key, sound]) => (
                          <option key={key} value={key}>{sound.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={() => startGuidedAudio(affirmations)}
                      variant={isPlaying ? "destructive" : "default"}
                      size="sm"
                      className={isPlaying 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-sky-600 hover:bg-sky-700 text-white"
                      }
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-3 w-3 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Listen to All
                        </>
                      )}
                    </Button>
                    {isPlaying && (
                      <div className="text-sm text-sky-600 flex items-center">
                        <div className="animate-pulse w-2 h-2 bg-sky-500 rounded-full mr-2"></div>
                        Playing affirmations...
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <div className="text-center mb-4">
                <p className="text-sky-700">
                  Take a moment to read these affirmations. Choose one that resonates with you today.
                </p>
              </div>
              <div className="grid gap-3">
                {affirmations.map((affirmation, index) => (
                  <Card key={index} className="p-4 border-sky-200 bg-sky-50">
                    <div className="flex items-center justify-between">
                      <p className="text-center text-sky-800 font-medium flex-1">
                        "{affirmation}"
                      </p>
                      <Button
                        onClick={() => startGuidedAudio([affirmation])}
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-sky-600 hover:text-sky-800 hover:bg-sky-100"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guided-videos" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-sky-800 mb-2">Guided Affirmation Audio</h3>
                <p className="text-sky-700">
                  Professional affirmation sessions under 3 minutes with natural AI voice and calming background sounds.
                </p>
              </div>
              
              <div className="grid gap-4">
                {guidedAffirmationContent.map((session) => (
                  <Card key={session.id} className="p-4 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sky-800">{session.title}</h4>
                          <p className="text-sm text-sky-600">{session.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-sky-300 text-sky-700">
                            {session.duration}
                          </Badge>
                          <Button
                            onClick={() => startGuidedAudio(session.affirmations)}
                            variant={isPlaying ? "destructive" : "default"}
                            size="sm"
                            className={isPlaying 
                              ? "bg-red-500 hover:bg-red-600 text-white" 
                              : "bg-sky-600 hover:bg-sky-700 text-white"
                            }
                          >
                            {isPlaying ? (
                              <>
                                <Square className="h-3 w-3 mr-1" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Listen
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-white/60 rounded-lg p-4 space-y-3">
                        <h5 className="text-sm font-medium text-sky-800 mb-2">Affirmations:</h5>
                        <div className="space-y-2">
                          {session.affirmations.map((affirmation, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-200 text-sky-700 text-xs font-medium flex items-center justify-center mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-sm text-sky-700 leading-relaxed italic">"{affirmation}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-xs text-sky-600 bg-sky-50 p-2 rounded">
                        💡 Tip: Listen daily for best results. The natural AI voice with background sounds creates a spa-like experience.
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="text-center text-sm text-sky-600 bg-sky-50 p-3 rounded">
                <p>These affirmations are always available and designed for quick inspiration and positive mindset shifts throughout your day.</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => {
                stopGuidedAudio();
                setIsOpen(false);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              I'm Ready to Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}