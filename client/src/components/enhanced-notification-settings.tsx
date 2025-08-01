import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Save, 
  Check, 
  AlertCircle, 
  Clock,
  Mail,
  Phone,
  Monitor,
  TestTube,
  Shield,
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NotificationSettings {
  dailyReminder: string;
  weeklyProgress: string;
  reminderTime: string;
  notificationEmail: string;
  notificationPhone: string;
  browserNotifications: string;
  emailVerified: string;
  phoneVerified: string;
}

interface ValidationResult {
  valid: boolean;
  message: string;
}

export function EnhancedNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminder: "false",
    weeklyProgress: "false",
    reminderTime: "20:00",
    notificationEmail: "",
    notificationPhone: "",
    browserNotifications: "false",
    emailVerified: "false",
    phoneVerified: "false"
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default");
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load notification settings
  const { data: loadedSettings, isLoading } = useQuery({
    queryKey: ["/api/notification-settings"],
    queryFn: async () => {
      const response = await fetch("/api/notification-settings");
      if (!response.ok) throw new Error("Failed to load settings");
      return response.json();
    },
  });

  // Save notification settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      return await apiRequest("/api/notification-settings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      toast({
        title: "Settings Saved Successfully",
        description: "Your notification preferences have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notification-settings"] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
      console.error("Save error:", error);
    },
  });

  // Email validation mutation
  const validateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return response.json() as Promise<ValidationResult>;
    },
    onSuccess: (result, email) => {
      if (result.valid) {
        setValidationErrors(prev => ({ ...prev, email: "" }));
        toast({
          title: "Email Validated",
          description: result.message,
        });
      } else {
        setValidationErrors(prev => ({ ...prev, email: result.message }));
      }
    },
  });

  // Phone validation mutation
  const validatePhoneMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch("/api/validate-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      return response.json() as Promise<ValidationResult>;
    },
    onSuccess: (result, phone) => {
      if (result.valid) {
        setValidationErrors(prev => ({ ...prev, phone: "" }));
        toast({
          title: "Phone Validated",
          description: result.message,
        });
      } else {
        setValidationErrors(prev => ({ ...prev, phone: result.message }));
      }
    },
  });

  // Test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: async ({ type, recipient }: { type: string; recipient?: string }) => {
      const response = await fetch("/api/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, recipient }),
      });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: result.success ? "Test Successful" : "Test Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
  });

  useEffect(() => {
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  }, [loadedSettings]);

  useEffect(() => {
    // Check browser notification permission and mobile compatibility
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const isMobileChrome = () => {
    return isMobileDevice() && /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent);
  };

  const updateSetting = (key: keyof NotificationSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Browser notifications are not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    // Special handling for mobile Chrome
    if (isMobileChrome()) {
      toast({
        title: "Mobile Chrome Limitation",
        description: "Mobile Chrome has limited notification support. Consider using email or SMS notifications for reliable reminders.",
        variant: "destructive",
      });
      return;
    }

    // Additional mobile device warning
    if (isMobileDevice()) {
      toast({
        title: "Mobile Device Detected",
        description: "Mobile browsers have limited notification support. Email and SMS are more reliable options.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === "granted") {
        updateSetting("browserNotifications", "true");
        toast({
          title: "Notifications Enabled",
          description: "Browser notifications have been enabled successfully.",
        });
        
        // Send a test notification
        new Notification("ParentJourney", {
          body: "Browser notifications are now enabled! You'll receive gentle reminders for your journaling practice.",
          icon: "/favicon.ico",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Browser notifications were not enabled. You can change this in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Permission request error:", error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
    }
  };

  const validateEmail = () => {
    if (settings.notificationEmail) {
      validateEmailMutation.mutate(settings.notificationEmail);
    }
  };

  const validatePhone = () => {
    if (settings.notificationPhone) {
      validatePhoneMutation.mutate(settings.notificationPhone);
    }
  };

  const sendTestNotification = (type: string) => {
    const recipient = type === 'email' ? settings.notificationEmail : 
                     type === 'sms' ? settings.notificationPhone : undefined;
    testNotificationMutation.mutate({ type, recipient });
  };

  const handleSave = () => {
    // Validate required fields if notifications are enabled
    const errors: {[key: string]: string} = {};
    
    if (settings.dailyReminder === "true" || settings.weeklyProgress === "true") {
      if (!settings.notificationEmail && !settings.notificationPhone && settings.browserNotifications === "false") {
        errors.general = "Please enable at least one notification method (email, SMS, or browser) to receive reminders.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setValidationErrors({});
    saveSettingsMutation.mutate(settings);
  };

  const getBrowserNotificationStatus = () => {
    if (isMobileChrome()) {
      return { text: "📱 Mobile Chrome - Limited Support", color: "text-orange-600" };
    }
    if (isMobileDevice()) {
      return { text: "📱 Mobile - Limited Support", color: "text-orange-600" };
    }
    switch (browserPermission) {
      case "granted": return { text: "✅ Enabled", color: "text-green-600" };
      case "denied": return { text: "❌ Blocked", color: "text-red-600" };
      default: return { text: "⏳ Not Set", color: "text-yellow-600" };
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-neutral-200 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const browserStatus = getBrowserNotificationStatus();

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Management
          </span>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* General Validation Error */}
        {validationErrors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-red-700 text-sm">{validationErrors.general}</p>
          </div>
        )}

        {/* Reminder Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-neutral-800 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Reminder Preferences
          </h3>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-blue-900">Daily Journaling Reminder</Label>
              <p className="text-xs text-blue-700">Get a gentle nudge to reflect on your day</p>
            </div>
            <Switch
              checked={settings.dailyReminder === "true"}
              onCheckedChange={(checked) => updateSetting('dailyReminder', checked ? "true" : "false")}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-purple-900">Weekly Progress Updates</Label>
              <p className="text-xs text-purple-700">Receive weekly insights about your parenting journey</p>
            </div>
            <Switch
              checked={settings.weeklyProgress === "true"}
              onCheckedChange={(checked) => updateSetting('weeklyProgress', checked ? "true" : "false")}
            />
          </div>

          {(settings.dailyReminder === "true" || settings.weeklyProgress === "true") && (
            <div className="space-y-2 pl-4 border-l-2 border-neutral-200">
              <Label htmlFor="reminder-time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Reminder Time
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSetting('reminderTime', e.target.value)}
                className="w-40"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Notification Methods */}
        <div className="space-y-4">
          <h3 className="font-medium text-neutral-800">Notification Methods</h3>
          
          {/* Browser Notifications */}
          <div className={`space-y-3 p-4 rounded-lg border ${
            isMobileDevice() 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className={`h-5 w-5 ${isMobileDevice() ? 'text-orange-600' : 'text-green-600'}`} />
                <div>
                  <Label className={`font-medium ${isMobileDevice() ? 'text-orange-900' : 'text-green-900'}`}>
                    Browser Notifications
                  </Label>
                  <p className={`text-xs ${isMobileDevice() ? 'text-orange-700' : 'text-green-700'}`}>
                    {isMobileDevice() 
                      ? 'Limited support on mobile browsers - use email/SMS instead' 
                      : 'Instant pop-up reminders on this device'
                    }
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={browserStatus.color}>
                {browserStatus.text}
              </Badge>
            </div>
            
            {isMobileDevice() ? (
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 mb-2">
                  <strong>Mobile Browser Detected:</strong> {isMobileChrome() ? 'Chrome mobile' : 'Mobile browser'} has very limited notification support.
                </p>
                <p className="text-xs text-orange-700">
                  For reliable reminders, please use <strong>Email</strong> or <strong>SMS notifications</strong> below. 
                  These work much better on mobile devices and won't drain your battery.
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                {browserPermission !== "granted" ? (
                  <Button onClick={requestBrowserPermission} size="sm" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Browser Notifications
                  </Button>
                ) : (
                  <Button 
                    onClick={() => sendTestNotification('browser')} 
                    size="sm" 
                    variant="outline"
                    disabled={testNotificationMutation.isPending}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Browser Notification
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Email Notifications */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <Label className="font-medium text-blue-900">Email Notifications</Label>
            </div>
            
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={settings.notificationEmail}
                onChange={(e) => updateSetting('notificationEmail', e.target.value)}
                className={validationErrors.email ? "border-red-300" : ""}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.email}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={validateEmail} 
                  size="sm" 
                  variant="outline"
                  disabled={!settings.notificationEmail || validateEmailMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Validate Email
                </Button>
                {settings.notificationEmail && (
                  <Button 
                    onClick={() => sendTestNotification('email')} 
                    size="sm" 
                    variant="outline"
                    disabled={testNotificationMutation.isPending}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Send Test Email
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="h-5 w-5 text-orange-600" />
              <Label className="font-medium text-orange-900">SMS Notifications (Optional)</Label>
            </div>
            
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={settings.notificationPhone}
                onChange={(e) => updateSetting('notificationPhone', e.target.value)}
                className={validationErrors.phone ? "border-red-300" : ""}
              />
              {validationErrors.phone && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.phone}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={validatePhone} 
                  size="sm" 
                  variant="outline"
                  disabled={!settings.notificationPhone || validatePhoneMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Validate Phone
                </Button>
                {settings.notificationPhone && (
                  <Button 
                    onClick={() => sendTestNotification('sms')} 
                    size="sm" 
                    variant="outline"
                    disabled={testNotificationMutation.isPending}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Send Test SMS
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveSettingsMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveSettingsMutation.isPending ? "Saving..." : "Save Notification Settings"}
          </Button>
        </div>

        {/* Info Notes */}
        {isMobileDevice() && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📱 Mobile User Recommendations:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Email notifications</strong> work reliably on all mobile devices</li>
              <li>• <strong>SMS notifications</strong> are instant and don't require internet</li>
              <li>• Browser notifications on mobile are often blocked or unreliable</li>
              <li>• Consider adding your email for the best experience</li>
            </ul>
          </div>
        )}
        
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-600 leading-relaxed">
            <strong>Privacy Note:</strong> We'll only send you the notifications you choose. 
            Your email and phone number are securely stored and never shared with third parties. 
            You can disable notifications at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}