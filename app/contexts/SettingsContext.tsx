import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "@bibleexplorer/settings.v1";

export type DailyGoal = 1 | 2 | 3 | 5 | 7 | 10;

interface SettingsState {
  dailyGoal: DailyGoal;
}

interface SettingsContextValue extends SettingsState {
  loaded: boolean;
  setDailyGoal: (g: DailyGoal) => void;
}

const DEFAULT: SettingsState = {
  dailyGoal: 1,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...DEFAULT, ...(JSON.parse(raw) as Partial<SettingsState>) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const setDailyGoal = useCallback((g: DailyGoal) => {
    setState((s) => ({ ...s, dailyGoal: g }));
  }, []);

  return (
    <SettingsContext.Provider value={{ ...state, loaded, setDailyGoal }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
