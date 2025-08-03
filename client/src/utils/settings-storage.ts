export interface Settings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export interface UserSettings extends Settings {
  parentName?: string;
  email?: string;
}

const defaultSettings: Settings = {
  theme: 'light',
  notifications: true,
  language: 'en'
};

export const settingsStorage = {
  get: (): Settings => {
    try {
      const stored = localStorage.getItem('app-settings');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },
  
  set: (settings: Partial<Settings>): void => {
    try {
      const current = settingsStorage.get();
      const updated = { ...current, ...settings };
      localStorage.setItem('app-settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
};

// Legacy function names for compatibility
export const getSettings = () => settingsStorage.get();
export const saveSettings = (settings: Partial<Settings>) => settingsStorage.set(settings);

export const resetSettings = () => {
  localStorage.removeItem('app-settings');
};

export const clearAllAppData = () => {
  localStorage.clear();
};

export const initializeTheme = () => {
  const settings = getSettings();
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};