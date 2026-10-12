import { BOOKS, type Book } from "@/data/books";
import { parseQuery } from "@/data/searchBible";

export interface BibleReference {
  book: Book;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

/**
 * Parse a passage reference like:
 *   "John 3:16"        → John 3, verse 16
 *   "John 3:16-18"     → John 3, verses 16–18
 *   "John 3"           → John 3, no verse range
 *   "1 Cor 13:4-7"     → 1 Corinthians 13, verses 4–7
 * Returns null if the input cannot be resolved to a valid book/chapter.
 */
export function parseReference(raw: string): BibleReference | null {
  const q = raw.trim();
  if (!q) return null;

  const m = q.match(
    /^((?:[123]\s*)?[A-Za-z][A-Za-z\s.]*?)\s*(\d+)\s*(?::\s*(\d+)(?:\s*-\s*(\d+))?)?\s*$/
  );
  if (!m) {
    // fall back to single-verse parser
    const single = parseQuery(q);
    if (single && single.kind !== "book") {
      return {
        book: single.book,
        chapter: single.chapter,
        verseStart: single.kind === "verse" ? single.verse : undefined,
      };
    }
    return null;
  }

  const bookPart = m[1].trim();
  const chapter = parseInt(m[2], 10);
  const vStart = m[3] ? parseInt(m[3], 10) : undefined;
  const vEnd = m[4] ? parseInt(m[4], 10) : undefined;

  const lookup = parseQuery(`${bookPart} ${chapter}`);
  if (!lookup) return null;
  const book = lookup.book;
  if (chapter < 1 || chapter > book.chapterCount) return null;

  return {
    book,
    chapter,
    verseStart: vStart,
    verseEnd: vEnd != null && vStart != null && vEnd >= vStart ? vEnd : undefined,
  };
}

export function formatReference(ref: BibleReference): string {
  const base = `${ref.book.name} ${ref.chapter}`;
  if (ref.verseStart == null) return base;
  if (ref.verseEnd == null || ref.verseEnd === ref.verseStart) {
    return `${base}:${ref.verseStart}`;
  }
  return `${base}:${ref.verseStart}-${ref.verseEnd}`;
}

export function serializeReference(ref: BibleReference): SerializedReference {
  return {
    bookId: ref.book.id,
    chapter: ref.chapter,
    verseStart: ref.verseStart,
    verseEnd: ref.verseEnd,
  };
}

export interface SerializedReference {
  bookId: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

export function hydrateReference(ref: SerializedReference): BibleReference | null {
  const book = BOOKS.find((b) => b.id === ref.bookId);
  if (!book) return null;
  return {
    book,
    chapter: ref.chapter,
    verseStart: ref.verseStart,
    verseEnd: ref.verseEnd,
  };
}

export function formatSerialized(ref: SerializedReference): string {
  const hydrated = hydrateReference(ref);
  if (!hydrated) return "Unknown passage";
  return formatReference(hydrated);
}
