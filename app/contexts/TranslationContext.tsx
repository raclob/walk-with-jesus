import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  BUNDLED_TRANSLATION_ID,
  TRANSLATIONS,
  getTranslation,
  type Translation,
} from "@/data/translations";

const STORAGE_KEY = "@bibleexplorer/translation.v1";

interface TranslationContextValue {
  translationId: string;
  translation: Translation;
  setTranslationId: (id: string) => void;
  loaded: boolean;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [translationId, setTranslationIdState] = useState<string>(BUNDLED_TRANSLATION_ID);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && TRANSLATIONS.some((t) => t.id === raw && t.source !== "licensed")) {
          setTranslationIdState(raw);
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setTranslationId = useCallback((id: string) => {
    const t = getTranslation(id);
    if (t.source === "licensed") return; // not selectable until wired up
    setTranslationIdState(t.id);
    AsyncStorage.setItem(STORAGE_KEY, t.id).catch(() => {});
  }, []);

  const value = useMemo<TranslationContextValue>(
    () => ({
      translationId,
      translation: getTranslation(translationId),
      setTranslationId,
      loaded,
    }),
    [translationId, setTranslationId, loaded]
  );

  return (
    <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextValue {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
  return ctx;
}
