import React from 'react';
import { Sparkles } from 'lucide-react';

interface SparklyStarsLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SparklyStarsLoader({ 
  message = "AI is thinking...", 
  size = 'md' 
}: SparklyStarsLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const sparkleSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative mb-6">
        {/* Main central sparkle */}
        <Sparkles 
          className={`${sparkleSize} text-primary animate-pulse`} 
          style={{ 
            animationDuration: '1.5s',
            animationTimingFunction: 'ease-in-out'
          }} 
        />
        
        {/* Floating sparkles around the main one */}
        <div className="absolute inset-0 -m-8">
          {/* Top sparkle */}
          <Sparkles 
            className="h-3 w-3 text-purple-400 absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce"
            style={{ 
              animationDelay: '0.2s',
              animationDuration: '2s'
            }}
          />
          
          {/* Top-right sparkle */}
          <Sparkles 
            className="h-2 w-2 text-blue-400 absolute top-1 right-0 animate-pulse"
            style={{ 
              animationDelay: '0.8s',
              animationDuration: '1.8s'
            }}
          />
          
          {/* Right sparkle */}
          <Sparkles 
            className="h-3 w-3 text-pink-400 absolute right-0 top-1/2 transform -translate-y-1/2 animate-bounce"
            style={{ 
              animationDelay: '0.4s',
              animationDuration: '2.2s'
            }}
          />
          
          {/* Bottom-right sparkle */}
          <Sparkles 
            className="h-2 w-2 text-indigo-400 absolute bottom-1 right-1 animate-pulse"
            style={{ 
              animationDelay: '1.2s',
              animationDuration: '1.6s'
            }}
          />
          
          {/* Bottom sparkle */}
          <Sparkles 
            className="h-3 w-3 text-teal-400 absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce"
            style={{ 
              animationDelay: '0.6s',
              animationDuration: '2.4s'
            }}
          />
          
          {/* Bottom-left sparkle */}
          <Sparkles 
            className="h-2 w-2 text-green-400 absolute bottom-1 left-1 animate-pulse"
            style={{ 
              animationDelay: '1.4s',
              animationDuration: '1.4s'
            }}
          />
          
          {/* Left sparkle */}
          <Sparkles 
            className="h-3 w-3 text-yellow-400 absolute left-0 top-1/2 transform -translate-y-1/2 animate-bounce"
            style={{ 
              animationDelay: '1s',
              animationDuration: '2.6s'
            }}
          />
          
          {/* Top-left sparkle */}
          <Sparkles 
            className="h-2 w-2 text-orange-400 absolute top-1 left-1 animate-pulse"
            style={{ 
              animationDelay: '0.3s',
              animationDuration: '2s'
            }}
          />
        </div>
      </div>
      
      {/* Loading message */}
      <div className="text-center">
        <p className="text-primary font-medium text-sm animate-pulse">
          {message}
        </p>
        <div className="flex justify-center space-x-1 mt-2">
          <div 
            className="w-1 h-1 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '0s' }}
          ></div>
          <div 
            className="w-1 h-1 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div 
            className="w-1 h-1 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}