import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

// UI preferences. The backend has no settings endpoint, so these are stored in
// this browser only (localStorage) and the Settings page says so.
export interface Preferences {
  pageSize: number;
  sidebarCollapsed: boolean;
}

export interface PreferencesContextValue {
  preferences: Preferences;
  updatePreferences: (changes: Partial<Preferences>) => void;
  resetPreferences: () => void;
}

export const DEFAULT_PREFERENCES: Preferences = { pageSize: 10, sidebarCollapsed: false };
export const PAGE_SIZE_OPTIONS = [10, 25, 50];
const STORAGE_KEY = "carepoint.preferences";

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<Preferences>) : {};
    return {
      pageSize: PAGE_SIZE_OPTIONS.includes(Number(saved.pageSize))
        ? Number(saved.pageSize)
        : DEFAULT_PREFERENCES.pageSize,
      sidebarCollapsed: Boolean(saved.sidebarCollapsed),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function save(preferences: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // ignore: preferences then last until reload
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(load);

  const updatePreferences = useCallback((changes: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...changes };
      save(next);
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    save(DEFAULT_PREFERENCES);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const value = useMemo(
    () => ({ preferences, updatePreferences, resetPreferences }),
    [preferences, updatePreferences, resetPreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
