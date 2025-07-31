import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Clock, Heart, Baby, Star, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  dailyReminder: boolean;
  dailyReminderTime: string;
  weeklyReflection: boolean;
  milestoneAlerts: boolean;
  moodTracking: boolean;
  consistencyEncouragement: boolean;
}

export function NotificationSystem() {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminder: true,
    dailyReminderTime: "20:00",
    weeklyReflection: true,
    milestoneAlerts: true,
    moodTracking: false,
    consistencyEncouragement: true
  });
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled!",
          description: "You'll now receive gentle journaling reminders.",
        });
        
        // Send a test notification
        new Notification("ParentJourney", {
          body: "🌟 Notifications are now enabled! We'll send you gentle reminders to reflect on your parenting journey.",
          icon: "/favicon.ico",
          badge: "/favicon.ico"
        });
      } else {
        toast({
          title: "Notifications Denied",
          description: "You can enable them later in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const sendTestNotification = () => {
    if (permission !== "granted") {
      requestPermission();
      return;
    }

    new Notification("ParentJourney Reminder", {
      body: "💭 Take a moment to reflect on your parenting journey today. How are you feeling?",
      icon: "/favicon.ico",
      badge: "/favicon.ico"
    });

    toast({
      title: "Test Notification Sent!",
      description: "Check if you received the notification.",
    });
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const getNotificationStatusColor = () => {
    switch (permission) {
      case "granted": return "text-green-600";
      case "denied": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  const getNotificationStatusText = () => {
    switch (permission) {
      case "granted": return "✅ Enabled";
      case "denied": return "❌ Blocked";
      default: return "⏳ Not set";
    }
  };

  return (
    <Card className="shadow-sm border border-neutral-200 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-primary" />
            🔔 Smart Notifications
          </span>
          <Badge variant="outline" className={getNotificationStatusColor()}>
            {getNotificationStatusText()}
          </Badge>
        </CardTitle>
        <div className="text-sm text-neutral-600">
          Gentle reminders to support your journaling consistency
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Permission Status */}
        {permission !== "granted" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">
                  🔔 Enable Notifications
                </h3>
                <p className="text-sm text-yellow-700">
                  Get gentle reminders to maintain your journaling habit and celebrate milestones.
                </p>
              </div>
              <Button onClick={requestPermission} size="sm">
                Enable
              </Button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-neutral-800 flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Notification Preferences
          </h3>

          {/* Daily Reminder */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover-lift">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Clock className="mr-2 h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Daily Journaling Reminder</span>
              </div>
              <p className="text-sm text-blue-700">
                Gentle daily prompt to reflect on your parenting journey
              </p>
              {settings.dailyReminder && (
                <div className="mt-2">
                  <label className="text-xs text-blue-600 font-medium">Reminder time:</label>
                  <input
                    type="time"
                    value={settings.dailyReminderTime}
                    onChange={(e) => updateSetting("dailyReminderTime", e.target.value)}
                    className="ml-2 text-xs border border-blue-200 rounded px-2 py-1"
                  />
                </div>
              )}
            </div>
            <Switch
              checked={settings.dailyReminder}
              onCheckedChange={(checked) => updateSetting("dailyReminder", checked)}
            />
          </div>

          {/* Weekly Reflection */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover-lift">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Star className="mr-2 h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Weekly Reflection Summary</span>
              </div>
              <p className="text-sm text-purple-700">
                Weekly insights and patterns from your journal entries
              </p>
            </div>
            <Switch
              checked={settings.weeklyReflection}
              onCheckedChange={(checked) => updateSetting("weeklyReflection", checked)}
            />
          </div>

          {/* Milestone Alerts */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover-lift">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Baby className="mr-2 h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Milestone Celebrations</span>
              </div>
              <p className="text-sm text-green-700">
                Alerts for developmental milestones and special achievements
              </p>
            </div>
            <Switch
              checked={settings.milestoneAlerts}
              onCheckedChange={(checked) => updateSetting("milestoneAlerts", checked)}
            />
          </div>

          {/* Mood Tracking */}
          <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg hover-lift">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Heart className="mr-2 h-4 w-4 text-pink-600" />
                <span className="font-medium text-pink-900">Mood Pattern Insights</span>
              </div>
              <p className="text-sm text-pink-700">
                Notifications about mood trends and self-care suggestions
              </p>
            </div>
            <Switch
              checked={settings.moodTracking}
              onCheckedChange={(checked) => updateSetting("moodTracking", checked)}
            />
          </div>

          {/* Consistency Encouragement */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover-lift">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Star className="mr-2 h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900">Consistency Encouragement</span>
              </div>
              <p className="text-sm text-orange-700">
                Celebration of journaling streaks and gentle motivation
              </p>
            </div>
            <Switch
              checked={settings.consistencyEncouragement}
              onCheckedChange={(checked) => updateSetting("consistencyEncouragement", checked)}
            />
          </div>
        </div>

        {/* Test Notification */}
        {permission === "granted" && (
          <div className="pt-4 border-t border-neutral-200">
            <Button 
              onClick={sendTestNotification} 
              variant="outline" 
              className="w-full hover-scale"
            >
              <Bell className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        )}

        {/* Tips */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <h4 className="font-medium text-neutral-800 mb-2">💡 Tips for Better Notifications</h4>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• Set reminder time when you're usually free to reflect</li>
            <li>• Weekly summaries help identify patterns in your parenting journey</li>
            <li>• Milestone alerts celebrate your child's growth moments</li>
            <li>• You can adjust these settings anytime</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}