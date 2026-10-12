import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BOOKS, TOTAL_CHAPTERS } from "@/data/books";
import { CANONICAL_JOURNEY, CHRONOLOGICAL_JOURNEY, JourneyType, getJourney } from "@/data/journeys";
import { PROPHECIES, Prophecy, getPropheciesAtFulfillment, getPropheciesAtSource } from "@/data/prophecies";
import { localDayKey, recordReadingDay } from "@/services/readingInsights";

const STORAGE_KEY = "@bibleexplorer/state.v2";

interface PersistedState {
  journeyType: JourneyType;
  journeyIndex: number;
  completedThisRun: Record<string, boolean>;
  heatMap: Record<string, number>;
  readingDays: Record<string, number>;
  readingHistoryStartedOn: string | null;
  discoveredProphecies: Record<string, boolean>;
  fulfilledProphecies: Record<string, boolean>;
  prestigeLevel: number;
  totalRunsCompleted: number;
  hasOnboarded: boolean;
  recentlyDiscovered: string[];
  pendingMilestones: string[];
  milestoneHistory: string[]; // ordered list of book ids completed (across all runs)
  completedBooksThisRun: string[]; // guards against repeat milestone awards on rereads
  readingStreak: { count: number; lastReadDate: string | null };
  prestigeOfferedAt: number; // run index this was last shown for; suppresses re-prompt
}

const initialState: PersistedState = {
  journeyType: "canonical",
  journeyIndex: 0,
  completedThisRun: {},
  heatMap: {},
  readingDays: {},
  readingHistoryStartedOn: null,
  discoveredProphecies: {},
  fulfilledProphecies: {},
  prestigeLevel: 0,
  totalRunsCompleted: 0,
  hasOnboarded: false,
  recentlyDiscovered: [],
  pendingMilestones: [],
  milestoneHistory: [],
  completedBooksThisRun: [],
  readingStreak: { count: 0, lastReadDate: null },
  prestigeOfferedAt: -1,
};

export type ProphecyStatus = "hidden" | "watching" | "fulfilled";

export interface MarkReadResult {
  newlyDiscovered: Prophecy[];
  newlyFulfilled: Prophecy[];
  bookCompleted: boolean;
}

interface ProgressContextValue extends PersistedState {
  loaded: boolean;
  setJourneyType: (t: JourneyType) => void;
  completeOnboarding: (t: JourneyType) => void;
  markChapterRead: (bookId: string, chapter: number) => MarkReadResult;
  discoverProphecy: (prophecyId: string) => Prophecy | null;
  prestige: () => void;
  declinePrestige: () => void;
  bookProgress: (bookId: string) => { completed: number; total: number };
  totalProgress: () => { completed: number; total: number };
  isChapterRead: (bookId: string, chapter: number) => boolean;
  acknowledgeMilestone: (bookId: string) => void;
  resetAll: () => void;
  prophecyStatus: (prophecyId: string) => ProphecyStatus;
  collectedCount: number; // discovered count (legacy alias)
  fulfilledCount: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function updateStreak(s: PersistedState["readingStreak"]): PersistedState["readingStreak"] {
  const today = new Date();
  const todayKey = dateKey(today);
  if (s.lastReadDate === todayKey) return s;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);
  if (s.lastReadDate === yesterdayKey) {
    return { count: s.count + 1, lastReadDate: todayKey };
  }
  return { count: 1, lastReadDate: todayKey };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          setState({ ...initialState, ...parsed, readingDays: parsed.readingDays ?? {} });
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const setJourneyType = useCallback((t: JourneyType) => {
    setState((s) => {
      const journey = getJourney(t);
      let newIdx = 0;
      for (let i = 0; i < journey.length; i++) {
        const stop = journey[i];
        if (!s.completedThisRun[`${stop.bookId}:${stop.chapter}`]) {
          newIdx = i;
          break;
        }
        newIdx = i + 1;
      }
      return { ...s, journeyType: t, journeyIndex: newIdx };
    });
  }, []);

  const completeOnboarding = useCallback((t: JourneyType) => {
    setState((s) => ({ ...s, journeyType: t, hasOnboarded: true }));
  }, []);

  const markChapterRead = useCallback(
    (bookId: string, chapter: number): MarkReadResult => {
      const newlyDiscovered: Prophecy[] = [];
      const newlyFulfilled: Prophecy[] = [];
      let bookCompleted = false;
      const readDay = localDayKey(new Date());

      setState((s) => {
        const key = `${bookId}:${chapter}`;
        const newCompleted = { ...s.completedThisRun, [key]: true };
        const newHeat = { ...s.heatMap, [key]: (s.heatMap[key] ?? 0) + 1 };
        const newDiscovered = { ...s.discoveredProphecies };
        const newFulfilled = { ...s.fulfilledProphecies };
        const newRecent = [...s.recentlyDiscovered];

        // Source side: chapter-type prophecies auto-discover here.
        // verse-type prophecies must be discovered manually via discoverProphecy.
        const sourceProphecies = getPropheciesAtSource(bookId, chapter);
        for (const p of sourceProphecies) {
          if (p.type === "chapter" && !newDiscovered[p.id]) {
            newDiscovered[p.id] = true;
            newRecent.unshift(p.id);
            newlyDiscovered.push(p);
          }
        }

        // Fulfillment side: ONLY mark fulfilled if the prophecy was previously discovered.
        // This preserves the two-stage Watching → Fulfilled lifecycle.
        const fulfillmentProphecies = getPropheciesAtFulfillment(bookId, chapter);
        for (const p of fulfillmentProphecies) {
          if (newDiscovered[p.id] && !newFulfilled[p.id]) {
            newFulfilled[p.id] = true;
            newlyFulfilled.push(p);
          }
        }

        // Journey index
        const journey = getJourney(s.journeyType);
        let newIdx = s.journeyIndex;
        if (journey[s.journeyIndex] && journey[s.journeyIndex].bookId === bookId && journey[s.journeyIndex].chapter === chapter) {
          newIdx = s.journeyIndex + 1;
        } else {
          for (let i = 0; i < journey.length; i++) {
            const stop = journey[i];
            if (!newCompleted[`${stop.bookId}:${stop.chapter}`]) {
              newIdx = i;
              break;
            }
            newIdx = i + 1;
          }
        }

        // Book completion check
        const book = BOOKS.find((b) => b.id === bookId);
        const newPending = [...s.pendingMilestones];
        const newHistory = [...s.milestoneHistory];
        const newCompletedBooks = [...s.completedBooksThisRun];
        if (book) {
          let allComplete = true;
          for (let c = 1; c <= book.chapterCount; c++) {
            if (!newCompleted[`${bookId}:${c}`]) {
              allComplete = false;
              break;
            }
          }
          if (allComplete && !s.completedBooksThisRun.includes(bookId)) {
            newPending.push(bookId);
            newHistory.push(bookId);
            newCompletedBooks.push(bookId);
            bookCompleted = true;
          }
        }

        return {
          ...s,
          completedThisRun: newCompleted,
          heatMap: newHeat,
          readingDays: recordReadingDay(s.readingDays, readDay),
          readingHistoryStartedOn: s.readingHistoryStartedOn ?? readDay,
          discoveredProphecies: newDiscovered,
          fulfilledProphecies: newFulfilled,
          recentlyDiscovered: newRecent.slice(0, 20),
          journeyIndex: newIdx,
          pendingMilestones: newPending,
          milestoneHistory: newHistory,
          completedBooksThisRun: newCompletedBooks,
          readingStreak: updateStreak(s.readingStreak),
        };
      });

      return { newlyDiscovered, newlyFulfilled, bookCompleted };
    },
    []
  );

  const discoverProphecy = useCallback((prophecyId: string): Prophecy | null => {
    setState((s) => {
      if (s.discoveredProphecies[prophecyId]) return s;
      return {
        ...s,
        discoveredProphecies: { ...s.discoveredProphecies, [prophecyId]: true },
        recentlyDiscovered: [prophecyId, ...s.recentlyDiscovered].slice(0, 20),
      };
    });
    return PROPHECIES.find((p) => p.id === prophecyId) ?? null;
  }, []);

  const acknowledgeMilestone = useCallback((bookId: string) => {
    setState((s) => ({ ...s, pendingMilestones: s.pendingMilestones.filter((id) => id !== bookId) }));
  }, []);

  const prestige = useCallback(() => {
    setState((s) => ({
      ...s,
      completedThisRun: {},
      journeyIndex: 0,
      prestigeLevel: s.prestigeLevel + 1,
      totalRunsCompleted: s.totalRunsCompleted + 1,
      pendingMilestones: [],
      completedBooksThisRun: [],
      prestigeOfferedAt: -1,
    }));
  }, []);

  const declinePrestige = useCallback(() => {
    setState((s) => ({ ...s, prestigeOfferedAt: s.totalRunsCompleted }));
  }, []);

  const resetAll = useCallback(() => {
    setState(initialState);
  }, []);

  const bookProgress = useCallback(
    (bookId: string) => {
      const book = BOOKS.find((b) => b.id === bookId);
      if (!book) return { completed: 0, total: 0 };
      let completed = 0;
      for (let c = 1; c <= book.chapterCount; c++) {
        if (state.completedThisRun[`${bookId}:${c}`]) completed++;
      }
      return { completed, total: book.chapterCount };
    },
    [state.completedThisRun]
  );

  const totalProgress = useCallback(() => {
    const completed = Object.keys(state.completedThisRun).length;
    return { completed, total: TOTAL_CHAPTERS };
  }, [state.completedThisRun]);

  const isChapterRead = useCallback(
    (bookId: string, chapter: number) => !!state.completedThisRun[`${bookId}:${chapter}`],
    [state.completedThisRun]
  );

  const prophecyStatus = useCallback(
    (id: string): ProphecyStatus => {
      if (state.fulfilledProphecies[id]) return "fulfilled";
      if (state.discoveredProphecies[id]) return "watching";
      return "hidden";
    },
    [state.discoveredProphecies, state.fulfilledProphecies]
  );

  const collectedCount = Object.keys(state.discoveredProphecies).length;
  const fulfilledCount = Object.keys(state.fulfilledProphecies).length;

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...state,
      loaded,
      setJourneyType,
      completeOnboarding,
      markChapterRead,
      discoverProphecy,
      prestige,
      declinePrestige,
      bookProgress,
      totalProgress,
      isChapterRead,
      acknowledgeMilestone,
      resetAll,
      prophecyStatus,
      collectedCount,
      fulfilledCount,
    }),
    [state, loaded, setJourneyType, completeOnboarding, markChapterRead, discoverProphecy, prestige, declinePrestige, bookProgress, totalProgress, isChapterRead, acknowledgeMilestone, resetAll, prophecyStatus, collectedCount, fulfilledCount]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

export { CANONICAL_JOURNEY, CHRONOLOGICAL_JOURNEY };
