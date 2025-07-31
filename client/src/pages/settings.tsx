import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Target, 
  Download, 
  Upload, 
  Trash2, 
  FileText, 
  Moon, 
  Sun,
  Clock,
  Mail,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { exportToJSON, exportToCSV, exportFavoritesToPDF, importFromJSON, validateImportData } from "@/utils/data-export";
import { VoiceInputButton } from "@/components/voice-input";
import { OnboardingTour } from "@/components/onboarding-tour";
import { getSettings, saveSettings, resetSettings, clearAllAppData, type UserSettings } from "@/utils/settings-storage";
import { shouldShowTour } from "@/utils/onboarding-storage";
import type { JournalEntry, ChildProfile } from "@shared/schema";

interface SettingsProps {
  triggerSignUpPrompt?: (trigger: 'save' | 'bookmark' | 'export' | 'settings') => boolean;
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const changeEmailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required to change email"),
});

export default function Settings({ triggerSignUpPrompt }: SettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(getSettings);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailForm = useForm({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: user?.email || "",
      password: "",
    },
  });

  // Fetch data for export
  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    queryFn: async () => {
      const response = await fetch("/api/journal-entries?limit=1000");
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  useEffect(() => {
    // Initialize theme on component mount
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, []);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings({ [key]: value });
    
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    });
  };

  const handleExportJSON = () => {
    if (!entries || !childProfiles) {
      toast({
        title: "Export Failed",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }
    
    exportToJSON(entries, childProfiles);
    updateSetting('lastBackup', new Date().toISOString());
    toast({
      title: "Export Complete",
      description: "Your journal data has been downloaded as JSON",
    });
  };

  const handleExportCSV = () => {
    // Check if user needs to sign up before exporting
    if (triggerSignUpPrompt && triggerSignUpPrompt('export')) {
      return; // Don't proceed with export, show sign-up prompt instead
    }

    if (!entries || !childProfiles) {
      toast({
        title: "Export Failed",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }
    
    exportToCSV(entries, childProfiles);
    toast({
      title: "Export Complete",
      description: "Your journal entries have been downloaded as CSV",
    });
  };

  const handleExportFavorites = async () => {
    // Check if user needs to sign up before exporting
    if (triggerSignUpPrompt && triggerSignUpPrompt('export')) {
      return; // Don't proceed with export, show sign-up prompt instead
    }

    if (!entries || !childProfiles) {
      toast({
        title: "Export Failed",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    const favoriteEntries = entries.filter(entry => entry.isFavorite === "true");
    
    if (favoriteEntries.length === 0) {
      toast({
        title: "No Favorites",
        description: "You don't have any favorite entries to export",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportFavoritesToPDF({ 
        entries: favoriteEntries, 
        childProfiles: childProfiles || [] 
      });
      toast({
        title: "Export Complete",
        description: `Exported ${favoriteEntries.length} favorite entries to PDF`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export favorites to PDF",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsImporting(true);

    try {
      const importData = await importFromJSON(file);
      
      if (!validateImportData(importData)) {
        throw new Error('Invalid file format');
      }

      // In a real app, you'd send this to your backend
      // For now, we'll just show success and store in localStorage for demo
      localStorage.setItem('imported-data', JSON.stringify(importData));
      
      toast({
        title: "Import Successful",
        description: `Imported ${importData.entries.length} entries and ${importData.childProfiles.length} profiles`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportFile(null);
      // Reset the input
      event.target.value = '';
    }
  };

  const onChangePassword = async (data: z.infer<typeof changePasswordSchema>) => {
    try {
      const response = await fetch('/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onChangeEmail = async (data: z.infer<typeof changeEmailSchema>) => {
    try {
      const response = await fetch('/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: data.newEmail,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change email');
      }

      toast({
        title: "Email Updated",
        description: "Your email has been successfully changed.",
      });
      emailForm.reset({
        newEmail: data.newEmail,
        password: "",
      });
      
      // Reload to update user info
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: "Email Change Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetAllData = () => {
    clearAllAppData();
    resetSettings();
    setSettings(getSettings());
    
    toast({
      title: "Data Reset",
      description: "All app data has been cleared. Please refresh the page.",
    });
  };

  const favoriteCount = entries?.filter(entry => entry.isFavorite === "true").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary/5 dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <Link href="/">
              <Button variant="outline" className="hover-scale">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main
              </Button>
            </Link>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">⚙️ Settings</h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Customize your ParentJourney experience
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notifications & Reminders */}
          <Card className="dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                <Bell className="h-5 w-5 text-primary" />
                Reminders & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Daily journaling reminder</Label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Get a gentle nudge to reflect on your day</p>
                </div>
                <Switch
                  checked={settings.dailyReminder}
                  onCheckedChange={(checked) => updateSetting('dailyReminder', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Weekly progress updates</Label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Receive weekly insights about your parenting journey</p>
                </div>
                <Switch
                  checked={settings.weeklyProgress}
                  onCheckedChange={(checked) => updateSetting('weeklyProgress', checked)}
                />
              </div>

              {settings.dailyReminder && (
                <div className="space-y-2">
                  <Label htmlFor="reminder-time" className="text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Reminder time
                  </Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => updateSetting('reminderTime', e.target.value)}
                    className="w-32 dark:bg-neutral-700 dark:border-neutral-600"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Goals */}
          <Card className="dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                <Target className="h-5 w-5 text-primary" />
                Personal Goals & Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parenting-focus" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  What's one parenting focus you want to work on?
                </Label>
                <div className="relative">
                  <Textarea
                    id="parenting-focus"
                    placeholder="e.g., Being more patient during bedtime routines, encouraging independence, improving communication..."
                    value={settings.parentingFocus}
                    onChange={(e) => updateSetting('parentingFocus', e.target.value)}
                    className="min-h-[80px] dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 pr-12"
                  />
                  <div className="absolute right-2 top-2">
                    <VoiceInputButton
                      onTranscript={(text) => {
                        const currentValue = settings.parentingFocus || '';
                        updateSetting('parentingFocus', currentValue + (currentValue ? ' ' : '') + text);
                      }}
                    />
                  </div>
                </div>
              </div>
              {settings.parentingFocus && (
                <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Your focus will be displayed on your journal screen as a gentle reminder
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          {isAuthenticated && user && (
            <Card className="dark:bg-neutral-800 dark:border-neutral-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                  <Key className="h-5 w-5 text-primary" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Username</Label>
                  <div className="flex items-center space-x-2">
                    <div className="bg-neutral-100 dark:bg-neutral-700 px-3 py-2 rounded-md text-neutral-700 dark:text-neutral-300 text-sm">
                      @{user.username}
                    </div>
                    <Badge variant="secondary">Cannot be changed</Badge>
                  </div>
                </div>

                <Separator className="dark:border-neutral-600" />

                {/* Change Email */}
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800 dark:text-neutral-100">Change Email Address</h4>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onChangeEmail)} className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter new email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showEmailPassword ? "text" : "password"} 
                                  placeholder="Enter your current password" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                                  tabIndex={-1}
                                >
                                  {showEmailPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={emailForm.formState.isSubmitting}>
                        {emailForm.formState.isSubmitting ? "Updating..." : "Update Email"}
                      </Button>
                    </form>
                  </Form>
                </div>

                <Separator className="dark:border-neutral-600" />

                {/* Change Password */}
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-800 dark:text-neutral-100">Change Password</h4>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showCurrentPassword ? "text" : "password"} 
                                  placeholder="Enter your current password" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  tabIndex={-1}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showNewPassword ? "text" : "password"} 
                                  placeholder="Enter new password (min 8 characters)" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  tabIndex={-1}
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder="Confirm your new password" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  tabIndex={-1}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                        {passwordForm.formState.isSubmitting ? "Updating..." : "Change Password"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backup & Export */}
          <Card className="dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                <Download className="h-5 w-5 text-primary" />
                Backup & Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-neutral-800 dark:text-neutral-100">Export All Data</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleExportJSON}
                      variant="outline" 
                      className="w-full justify-start dark:border-neutral-600 dark:text-neutral-100"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download as JSON
                    </Button>
                    <Button 
                      onClick={handleExportCSV}
                      variant="outline" 
                      className="w-full justify-start dark:border-neutral-600 dark:text-neutral-100"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Download as CSV
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-neutral-800 dark:text-neutral-100">Export Favorites</h4>
                  <Button 
                    onClick={handleExportFavorites}
                    disabled={favoriteCount === 0}
                    variant="outline" 
                    className="w-full justify-start dark:border-neutral-600 dark:text-neutral-100"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export {favoriteCount} Favorites to PDF
                  </Button>
                  {favoriteCount === 0 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Star some entries to export them as favorites
                    </p>
                  )}
                </div>
              </div>

              {settings.lastBackup && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Last backup: {new Date(settings.lastBackup).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="dark:bg-neutral-800 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                <SettingsIcon className="h-5 w-5 text-primary" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                    {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Dark mode
                  </Label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Toggle between light and dark themes</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                />
              </div>

              <Separator className="dark:bg-neutral-600" />

              {/* Import Data */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                    className="dark:bg-neutral-700 dark:border-neutral-600"
                  />
                  {isImporting && (
                    <Badge variant="secondary">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Importing...
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Import journal data from a JSON backup file
                </p>
              </div>

              <Separator className="dark:bg-neutral-600" />

              {/* Tour Again */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  App Tutorial
                </Label>
                <Button 
                  onClick={() => setShowTour(true)}
                  variant="outline"
                  className="w-full dark:border-neutral-600 dark:text-neutral-100"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Take Tour Again
                </Button>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Revisit key features and learn how to make the most of ParentJourney
                </p>
              </div>

              <Separator className="dark:bg-neutral-600" />

              {/* Reset Data */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset All App Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-neutral-800 dark:border-neutral-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-neutral-100">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-neutral-300">
                        This action cannot be undone. This will permanently delete all your journal entries, 
                        child profiles, settings, and any other app data stored locally.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:border-neutral-600 dark:text-neutral-100">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleResetAllData}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  This will clear all journal entries, profiles, and settings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <OnboardingTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
      />
    </div>
  );
}