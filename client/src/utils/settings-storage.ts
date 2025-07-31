export interface UserSettings {
  // Notification preferences
  dailyReminder: boolean;
  weeklyProgress: boolean;
  reminderTime: string;
  
  // Personal goals
  parentingFocus: string;
  
  // UI preferences
  darkMode: boolean;
  
  // App data
  lastBackup?: string;
}

const SETTINGS_KEY = 'parenting-journal-settings';

const defaultSettings: UserSettings = {
  dailyReminder: false,
  weeklyProgress: false,
  reminderTime: '20:00',
  parentingFocus: '',
  darkMode: false,
};

export function getSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return defaultSettings;
}

export function saveSettings(settings: Partial<UserSettings>): void {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    
    // Apply dark mode immediately
    if (settings.darkMode !== undefined) {
      document.documentElement.classList.toggle('dark', settings.darkMode);
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function resetSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    document.documentElement.classList.remove('dark');
  } catch (error) {
    console.error('Failed to reset settings:', error);
  }
}

export function clearAllAppData(): void {
  const keys = Object.keys(localStorage);
  const appKeys = keys.filter(key => 
    key.startsWith('parenting-journal') || 
    key.startsWith('calmResetUsage')
  );
  
  appKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  document.documentElement.classList.remove('dark');
}

// Initialize dark mode on app load
export function initializeTheme(): void {
  const settings = getSettings();
  document.documentElement.classList.toggle('dark', settings.darkMode);
}