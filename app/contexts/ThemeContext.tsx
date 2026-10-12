import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { availableTheme, getTheme, type ThemeId } from "@/data/themes";
import { usePremium } from "@/contexts/PremiumContext";

const STORAGE_KEY = "@walkwithjesus/appearance.v1";
const ThemeContext = createContext({ theme: getTheme("midnight"), selectTheme: (_id: ThemeId) => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { premium } = usePremium();
  const [selected, setSelected] = useState<ThemeId>("midnight");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(id => setSelected(getTheme(id).id)).catch(() => {}).finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, selected).catch(() => {});
  }, [selected, loaded]);
  const selectTheme = (id: ThemeId) => {
    const candidate = getTheme(id);
    if (loaded && (!candidate.premium || premium)) setSelected(candidate.id);
  };
  return <ThemeContext.Provider value={{ theme: availableTheme(selected, premium), selectTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
