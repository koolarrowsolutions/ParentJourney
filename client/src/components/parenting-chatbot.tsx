import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TooltipWrapper } from "./tooltip-wrapper";
import { 
  MessageCircle, 
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

export function ParentingChatbot({ className }: ParentingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/parenting-chat", {
        message,
        conversationHistory: messages.slice(-10) // Send last 10 messages for context
      });
      return response;
    },
    onSuccess: (response: any) => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.reply || "I'm sorry, I couldn't generate a response.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
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
      <TooltipWrapper content="Ask your parenting AI assistant">
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50 animate-bounce-in",
            className
          )}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </TooltipWrapper>
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
                className="h-8 w-8 p-0"
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
                      "max-w-[280px] p-3 rounded-lg text-sm",
                      message.role === 'user'
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-neutral-100 text-neutral-800 rounded-bl-sm"
                    )}
                  >
                    {message.content}
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
                  <div className="bg-neutral-100 text-neutral-800 rounded-lg rounded-bl-sm p-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
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