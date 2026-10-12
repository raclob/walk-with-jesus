import AsyncStorage from "@react-native-async-storage/async-storage";

import { getBook } from "@/data/books";
import { getTranslation } from "@/data/translations";

export interface Verse {
  verse: number;
  text: string;
}

export interface ChapterText {
  reference: string;
  translation: string;
  verses: Verse[];
}

interface ApiResponse {
  reference: string;
  verses: { book_id: string; book_name: string; chapter: number; verse: number; text: string }[];
  translation_id: string;
  translation_name: string;
}

const CACHE_PREFIX = "@bibleexplorer/chapter.v2:";

function cacheKey(translationId: string, bookId: string, chapter: number) {
  return `${CACHE_PREFIX}${translationId}:${bookId}:${chapter}`;
}

const memoryCache = new Map<string, ChapterText>();

export async function fetchChapterText(
  translationId: string,
  bookId: string,
  chapter: number,
): Promise<ChapterText> {
  const t = getTranslation(translationId);
  if (t.source !== "bible-api" || !t.apiCode) {
    throw new Error(`Translation ${translationId} is not available via the public API.`);
  }
  const book = getBook(bookId);
  if (book && t.availableTestaments && !t.availableTestaments.includes(book.testament)) {
    throw new Error(`${t.name} is available for the New Testament only. Choose another translation to read ${book.name}.`);
  }

  const key = cacheKey(t.id, bookId, chapter);
  const memHit = memoryCache.get(key);
  if (memHit) return memHit;

  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached) as ChapterText;
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // ignore cache read errors
  }

  const url = `https://bible-api.com/${encodeURIComponent(bookId)}+${chapter}?translation=${t.apiCode}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${bookId} ${chapter} (${t.abbreviation})`);
  }
  const data = (await res.json()) as ApiResponse;
  const result: ChapterText = {
    reference: data.reference,
    translation: data.translation_name ?? t.name,
    verses: data.verses.map((v) => ({
      verse: v.verse,
      text: v.text.replace(/\s+/g, " ").trim(),
    })),
  };

  memoryCache.set(key, result);
  AsyncStorage.setItem(key, JSON.stringify(result)).catch(() => {});

  return result;
}
