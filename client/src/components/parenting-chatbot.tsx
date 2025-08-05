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
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ParentingChatbotProps {
  className?: string;
}

// Age-Appropriate Quick Topics Library
const QUICK_TOPICS_BY_AGE = {
  // 0-2 years (Infants & Toddlers)
  "0-2": [
    "Sleep training and bedtime routines",
    "Dealing with toddler tantrums",
    "Potty training readiness and tips",
    "First foods and feeding challenges",
    "Language development milestones",
    "Safe exploration and childproofing",
    "Separation anxiety management",
    "Establishing daily routines",
    "Teething comfort and care",
    "Building attachment and bonding",
    "Managing naptime struggles",
    "Introducing solid foods safely",
    "Encouraging first words",
    "Handling biting and hitting",
    "Creating a safe play environment"
  ],
  
  // 3-5 years (Preschoolers)
  "3-5": [
    "Preschool readiness and preparation",
    "Teaching sharing and taking turns",
    "Bedtime resistance solutions",
    "Picky eating in preschoolers",
    "Managing big emotions and meltdowns",
    "Potty training completion",
    "Building independence skills",
    "Screen time limits for young children",
    "Teaching basic manners and politeness",
    "Encouraging imaginative play",
    "Handling defiant behavior",
    "Preparing for kindergarten",
    "Social skills with peers",
    "Managing fear and anxiety",
    "Creating consistent consequences"
  ],
  
  // 6-8 years (Early Elementary)
  "6-8": [
    "Homework habits and study skills",
    "Building self-confidence at school",
    "Managing after-school activities",
    "Teaching responsibility with chores",
    "Handling peer conflicts",
    "Screen time balance with schoolwork",
    "Supporting learning differences",
    "Building healthy friendships",
    "Managing school stress and anxiety",
    "Teaching problem-solving skills",
    "Encouraging reading habits",
    "Dealing with perfectionism",
    "Building emotional intelligence",
    "Teaching money basics",
    "Supporting creativity and interests"
  ],
  
  // 9-12 years (Late Elementary/Pre-teen)
  "9-12": [
    "Navigating pre-teen social dynamics",
    "Managing increased homework demands",
    "Teaching digital citizenship",
    "Handling peer pressure situations",
    "Supporting identity development",
    "Managing mood swings and emotions",
    "Encouraging independence and responsibility",
    "Discussing body changes and puberty",
    "Building study and organization skills",
    "Teaching conflict resolution",
    "Managing social media introduction",
    "Supporting academic challenges",
    "Building self-advocacy skills",
    "Teaching time management",
    "Encouraging leadership opportunities"
  ],
  
  // 13-15 years (Early Teens)
  "13-15": [
    "Navigating early teenage relationships",
    "Managing academic pressure and stress",
    "Teaching healthy social media habits",
    "Supporting identity and self-expression",
    "Handling increased independence requests",
    "Managing teenage mood and hormones",
    "Discussing dating and relationships",
    "Supporting extracurricular balance",
    "Teaching financial responsibility",
    "Navigating peer pressure and choices",
    "Building communication and trust",
    "Managing technology boundaries",
    "Supporting college preparation thinking",
    "Teaching driving responsibility",
    "Encouraging healthy risk-taking"
  ],
  
  // 16-18 years (Late Teens)
  "16-18": [
    "College preparation and applications",
    "Teaching adult life skills",
    "Managing increased freedom responsibly",
    "Supporting career exploration",
    "Navigating serious relationships",
    "Teaching financial independence",
    "Managing driving responsibilities",
    "Supporting mental health and wellness",
    "Preparing for leaving home",
    "Teaching decision-making skills",
    "Managing work-school balance",
    "Supporting future planning",
    "Building adult communication skills",
    "Teaching self-advocacy",
    "Encouraging healthy independence"
  ],
  
  // General topics for mixed ages or no children
  "general": [
    "Building strong family communication",
    "Creating consistent household routines",
    "Teaching gratitude and kindness",
    "Managing family stress and changes",
    "Encouraging physical activity and health",
    "Supporting learning and growth mindset",
    "Building resilience in children",
    "Teaching empathy and compassion",
    "Creating positive family traditions",
    "Managing sibling relationships",
    "Supporting individual strengths",
    "Teaching environmental responsibility",
    "Building family values",
    "Managing screen time as a family",
    "Creating meaningful family time"
  ]
};

// Function to determine age group from birth date
const getAgeGroup = (birthDate: string | Date) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const ageInYears = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  let actualAge = ageInYears;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    actualAge--;
  }
  
  if (actualAge <= 2) return "0-2";
  if (actualAge <= 5) return "3-5";
  if (actualAge <= 8) return "6-8";
  if (actualAge <= 12) return "9-12";
  if (actualAge <= 15) return "13-15";
  if (actualAge <= 18) return "16-18";
  return "general";
};

// Function to get age-appropriate topics based on user's children
const getAgeAppropriateTopics = (childProfiles: any[] = []) => {
  let allTopics: string[] = [];
  
  if (!childProfiles || childProfiles.length === 0) {
    // No children profiles, use general topics
    allTopics = QUICK_TOPICS_BY_AGE.general;
  } else {
    // Get topics for each child's age group
    const ageGroups = new Set<string>();
    
    childProfiles.forEach(child => {
      if (child.birthDate) {
        const ageGroup = getAgeGroup(child.birthDate);
        ageGroups.add(ageGroup);
      }
    });
    
    // If no valid birth dates, use general
    if (ageGroups.size === 0) {
      ageGroups.add("general");
    }
    
    // Combine topics from all relevant age groups
    ageGroups.forEach(ageGroup => {
      if (QUICK_TOPICS_BY_AGE[ageGroup as keyof typeof QUICK_TOPICS_BY_AGE]) {
        allTopics.push(...QUICK_TOPICS_BY_AGE[ageGroup as keyof typeof QUICK_TOPICS_BY_AGE]);
      }
    });
    
    // If we have mixed ages, add some general topics too
    if (ageGroups.size > 1) {
      allTopics.push(...QUICK_TOPICS_BY_AGE.general.slice(0, 5));
    }
  }
  
  return allTopics;
};

// Function to get 6 random age-appropriate topics
const getRandomTopics = (childProfiles: any[] = []) => {
  const availableTopics = getAgeAppropriateTopics(childProfiles);
  const shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};

// Custom chat bubble button - the button itself IS the chat bubble shape
const ChatBubbleButton = ({ onClick, className, isBouncing, children }: { 
  onClick: () => void; 
  className?: string; 
  isBouncing?: boolean;
  children?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "relative bg-transparent border-none p-0 hover-scale transition-all duration-200",
      isBouncing && "animate-bounce",
      className
    )}
    data-testid="chatbot-button"
  >
    <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-lg">
      {/* Chat bubble shape - blue background with shadow */}
      <path 
        d="M48 8H16c-4.4 0-8 3.6-8 8v24c0 4.4 3.6 8 8 8h6l10 12 10-12h6c4.4 0 8-3.6 8-8V16c0-4.4-3.6-8-8-8z" 
        fill="hsl(199, 89%, 48%)" 
        className="drop-shadow-md"
      />
      {/* Three white dots (holes) */}
      <circle cx="22" cy="28" r="4" fill="white" />
      <circle cx="32" cy="28" r="4" fill="white" />
      <circle cx="42" cy="28" r="4" fill="white" />
    </svg>
    {children}
  </button>
);

export function ParentingChatbot({ className }: ParentingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [showDelayedBounce, setShowDelayedBounce] = useState(false);
  const [currentTopics, setCurrentTopics] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoginTimeRef = useRef<number>(0);

  const { user, isAuthenticated, hasJustLoggedIn } = useAuth();

  // Fetch child profiles for age-appropriate topics
  const { data: childProfiles = [] } = useQuery<any[]>({
    queryKey: ['/api/child-profiles'],
    enabled: isAuthenticated,
  });

  // Initialize random topics when component mounts or chat opens
  useEffect(() => {
    if (isOpen && currentTopics.length === 0) {
      setCurrentTopics(getRandomTopics(Array.isArray(childProfiles) ? childProfiles : []));
    }
  }, [isOpen, currentTopics.length, childProfiles]);

  // Refresh topics when child profiles change (age-appropriate adjustment)
  useEffect(() => {
    if (isOpen && Array.isArray(childProfiles) && childProfiles.length > 0) {
      setCurrentTopics(getRandomTopics(childProfiles));
    }
  }, [childProfiles, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only scroll to bottom for user messages or if it's the first message
      if (lastMessage.role === 'user' || messages.length === 1) {
        scrollToBottom();
      } else {
        // For assistant messages, scroll to the start of that message
        setTimeout(() => {
          const messageElements = document.querySelectorAll('[data-message-id]');
          const lastMessageElement = messageElements[messageElements.length - 1];
          if (lastMessageElement) {
            lastMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
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

  // Show welcome notification and delayed bounce animation
  useEffect(() => {
    console.log('Chatbot login effect:', { isAuthenticated, hasJustLoggedIn, user: user?.username });
    
    if (isAuthenticated && user) {
      // Set up 3-second delayed bounce for any page load
      const delayedBounceTimer = setTimeout(() => {
        setShowDelayedBounce(true);
        setIsBouncing(true);
        
        // Stop bouncing after 2 seconds
        setTimeout(() => {
          setIsBouncing(false);
        }, 2000);
        
        // Reset delayed bounce state after animation
        setTimeout(() => {
          setShowDelayedBounce(false);
        }, 3000);
      }, 3000);
      
      if (hasJustLoggedIn) {
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
          
          // Show welcome notification for new logins
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
      
      // Cleanup timer on unmount
      return () => {
        if (delayedBounceTimer) {
          clearTimeout(delayedBounceTimer);
        }
      };
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
    if (chatMutation.isPending) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: topic,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(topic);
    
    // Refresh topics for next time
    setCurrentTopics(getRandomTopics(Array.isArray(childProfiles) ? childProfiles : []));
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
        
        {/* Chatbot Button - custom chat bubble shape */}
        <TooltipWrapper content="Ask your parenting AI assistant">
          <ChatBubbleButton
            onClick={() => setIsOpen(true)}
            className={cn(
              "animate-bounce-in",
              className
            )}
            isBouncing={isBouncing}
          />
        </TooltipWrapper>
      </div>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 w-96 h-[85vh] shadow-2xl z-50 animate-pop-fade bg-white border border-neutral-200",
      "md:w-96 md:h-[85vh]", // Desktop size - 85% of viewport height
      "max-md:fixed max-md:inset-0 max-md:w-full max-md:h-full max-md:bottom-0 max-md:right-0 max-md:rounded-none", // Mobile full screen
      "drop-shadow-2xl shadow-black/20",
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
        <CardContent className="p-0 flex flex-col h-[calc(85vh-80px)] max-md:h-[calc(100vh-80px)]">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  data-message-id={message.id}
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
                      "max-w-[280px] sm:max-w-[320px] p-2.5 rounded-lg text-sm leading-tight",
                      "max-md:max-w-[calc(100vw-120px)]", // Better mobile width
                      message.role === 'user'
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-neutral-100 text-neutral-800 rounded-bl-sm"
                    )}
                  >
                    <div className="chat-content whitespace-pre-wrap break-words">
                      {message.role === 'assistant' ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Ultra-compact markdown components for chat formatting
                            p: ({ children }) => <p style={{ margin: '0 0 0.2rem 0', lineHeight: '1.2' }}>{children}</p>,
                            ul: ({ children }) => <ul className="pl-4 list-disc" style={{ listStylePosition: 'outside', margin: '0 0 0.2rem 0', lineHeight: '1.2' }}>{children}</ul>,
                            ol: ({ children }) => <ol className="pl-4 list-decimal" style={{ listStylePosition: 'outside', margin: '0 0 0.2rem 0', lineHeight: '1.2' }}>{children}</ol>,
                            li: ({ children }) => <li style={{ display: 'list-item', margin: '0', lineHeight: '1.2' }}>{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            h1: ({ children }) => <h1 className="text-base font-semibold" style={{ margin: '0.2rem 0' }}>{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-semibold" style={{ margin: '0.2rem 0' }}>{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold" style={{ margin: '0.2rem 0' }}>{children}</h3>,
                            blockquote: ({ children }) => <blockquote className="border-l-2 border-neutral-300 pl-3 italic" style={{ margin: '0.2rem 0' }}>{children}</blockquote>,
                            code: ({ children }) => <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                            pre: ({ children }) => <pre className="bg-neutral-100 p-2 rounded text-xs font-mono overflow-x-auto" style={{ margin: '0.2rem 0' }}>{children}</pre>,
                          }}
                          className="prose prose-sm max-w-none"
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
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
              <div className="grid grid-cols-2 gap-1.5 max-w-sm mx-auto">
                {currentTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="text-[10px] cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors px-2 py-1 text-center justify-center"
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