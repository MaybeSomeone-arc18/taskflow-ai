import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type AccentColor = 'blue' | 'purple' | 'emerald' | 'orange' | 'rose';
type FontSize = 'small' | 'medium' | 'large';
type Density = 'comfortable' | 'compact';

export interface AppearancePrefs {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  density: Density;
  reducedMotion: boolean;
  glassEffect: boolean;
  backgroundEffects: boolean;
}

interface ThemeContextType {
  theme: 'light' | 'dark'; // The actual resolved theme
  prefs: AppearancePrefs;
  toggleTheme: () => void;
  updatePreferences: (newPrefs: Partial<AppearancePrefs>) => void;
}

const DEFAULT_PREFS: AppearancePrefs = {
  themeMode: 'dark',
  accentColor: 'blue',
  fontSize: 'medium',
  density: 'comfortable',
  reducedMotion: false,
  glassEffect: true,
  backgroundEffects: true,
};

function loadPrefs(): AppearancePrefs {
  try {
    const s = localStorage.getItem('taskflow_appearance');
    if (s) return { ...DEFAULT_PREFS, ...JSON.parse(s) };
  } catch (_) { /* noop */ }
  
  // Migrate from old 'theme' key if present
  try {
    const oldTheme = localStorage.getItem('theme');
    if (oldTheme === 'light' || oldTheme === 'dark') {
      return { ...DEFAULT_PREFS, themeMode: oldTheme as ThemeMode };
    }
  } catch (_) { /* noop */ }
  
  return DEFAULT_PREFS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<AppearancePrefs>(loadPrefs);

  // Resolved theme based on system preference
  const resolvedTheme = prefs.themeMode === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
    : prefs.themeMode;

  const updatePreferences = useCallback((newPrefs: Partial<AppearancePrefs>) => {
    setPrefs(p => {
      const next = { ...p, ...newPrefs };
      localStorage.setItem('taskflow_appearance', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    updatePreferences({ themeMode: resolvedTheme === 'dark' ? 'light' : 'dark' });
  }, [resolvedTheme, updatePreferences]);

  // Apply all preferences to the document root immediately
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Theme
    if (resolvedTheme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    
    // Interface effects — toggle classes on html element
    root.classList.toggle('reduced-motion', prefs.reducedMotion);
    root.classList.toggle('glass-effect', prefs.glassEffect);
    root.classList.toggle('background-effects', prefs.backgroundEffects);

    // Accent color
    const accentMap: Record<string, { primary: string; hover: string }> = {
      blue:    { primary: '#3b82f6', hover: '#2563eb' },
      purple:  { primary: '#8b5cf6', hover: '#7c3aed' },
      emerald: { primary: '#10b981', hover: '#059669' },
      orange:  { primary: '#f97316', hover: '#ea580c' },
      rose:    { primary: '#f43f5e', hover: '#e11d48' },
    };
    const accent = accentMap[prefs.accentColor] ?? accentMap.blue;
    root.style.setProperty('--theme-primary', accent.primary);
    root.style.setProperty('--theme-primary-hover', accent.hover);

    // Font size
    const fontSizeMap: Record<string, string> = { small: '13px', medium: '14px', large: '15px' };
    root.style.fontSize = fontSizeMap[prefs.fontSize] ?? '14px';

    // Keep legacy theme key in sync
    localStorage.setItem('theme', resolvedTheme);
  }, [
    resolvedTheme,
    prefs.reducedMotion,
    prefs.glassEffect,
    prefs.backgroundEffects,
    prefs.accentColor,
    prefs.fontSize,
  ]);

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, prefs, toggleTheme, updatePreferences }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
