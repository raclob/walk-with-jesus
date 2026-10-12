import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { SerializedReference } from "@/data/parseReference";

const STORAGE_KEY = "@bibleexplorer/sermons.v1";

export interface SermonSupplement {
  id: string;
  ref: SerializedReference;
  note?: string;
}

export interface SermonPoint {
  id: string;
  point: string;
  answer: string;
  supplements?: SermonSupplement[];
}

export interface SermonLog {
  id: string;
  title: string;
  speaker?: string;
  date: string; // ISO date (YYYY-MM-DD)
  passage?: SerializedReference;
  points: SermonPoint[];
  supplemental: SermonSupplement[];
  notes?: string;
  aiSummary?: string;
  aiSummaryGeneratedAt?: number;
  summarySource?: "local-ai" | "offline";
  summaryInputSnapshot?: string;
  summaryInputTruncated?: boolean;
  summaryModel?: string;
  createdAt: number;
  updatedAt: number;
}

interface SermonContextValue {
  loaded: boolean;
  sermons: SermonLog[];
  getSermon: (id: string) => SermonLog | undefined;
  createSermon: (initial?: Partial<Omit<SermonLog, "id" | "createdAt" | "updatedAt">>) => SermonLog;
  updateSermon: (id: string, patch: Partial<Omit<SermonLog, "id" | "createdAt">>) => void;
  deleteSermon: (id: string) => void;
}

const SermonContext = createContext<SermonContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function SermonProvider({ children }: { children: React.ReactNode }) {
  const [sermons, setSermons] = useState<SermonLog[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SermonLog[];
          if (Array.isArray(parsed)) setSermons(parsed);
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sermons)).catch(() => {});
  }, [sermons, loaded]);

  const getSermon = useCallback(
    (id: string) => sermons.find((s) => s.id === id),
    [sermons]
  );

  const createSermon = useCallback(
    (initial?: Partial<Omit<SermonLog, "id" | "createdAt" | "updatedAt">>): SermonLog => {
      const now = Date.now();
      const sermon: SermonLog = {
        id: makeId("sermon"),
        title: initial?.title ?? "",
        speaker: initial?.speaker,
        date: initial?.date ?? todayIso(),
        passage: initial?.passage,
        points: initial?.points ?? [],
        supplemental: initial?.supplemental ?? [],
        notes: initial?.notes,
        createdAt: now,
        updatedAt: now,
      };
      setSermons((prev) => [sermon, ...prev]);
      return sermon;
    },
    []
  );

  const updateSermon = useCallback(
    (id: string, patch: Partial<Omit<SermonLog, "id" | "createdAt">>) => {
      setSermons((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s))
      );
    },
    []
  );

  const deleteSermon = useCallback((id: string) => {
    setSermons((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const value = useMemo<SermonContextValue>(
    () => ({ loaded, sermons, getSermon, createSermon, updateSermon, deleteSermon }),
    [loaded, sermons, getSermon, createSermon, updateSermon, deleteSermon]
  );

  return <SermonContext.Provider value={value}>{children}</SermonContext.Provider>;
}

export function useSermons(): SermonContextValue {
  const ctx = useContext(SermonContext);
  if (!ctx) throw new Error("useSermons must be used within SermonProvider");
  return ctx;
}

export { makeId as makeSermonId };
