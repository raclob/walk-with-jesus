import bible from "./bible.json";

type BibleData = Record<string, string[][]>;

const DATA = bible as BibleData;

export function getChapterVerses(bookId: string, chapter: number): string[] {
  const book = DATA[bookId];
  if (!book) return [];
  const ch = book[chapter - 1];
  return ch ?? [];
}

export function hasChapterText(bookId: string, chapter: number): boolean {
  return getChapterVerses(bookId, chapter).length > 0;
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "into", "shall",
  "will", "have", "hath", "unto", "they", "thee", "thou", "your", "you",
  "are", "was", "were", "but", "his", "him", "her", "she", "all", "not",
  "any", "out", "who", "what", "when", "where", "which", "their", "them",
  "there", "then", "than", "upon", "about", "before", "after", "every",
  "even", "also", "thy", "ye", "be", "is", "of", "to", "in", "on", "as",
  "it", "by", "an", "or", "a", "i", "me", "my", "we", "us", "our",
  "had", "has", "been", "being", "may", "can", "could", "would",
  "should", "did", "does", "do", "done", "shalt", "wilt", "saith",
  "said", "say", "says", "behold", "lo", "yea",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function stemVariants(w: string): string[] {
  const variants = new Set<string>([w]);
  if (w.endsWith("ies")) variants.add(w.slice(0, -3) + "y");
  if (w.endsWith("es") && w.length > 4) variants.add(w.slice(0, -2));
  if (w.endsWith("s") && w.length > 3) variants.add(w.slice(0, -1));
  if (w.endsWith("ed") && w.length > 4) variants.add(w.slice(0, -2));
  if (w.endsWith("ing") && w.length > 5) variants.add(w.slice(0, -3));
  return Array.from(variants);
}

/**
 * Returns the first character index of `keyword` (or any of its stem variants)
 * inside `lowerText` as a [start, end) span. Returns null if not found.
 */
function findKeywordSpan(lowerText: string, keyword: string): [number, number] | null {
  const variants = stemVariants(keyword).sort((a, b) => b.length - a.length);
  for (const v of variants) {
    const re = new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\w*`, "i");
    const m = lowerText.match(re);
    if (m && m.index !== undefined) {
      return [m.index, m.index + m[0].length];
    }
  }
  return null;
}

export interface PhraseMatch {
  /** 0-based verse index in the chapter */
  verseIndex: number;
  /** Character start (inclusive) within the verse string */
  start: number;
  /** Character end (exclusive) within the verse string */
  end: number;
}

/**
 * Locate the best inline span in a chapter that corresponds to a prophecy
 * `phrase`. Uses keyword overlap (with light stemming) to pick the verse, then
 * computes the smallest contiguous span covering the matched keywords.
 *
 * Returns null if no confident match is found.
 */
export function matchPhraseInChapter(verses: string[], phrase: string): PhraseMatch | null {
  const keywords = tokenize(phrase);
  if (keywords.length === 0 || verses.length === 0) return null;
  const unique = Array.from(new Set(keywords));

  let best: { idx: number; spans: [number, number][] } | null = null;
  for (const [i, v] of verses.entries()) {
    const lv = v.toLowerCase();
    const spans: [number, number][] = [];
    for (const k of unique) {
      const span = findKeywordSpan(lv, k);
      if (span) spans.push(span);
    }
    if (!best || spans.length > best.spans.length) {
      best = { idx: i, spans };
    }
  }

  if (!best) return null;
  const threshold = unique.length <= 2
    ? Math.max(1, unique.length - 1)
    : Math.max(2, Math.ceil(unique.length * 0.35));
  if (best.spans.length < threshold) return null;

  const start = Math.min(...best.spans.map((s) => s[0]));
  const end = Math.max(...best.spans.map((s) => s[1]));
  return { verseIndex: best.idx, start, end };
}

/**
 * Locate the inline span for a `phrase` inside an explicitly known verse range
 * `[startVerseIdx, endVerseIdx]` (inclusive, 0-based). Picks the verse with the
 * most keyword hits and returns the smallest covering span. If no keywords
 * match in any verse of the range, falls back to highlighting the entire first
 * verse of the range so the prophecy still glows in the right spot.
 */
export function matchPhraseInVerseRange(
  verses: string[],
  phrase: string,
  startVerseIdx: number,
  endVerseIdx: number,
): PhraseMatch | null {
  if (verses.length === 0) return null;
  const lo = Math.max(0, startVerseIdx);
  const hi = Math.min(verses.length - 1, endVerseIdx);
  if (lo > hi) return null;

  const keywords = Array.from(new Set(tokenize(phrase)));

  let best: { idx: number; spans: [number, number][] } | null = null;
  for (let i = lo; i <= hi; i++) {
    const lv = verses[i].toLowerCase();
    const spans: [number, number][] = [];
    for (const k of keywords) {
      const span = findKeywordSpan(lv, k);
      if (span) spans.push(span);
    }
    if (!best || spans.length > best.spans.length) {
      best = { idx: i, spans };
    }
  }

  if (!best || best.spans.length === 0) {
    return { verseIndex: lo, start: 0, end: verses[lo].length };
  }

  const start = Math.min(...best.spans.map((s) => s[0]));
  const end = Math.max(...best.spans.map((s) => s[1]));
  return { verseIndex: best.idx, start, end };
}
