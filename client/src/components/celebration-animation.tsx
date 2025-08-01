import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Heart, TrendingUp } from "lucide-react";

interface CelebrationAnimationProps {
  onClose: () => void;
}

export function CelebrationAnimation({ onClose }: CelebrationAnimationProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay for animation timing
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][i % 7],
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    left: Math.random() * 100,
    size: 8 + Math.random() * 4
  }));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-bounce"
            style={{
              left: `${particle.left}%`,
              top: '-20px',
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: '2px',
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              animationIterationCount: 'infinite',
              transform: 'rotate(45deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        ))}
      </div>

      {/* Fireworks Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          >
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Card className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white shadow-2xl transition-all duration-700 ${
        showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-500 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-400 animate-spin" />
              </div>
            </div>
          </div>

          {/* Celebration Message */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              🎉 Daily Check-In Complete! 🎉
            </h1>
            <p className="text-lg sm:text-xl text-green-600 font-semibold">
              Amazing work on prioritizing your wellness today!
            </p>
          </div>

          {/* Importance Message */}
          <div className="bg-blue-50 rounded-lg p-4 sm:p-6 text-left space-y-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <Heart className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Why Daily Check-Ins Matter</h3>
            </div>
            
            <div className="space-y-3 text-gray-700">
              <p className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Self-Awareness:</strong> Regular reflection helps you recognize patterns in your emotional and physical well-being</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Early Intervention:</strong> Catching stress or burnout early allows you to take action before it impacts your family</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Parenting Growth:</strong> Tracking your confidence and connection helps you become the parent you want to be</span>
              </p>
            </div>
          </div>

          {/* Insights Promise */}
          <div className="bg-purple-50 rounded-lg p-4 sm:p-6 text-left space-y-4">
            <div className="flex items-center space-x-2 text-purple-800">
              <TrendingUp className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Your Wellness Insights</h3>
            </div>
            
            <div className="space-y-2 text-gray-700">
              <p>Your check-in data will help us provide:</p>
              <div className="space-y-2 ml-4">
                <p className="flex items-center space-x-2">
                  <span className="text-purple-500">✨</span>
                  <span>Personalized wellness trends and patterns</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="text-purple-500">✨</span>
                  <span>AI-powered parenting tips based on your current state</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="text-purple-500">✨</span>
                  <span>Early warning signals for burnout or stress</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="text-purple-500">✨</span>
                  <span>Celebration of your parenting victories and growth</span>
                </p>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">
              Keep up the excellent work! Consistent check-ins lead to better insights and a healthier, happier parenting journey.
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg transition-all hover-scale button-press"
          >
            Continue Your Journey ✨
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}