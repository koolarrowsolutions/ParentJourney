import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";
import { getLoginGreeting } from "@shared/greetings";

interface LoginConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  userName?: string;
}

export function LoginConfirmationModal({ isVisible, onClose, userName }: LoginConfirmationModalProps) {
  const [greeting] = useState(() => getLoginGreeting());

  useEffect(() => {
    if (isVisible) {
      console.log('Login confirmation modal showing with message:', greeting);
      // Auto-close after 7 seconds with fade effect
      const timer = setTimeout(() => {
        onClose();
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, greeting]);

  if (!isVisible) return null;

  console.log('LoginConfirmationModal rendering with:', { isVisible, userName, greeting });

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative mx-4 w-full max-w-md animate-in slide-in-from-top-4 fade-in-0 duration-500 shadow-2xl">
        <CardContent className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Success icon and content */}
          <div className="text-center space-y-4">
            {/* Success icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            {/* Welcome message */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-neutral-800">
                Welcome back{userName ? `, ${userName}` : ''}!
              </h3>
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                  {greeting}
                </p>
              </div>
            </div>

            {/* Auto-close indicator */}
            <div className="flex items-center justify-center space-x-2 text-xs text-neutral-400">
              <div className="w-2 h-2 bg-neutral-300 rounded-full animate-pulse" />
              <span>Auto-closing in 7 seconds</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}