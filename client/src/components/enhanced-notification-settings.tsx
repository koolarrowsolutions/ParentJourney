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
      const response = await fetch("/api/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
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
      <Card className="animate-pulse w-full max-w-none">
        <CardHeader className="px-4 sm:px-6">
          <div className="h-5 sm:h-6 bg-neutral-200 rounded w-full max-w-xs"></div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="h-3 sm:h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-3 sm:h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-3 sm:h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const browserStatus = getBrowserNotificationStatus();

  return (
    <Card className="shadow-sm border border-neutral-200 w-full max-w-none">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-lg sm:text-xl">
            <Bell className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="break-words">Notification Management</span>
          </span>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs sm:text-sm self-start sm:self-center">
              Unsaved Changes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* General Validation Error */}
        {validationErrors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-xs sm:text-sm leading-relaxed">{validationErrors.general}</p>
          </div>
        )}

        {/* Reminder Settings */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-medium text-neutral-800 flex items-center gap-2 text-base sm:text-lg">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span>Reminder Preferences</span>
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <div className="space-y-1 flex-1">
              <Label className="text-sm sm:text-base font-medium text-blue-900">Daily Journaling Reminder</Label>
              <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">Get a gentle nudge to reflect on your day</p>
            </div>
            <Switch
              checked={settings.dailyReminder === "true"}
              onCheckedChange={(checked) => updateSetting('dailyReminder', checked ? "true" : "false")}
              className="self-start sm:self-center"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg">
            <div className="space-y-1 flex-1">
              <Label className="text-sm sm:text-base font-medium text-purple-900">Weekly Progress Updates</Label>
              <p className="text-xs sm:text-sm text-purple-700 leading-relaxed">Receive weekly insights about your parenting journey</p>
            </div>
            <Switch
              checked={settings.weeklyProgress === "true"}
              onCheckedChange={(checked) => updateSetting('weeklyProgress', checked ? "true" : "false")}
              className="self-start sm:self-center"
            />
          </div>

          {(settings.dailyReminder === "true" || settings.weeklyProgress === "true") && (
            <div className="space-y-2 pl-3 sm:pl-4 border-l-2 border-neutral-200 ml-2 sm:ml-0">
              <Label htmlFor="reminder-time" className="text-sm sm:text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Preferred Reminder Time</span>
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSetting('reminderTime', e.target.value)}
                className="w-full max-w-[160px] text-sm sm:text-base"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Notification Methods */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-medium text-neutral-800 text-base sm:text-lg">Notification Methods</h3>
          
          {/* Email Notifications */}
          <div className="space-y-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <Label className="font-medium text-blue-900 text-sm sm:text-base">Email Notifications</Label>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={settings.notificationEmail}
                onChange={(e) => updateSetting('notificationEmail', e.target.value)}
                className={`text-sm sm:text-base ${validationErrors.email ? "border-red-300" : ""}`}
              />
              {validationErrors.email && (
                <p className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span>{validationErrors.email}</span>
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={validateEmail} 
                  size="sm" 
                  variant="outline"
                  disabled={!settings.notificationEmail || validateEmailMutation.isPending}
                  className="text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Validate Email
                </Button>
                {settings.notificationEmail && (
                  <Button 
                    onClick={() => sendTestNotification('email')} 
                    size="sm" 
                    variant="outline"
                    disabled={testNotificationMutation.isPending}
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <TestTube className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Send Test Email
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="space-y-3 p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
              <Label className="font-medium text-orange-900 text-sm sm:text-base">SMS Notifications (Optional)</Label>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={settings.notificationPhone}
                onChange={(e) => updateSetting('notificationPhone', e.target.value)}
                className={`text-sm sm:text-base ${validationErrors.phone ? "border-red-300" : ""}`}
              />
              {validationErrors.phone && (
                <p className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span>{validationErrors.phone}</span>
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={validatePhone} 
                  size="sm" 
                  variant="outline"
                  disabled={!settings.notificationPhone || validatePhoneMutation.isPending}
                  className="text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Validate Phone
                </Button>
                {settings.notificationPhone && (
                  <Button 
                    onClick={() => sendTestNotification('sms')} 
                    size="sm" 
                    variant="outline"
                    disabled={testNotificationMutation.isPending}
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <TestTube className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Send Test SMS
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Combined Mobile Browser Information */}
          {isMobileDevice() && (
            <div className="space-y-3 p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-orange-600" />
                <div className="flex-1 min-w-0">
                  <Label className="font-medium text-sm sm:text-base block text-orange-900">
                    Browser Notifications
                  </Label>
                  <p className="text-xs sm:text-sm leading-relaxed mt-1 text-orange-700">
                    Limited support on mobile browsers - use email/SMS instead
                  </p>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs whitespace-nowrap self-start">
                  {isMobileChrome() ? 'Chrome mobile - Limited Support' : 'Mobile browser - Limited Support'}
                </Badge>
              </div>
              
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-orange-800 mb-2 leading-relaxed">
                  <strong>Mobile Browser Detected:</strong> {isMobileChrome() ? 'Chrome mobile' : 'Mobile browser'} has very limited notification support.
                </p>
                <p className="text-xs text-orange-700 leading-relaxed">
                  For reliable reminders, please use <strong>Email</strong> or <strong>SMS notifications</strong> above. 
                  These work much better on mobile devices and won't drain your battery.
                </p>
              </div>
            </div>
          )}

          {/* Desktop Browser Notifications */}
          {!isMobileDevice() && (
            <div className="space-y-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-2 sm:gap-3 flex-1">
                  <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium text-sm sm:text-base block text-green-900">
                      Browser Notifications
                    </Label>
                    <p className="text-xs sm:text-sm leading-relaxed mt-1 text-green-700">
                      Instant pop-up reminders on this device
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`${browserStatus.color} text-xs whitespace-nowrap self-start`}>
                  {browserStatus.text}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {browserPermission !== "granted" ? (
                  <Button onClick={requestBrowserPermission} size="sm" variant="outline" className="text-xs sm:text-sm">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Enable Browser </span>Notifications
                  </Button>
                ) : (
                  <Button 
                    onClick={() => sendTestNotification('browser')} 
                    size="sm" 
                    variant="outline"
                    disabled={testNotificationMutation.isPending}
                    className="text-xs sm:text-sm"
                  >
                    <TestTube className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Test Browser </span>Notification
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 sm:pt-4">
            <Button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saveSettingsMutation.isPending}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm sm:text-base"
            >
              <Save className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {saveSettingsMutation.isPending ? "Saving..." : "Save Notification Settings"}
              </span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Info Notes */}
        {isMobileDevice() && (
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
              <span className="text-lg">📱</span>
              <span>Mobile User Recommendations:</span>
            </h4>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1 leading-relaxed">
              <li>• <strong>Email notifications</strong> work reliably on all mobile devices</li>
              <li>• <strong>SMS notifications</strong> are instant and don't require internet</li>
              <li>• Browser notifications on mobile are often blocked or unreliable</li>
              <li>• Consider adding your email for the best experience</li>
            </ul>
          </div>
        )}
        
        <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 border border-neutral-200">
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            <strong>Privacy Note:</strong> We'll only send you the notifications you choose. 
            Your email and phone number are securely stored and never shared with third parties. 
            You can disable notifications at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}