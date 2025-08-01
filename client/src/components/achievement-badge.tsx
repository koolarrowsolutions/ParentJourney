import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Flame, 
  Heart, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Star,
  Calendar,
  Zap
} from "lucide-react";

interface AchievementBadgeProps {
  type: 'streak' | 'consistency' | 'milestone' | 'growth' | 'mindfulness' | 'connection' | 'progress' | 'energy';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  title: string;
  description: string;
  progress?: number;
  maxProgress?: number;
  unlocked?: boolean;
  showProgress?: boolean;
}

export function AchievementBadge({ 
  type, 
  level, 
  title, 
  description, 
  progress = 0, 
  maxProgress = 100,
  unlocked = false,
  showProgress = false 
}: AchievementBadgeProps) {
  const icons = {
    streak: Flame,
    consistency: Calendar,
    milestone: Star,
    growth: TrendingUp,
    mindfulness: Heart,
    connection: CheckCircle,
    progress: Target,
    energy: Zap
  };

  const colors = {
    bronze: {
      bg: 'from-amber-100 to-orange-100',
      border: 'border-amber-300',
      text: 'text-amber-700',
      icon: 'text-amber-600'
    },
    silver: {
      bg: 'from-gray-100 to-slate-100',
      border: 'border-gray-300',
      text: 'text-gray-700',
      icon: 'text-gray-600'
    },
    gold: {
      bg: 'from-yellow-100 to-amber-100',
      border: 'border-yellow-400',
      text: 'text-yellow-700',
      icon: 'text-yellow-600'
    },
    platinum: {
      bg: 'from-purple-100 to-indigo-100',
      border: 'border-purple-400',
      text: 'text-purple-700',
      icon: 'text-purple-600'
    }
  };

  const Icon = icons[type];
  const colorScheme = colors[level];
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  return (
    <Card className={`relative p-4 transition-all duration-300 hover-scale ${
      unlocked 
        ? `bg-gradient-to-br ${colorScheme.bg} ${colorScheme.border} border-2 shadow-md` 
        : 'bg-gray-50 border-gray-200 border opacity-60'
    }`}>
      {/* Achievement Icon */}
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          unlocked 
            ? `bg-white/80 ${colorScheme.icon}` 
            : 'bg-gray-200 text-gray-400'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className={`font-semibold text-sm ${
              unlocked ? colorScheme.text : 'text-gray-500'
            }`}>
              {title}
            </h4>
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0.5 ${
                unlocked 
                  ? `${colorScheme.border} ${colorScheme.text}` 
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              {level.toUpperCase()}
            </Badge>
          </div>
          
          <p className={`text-xs leading-relaxed ${
            unlocked ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {description}
          </p>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">
                  {progress} / {maxProgress}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-700 ${
                    unlocked 
                      ? `bg-gradient-to-r ${colorScheme.bg.replace('from-', 'from-').replace('to-', 'to-').replace('-100', '-400')}`
                      : 'bg-gray-300'
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Unlock Animation */}
      {unlocked && level === 'gold' && (
        <div className="absolute -top-1 -right-1 animate-bounce">
          <span className="text-sm">🏆</span>
        </div>
      )}
      
      {unlocked && level === 'platinum' && (
        <>
          <div className="absolute -top-1 -right-1 animate-ping">
            <span className="text-sm">✨</span>
          </div>
          <div className="absolute -bottom-1 -left-1 animate-bounce" style={{ animationDelay: '0.3s' }}>
            <span className="text-xs">⭐</span>
          </div>
        </>
      )}
    </Card>
  );
}