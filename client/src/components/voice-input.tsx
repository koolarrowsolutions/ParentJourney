import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  placeholder?: string;
  isInline?: boolean; // For inline microphone in input fields
  className?: string;
}

export function VoiceInput({ onTranscription, placeholder = "Click to start voice input", isInline = false, className = "" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscription(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "There was an issue with voice recognition. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscription, toast]);

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (isInline) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10 ${className}`}
        onClick={isListening ? stopListening : startListening}
        title={isListening ? "Stop voice input" : "Start voice input"}
      >
        {isListening ? (
          <Square className="h-4 w-4 text-red-500 animate-pulse" />
        ) : (
          <Mic className="h-4 w-4 text-neutral-500 hover:text-primary" />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      onClick={isListening ? stopListening : startListening}
      className={`flex items-center space-x-2 ${className}`}
      disabled={!isSupported}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          <span>Stop Recording</span>
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          <span>Voice Input</span>
        </>
      )}
    </Button>
  );
}

// Legacy alias for backward compatibility
export const VoiceInputButton = VoiceInput;

// Add global type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}