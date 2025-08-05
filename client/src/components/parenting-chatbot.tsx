import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TooltipWrapper } from "./tooltip-wrapper";
import { 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2, 
  Heart,
  Baby,
  Brain,
  Users,
  Minimize2,
  Maximize2
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ParentingChatbotProps {
  className?: string;
}

const SUGGESTED_TOPICS = [
  "Sleep training tips",
  "Toddler tantrums",
  "Picky eating",
  "Potty training",
  "Screen time limits",
  "Sibling rivalry",
  "Bedtime routines",
  "Discipline strategies"
];

// Custom chat bubble icon - proper speech bubble shape with 3 transparent dots
const ChatBubbleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    {/* Chat bubble shape with tail - solid white */}
    <path 
      d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.41 3.11 7.24L4 22l2.76-1.11C8.59 21.8 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" 
      fill="white" 
    />
    {/* Three transparent dots (holes) */}
    <circle cx="8.5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export function ParentingChatbot({ className }: ParentingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoginTimeRef = useRef<number>(0);

  const { user, isAuthenticated, hasJustLoggedIn } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        content: "Hi! I'm your AI parenting assistant. I'm here to help with child development, behavior challenges, parenting techniques, and more. What would you like to discuss today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Show welcome notification and bounce animation
  useEffect(() => {
    console.log('Chatbot login effect:', { isAuthenticated, hasJustLoggedIn, user: user?.username });
    
    if (isAuthenticated && hasJustLoggedIn && user) {
      const currentTime = Date.now();
      
      console.log('Login detected for chatbot animation:', { 
        currentTime, 
        lastLoginTime: lastLoginTimeRef.current, 
        timeDiff: currentTime - lastLoginTimeRef.current 
      });
      
      // Check if this is a new login session (not just a page refresh)
      if (currentTime - lastLoginTimeRef.current > 30000) { // 30 second threshold
        lastLoginTimeRef.current = currentTime;
        
        console.log('Triggering chatbot welcome animation');
        
        // Always show bounce animation on every login
        const timer = setTimeout(() => {
          setIsBouncing(true);
          
          // Check if we should show explainer text (once per day)
          const today = new Date().toDateString();
          const lastShownDate = localStorage.getItem('chatbot-explainer-shown');
          
          if (lastShownDate !== today) {
            setShowWelcomeNotification(true);
            localStorage.setItem('chatbot-explainer-shown', today);
            
            // Auto-hide notification after 4 seconds
            setTimeout(() => {
              setShowWelcomeNotification(false);
            }, 4000);
          }
          
          // Stop bouncing after 2 seconds
          setTimeout(() => {
            setIsBouncing(false);
          }, 2000);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, hasJustLoggedIn, user]);

  // Track user activity and set up periodic reminders
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Set up periodic reminder check
    const setupReminder = () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
      
      reminderIntervalRef.current = setInterval(() => {
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        const randomDelay = Math.random() * (10 * 60 * 1000 - 5 * 60 * 1000) + 5 * 60 * 1000; // 5-10 minutes
        
        if (timeSinceActivity >= randomDelay && !isOpen && isAuthenticated) {
          setIsBouncing(true);
          setTimeout(() => {
            setIsBouncing(false);
          }, 2000);
          lastActivityRef.current = Date.now(); // Reset to prevent frequent bouncing
        }
      }, 30000); // Check every 30 seconds
    };

    setupReminder();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, [isOpen]);

  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/parenting-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response");
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: (response: any) => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.reply || "I'm here to help with any parenting questions you have!",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm having trouble responding right now, but I'm here when you need parenting support!",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedTopic = (topic: string) => {
    setInputMessage(topic);
    textareaRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Welcome Notification */}
        {showWelcomeNotification && (
          <div className="absolute bottom-16 right-0 mb-2 mr-2 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 max-w-xs animate-pop-fade z-50">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 mb-1">
                  Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 
                </p>
                <p className="text-xs text-neutral-600">Your AI parenting assistant is ready to help you today.</p>
              </div>
            </div>
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-neutral-200"></div>
          </div>
        )}
        
        {/* Chatbot Button */}
        <TooltipWrapper content="Ask your parenting AI assistant">
          <Button
            onClick={() => setIsOpen(true)}
            className={cn(
              "w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 animate-bounce-in hover-scale",
              isBouncing && "animate-bounce",
              className
            )}
            data-testid="chatbot-button"
          >
            <ChatBubbleIcon className="w-11 h-11" />
          </Button>
        </TooltipWrapper>
      </div>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 animate-pop-fade bg-white border border-neutral-200",
      "md:w-96 md:h-[500px]", // Desktop size
      "max-md:fixed max-md:inset-0 max-md:w-full max-md:h-full max-md:bottom-0 max-md:right-0 max-md:rounded-none", // Mobile full screen
      isMinimized && "h-14 max-md:h-14",
      className
    )}>
      <CardHeader className="p-4 pb-2 border-b border-neutral-100 max-md:rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-neutral-800">
                Parenting Assistant
              </CardTitle>
              <p className="text-xs text-neutral-500">AI-powered support</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipWrapper content={isMinimized ? "Expand" : "Minimize"}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 md:flex hidden"
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
            </TooltipWrapper>
            <TooltipWrapper content="Close chat">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </TooltipWrapper>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(500px-80px)] max-md:h-[calc(100vh-80px)]">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[280px] sm:max-w-[320px] p-3 rounded-lg text-sm leading-relaxed",
                      "max-md:max-w-[calc(100vw-120px)]", // Better mobile width
                      message.role === 'user'
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-neutral-100 text-neutral-800 rounded-bl-sm"
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-6 h-6 bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-neutral-100 text-neutral-800 rounded-lg rounded-bl-sm p-3 text-sm max-w-[280px] sm:max-w-[320px] max-md:max-w-[calc(100vw-120px)]">
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Topics (only show when no messages or just welcome) */}
          {messages.length <= 1 && (
            <div className="p-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-600 mb-2">Quick topics:</p>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TOPICS.slice(0, 4).map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => handleSuggestedTopic(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-neutral-100">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about parenting, child development, behavior..."
                className="flex-1 min-h-[40px] max-h-20 resize-none text-sm"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || chatMutation.isPending}
                size="sm"
                className="h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}