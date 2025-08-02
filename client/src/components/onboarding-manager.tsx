import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, X, RotateCcw } from 'lucide-react';

interface OnboardingManagerProps {
  className?: string;
}

export function OnboardingManager({ className = "" }: OnboardingManagerProps) {
  const [showManager, setShowManager] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>([]);

  useEffect(() => {
    // Load completed tours from localStorage
    const completed = localStorage.getItem('onboarding-tours-completed');
    if (completed) {
      setCompletedTours(JSON.parse(completed));
    }
  }, []);

  const resetOnboarding = (tourKey: string) => {
    localStorage.removeItem(`${tourKey}-completed`);
    const updated = completedTours.filter(key => key !== tourKey);
    setCompletedTours(updated);
    localStorage.setItem('onboarding-tours-completed', JSON.stringify(updated));
    
    // Reload page to trigger onboarding
    window.location.reload();
  };

  const resetAllOnboarding = () => {
    const tourKeys = [
      'home-tooltips-completed',
      'analytics-tooltips-completed', 
      'milestones-tooltips-completed',
      'settings-tooltips-completed'
    ];
    
    tourKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('onboarding-tours-completed');
    setCompletedTours([]);
    
    // Reload page to trigger onboarding
    window.location.reload();
  };

  const tours = [
    { key: 'home-tooltips-completed', name: 'Home Page Tour', description: 'Learn about mood tracking, AI insights, and quick actions' },
    { key: 'analytics-tooltips-completed', name: 'Analytics Tour', description: 'Understand your wellness trends and patterns' },
    { key: 'milestones-tooltips-completed', name: 'Milestones Tour', description: 'Track your children\'s development milestones' },
    { key: 'settings-tooltips-completed', name: 'Settings Tour', description: 'Manage your profile and app preferences' }
  ];

  if (!showManager) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowManager(true)}
        className={`fixed bottom-4 right-4 z-40 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 shadow-lg ${className}`}
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        Help & Tours
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 w-80 shadow-xl border-2 border-blue-200 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-blue-800">Feature Tours</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManager(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2 mb-4">
          {tours.map((tour) => (
            <div key={tour.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{tour.name}</span>
                  {completedTours.includes(tour.key) ? (
                    <Badge variant="outline" className="text-xs">Completed</Badge>
                  ) : (
                    <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">Available</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">{tour.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetOnboarding(tour.key)}
                className="ml-2 h-6 w-6 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllOnboarding}
            className="flex-1 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset All Tours
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Tooltips appear automatically for new features
        </p>
      </div>
    </Card>
  );
}