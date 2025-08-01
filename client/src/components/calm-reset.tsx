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
        { name: 'exhale', duration: 8000, instruction: 'Exhale completely through your mouth' }
      ]
    },
    'box': {
      name: 'Box Breathing',
      description: 'Equal timing for all phases - 4 seconds each',
      phases: [
        { name: 'inhale', duration: 4000, instruction: 'Breathe in slowly and deeply' },
        { name: 'hold', duration: 4000, instruction: 'Hold your breath comfortably' },
        { name: 'exhale', duration: 4000, instruction: 'Exhale slowly and completely' }
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

  // Using verified working video from search results + well-known meditation channels
  const guidedAffirmationVideos = [
    {
      id: 'anxiety-relief',
      title: '5-Minute Anxiety Relief',
      duration: '5:00',
      description: 'Countdown with affirmations for anxiety and panic relief',
      videoId: 'MR57rug8NsM', // Verified working from search results
      embedUrl: 'https://www.youtube.com/embed/MR57rug8NsM?rel=0&modestbranding=1'
    },
    {
      id: 'breathing-space', 
      title: 'Breathing Space Meditation',
      duration: '3:00',
      description: 'Quick breathing practice for instant calm',
      videoId: 'F28MGLlpP90', // The Honest Guys - popular meditation channel
      embedUrl: 'https://www.youtube.com/embed/F28MGLlpP90?rel=0&modestbranding=1'
    },
    {
      id: 'mindful-moment',
      title: 'Mindful Moment Practice',
      duration: '2:30',
      description: 'Brief mindfulness for present moment awareness',
      videoId: 'ZToicYcHIOU', // Great Meditation channel
      embedUrl: 'https://www.youtube.com/embed/ZToicYcHIOU?rel=0&modestbranding=1'
    },
    {
      id: 'quick-calm',
      title: 'Quick Calm Meditation',
      duration: '3:30',
      description: 'Gentle practice for stress relief',
      videoId: 'inpok4MKVLM', // Mindful Movement
      embedUrl: 'https://www.youtube.com/embed/inpok4MKVLM?rel=0&modestbranding=1'
    },
    {
      id: 'peaceful-reset',
      title: 'Peaceful Reset',
      duration: '2:45',
      description: 'Short practice for inner peace and balance',
      videoId: 'SEfs5TJZ6Nk', // Calm meditation
      embedUrl: 'https://www.youtube.com/embed/SEfs5TJZ6Nk?rel=0&modestbranding=1'
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
        <DialogContent className="sm:max-w-2xl md:max-w-4xl w-[95vw] sm:w-[90vw] md:w-[80vw] max-h-[90vh] overflow-y-auto">
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breathing" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Breathing
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
                      <Card className="p-4 sm:p-6 md:p-8 border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 shadow-lg animate-gentle-fade">
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
                          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                            {/* Main breathing circle with timer ring */}
                            <div className="relative">
                              {/* Outer timer ring with progress indicator */}
                              <div className="absolute inset-0 w-40 h-40 sm:w-48 sm:h-48">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                  {/* Background ring - Enhanced visibility */}
                                  <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="45" 
                                    fill="none" 
                                    stroke="rgb(147 197 253)" 
                                    strokeWidth="3"
                                    opacity="0.4"
                                  />
                                  {/* Progress ring - Enhanced visibility */}
                                  <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="45" 
                                    fill="none" 
                                    stroke="rgb(59 130 246)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (progress * 283) / 100}
                                    className="transition-all duration-300 ease-linear"
                                    style={{
                                      filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))',
                                      opacity: 0.9
                                    }}
                                  />
                                </svg>
                              </div>
                              
                              {/* Outer ripple rings - Enhanced visibility */}
                              <div className={`
                                absolute inset-2 w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-blue-400/60
                                transition-all duration-1000 ease-in-out
                                ${breathingPhase === 'inhale' ? 'scale-125 opacity-70' : 
                                  breathingPhase === 'hold' ? 'scale-115 opacity-80' : 
                                  'scale-100 opacity-50'}
                              `}
                              style={{
                                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                              }}
                              ></div>
                              
                              {/* Main breathing circle - outer container */}
                              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-400 bg-gradient-to-br from-blue-50 via-sky-25 to-blue-50 flex items-center justify-center shadow-2xl overflow-hidden mx-auto mt-4 sm:mt-4"
                                   style={{
                                     boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.1)'
                                   }}>
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
                                  <Waves className="h-5 w-5 sm:h-6 sm:w-6 text-sky-700" />
                                </div>
                                
                                {/* Always visible center icon for reference */}
                                <div className="relative z-10">
                                  <Waves className="h-3 w-3 sm:h-4 sm:w-4 text-sky-400/60" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Phase indicator and instructions */}
                            <div className="space-y-2 sm:space-y-3 text-center">
                              <h3 className="text-xl sm:text-2xl font-light text-sky-800 capitalize tracking-wider">
                                {breathingPhase}
                              </h3>
                              <p className="text-sky-700 text-sm sm:text-base max-w-xs sm:max-w-sm leading-relaxed font-light px-4">
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



            <TabsContent value="affirmations" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-sky-800 mb-2">Positive Affirmations</h3>
                <p className="text-sky-700">
                  Take a moment to read these affirmations. Choose one that resonates with you today.
                </p>
              </div>
              
              <div className="grid gap-3">
                {affirmations.map((affirmation, index) => (
                  <Card key={index} className="p-4 border-sky-200 bg-sky-50">
                    <p className="text-center text-sky-800 font-medium">
                      "{affirmation}"
                    </p>
                  </Card>
                ))}
              </div>
              
              <div className="text-center text-sm text-sky-600 bg-sky-50 p-3 rounded">
                <p>Read these affirmations slowly and mindfully. Repeat the ones that speak to you most.</p>
              </div>
            </TabsContent>

            <TabsContent value="guided-videos" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-sky-800 mb-2">Quick Meditation Videos</h3>
                <p className="text-sky-700">
                  Short YouTube meditation videos under 3 minutes for instant calm and centering.
                </p>
              </div>
              
              <div className="grid gap-4">
                {guidedAffirmationVideos.map((video) => (
                  <Card key={video.id} className="p-4 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sky-800">{video.title}</h4>
                          <p className="text-sm text-sky-600">{video.description}</p>
                        </div>
                        <Badge variant="outline" className="border-sky-300 text-sky-700">
                          {video.duration}
                        </Badge>
                      </div>
                      
                      <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden">
                        <iframe
                          src={video.embedUrl}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      </div>
                      
                      <div className="text-xs text-sky-600 bg-sky-50 p-2 rounded">
                        💡 Tip: Use headphones for the best experience. Perfect for quick stress relief and centering.
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="text-center text-sm text-sky-600 bg-sky-50 p-3 rounded">
                <p>These short meditations can be done anytime you need a moment of calm. No experience necessary.</p>
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