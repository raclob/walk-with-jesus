import { BOOKS } from "./books";

export type JourneyType = "canonical" | "chronological";

export interface JourneyStop {
  bookId: string;
  chapter: number;
}

function buildJourney(orderKey: "canonicalOrder" | "chronologicalOrder"): JourneyStop[] {
  const ordered = [...BOOKS].sort((a, b) => a[orderKey] - b[orderKey]);
  const stops: JourneyStop[] = [];
  for (const book of ordered) {
    for (let c = 1; c <= book.chapterCount; c++) {
      stops.push({ bookId: book.id, chapter: c });
    }
  }
  return stops;
}

export const CANONICAL_JOURNEY: JourneyStop[] = buildJourney("canonicalOrder");
export const CHRONOLOGICAL_JOURNEY: JourneyStop[] = buildJourney("chronologicalOrder");

export function getJourney(type: JourneyType): JourneyStop[] {
  return type === "canonical" ? CANONICAL_JOURNEY : CHRONOLOGICAL_JOURNEY;
}

export function findStopIndex(type: JourneyType, bookId: string, chapter: number): number {
  const journey = getJourney(type);
  return journey.findIndex((s) => s.bookId === bookId && s.chapter === chapter);
}
