import { BOOKS, type Book } from "@/data/books";

export type SearchResult =
  | { kind: "book"; book: Book }
  | { kind: "chapter"; book: Book; chapter: number }
  | { kind: "verse"; book: Book; chapter: number; verse: number };

const BOOK_ALIASES: Record<string, string> = {
  // Common short forms users might type
  ps: "psalms",
  psalm: "psalms",
  song: "songofsongs",
  songs: "songofsongs",
  ssol: "songofsongs",
  sos: "songofsongs",
  songofsolomon: "songofsongs",
  rev: "revelation",
  apocalypse: "revelation",
  matt: "matthew",
  mk: "mark",
  lk: "luke",
  jn: "john",
  jhn: "john",
  jas: "james",
  jud: "jude",
  phil: "philippians",
  philem: "philemon",
  heb: "hebrews",
  cor: "corinthians",
  thess: "thessalonians",
  thes: "thessalonians",
  tim: "timothy",
  pet: "peter",
  gen: "genesis",
  exo: "exodus",
  exod: "exodus",
  lev: "leviticus",
  num: "numbers",
  deut: "deuteronomy",
  jos: "joshua",
  jdg: "judges",
  jud2: "judges",
  ru: "ruth",
  sam: "samuel",
  ki: "kings",
  kg: "kings",
  kgs: "kings",
  chr: "chronicles",
  chron: "chronicles",
  neh: "nehemiah",
  est: "esther",
  prov: "proverbs",
  ecc: "ecclesiastes",
  eccl: "ecclesiastes",
  isa: "isaiah",
  jer: "jeremiah",
  lam: "lamentations",
  ezek: "ezekiel",
  dan: "daniel",
  hos: "hosea",
  obad: "obadiah",
  jon: "jonah",
  mic: "micah",
  nah: "nahum",
  hab: "habakkuk",
  zeph: "zephaniah",
  hag: "haggai",
  zech: "zechariah",
  mal: "malachi",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function resolveBookToken(token: string): Book | null {
  const norm = normalize(token);
  if (!norm) return null;
  const aliasTarget = BOOK_ALIASES[norm];
  // 1. exact id match (or alias)
  if (aliasTarget) {
    const direct = BOOKS.find((b) => b.id === aliasTarget);
    if (direct) return direct;
  }
  // 2. exact id match
  const idMatch = BOOKS.find((b) => b.id === norm);
  if (idMatch) return idMatch;
  // 3. exact name match
  const nameMatch = BOOKS.find((b) => normalize(b.name) === norm);
  if (nameMatch) return nameMatch;
  // 4. abbreviation match
  const abbrMatch = BOOKS.find((b) => normalize(b.abbreviation) === norm);
  if (abbrMatch) return abbrMatch;
  // 5. prefix match on name
  const prefix = BOOKS.filter((b) => normalize(b.name).startsWith(norm));
  if (prefix.length === 1) return prefix[0];
  // 6. contains match — only if unique
  const contains = BOOKS.filter((b) => normalize(b.name).includes(norm));
  if (contains.length === 1) return contains[0];
  return null;
}

/**
 * Parse a query like:
 *   "John 3:16"   → verse
 *   "John 3"      → chapter
 *   "John"        → book
 *   "1 John 2:5"  → verse
 *   "ps 23"       → chapter
 * Falls back to suggestion list when ambiguous.
 */
export function parseQuery(raw: string): SearchResult | null {
  const q = raw.trim();
  if (!q) return null;

  // Match optional leading number (1/2/3), book words, then chapter[:verse]
  const m = q.match(/^((?:[123]\s*)?[A-Za-z][A-Za-z\s.]*?)\s*(\d+)?\s*(?::\s*(\d+))?\s*$/);
  if (!m) return null;
  const bookPart = m[1].trim();
  const chapter = m[2] ? parseInt(m[2], 10) : null;
  const verse = m[3] ? parseInt(m[3], 10) : null;

  const book = resolveBookToken(bookPart);
  if (!book) return null;

  if (chapter == null) return { kind: "book", book };
  if (chapter < 1 || chapter > book.chapterCount) return { kind: "book", book };
  if (verse != null && verse > 0) {
    return { kind: "verse", book, chapter, verse };
  }
  return { kind: "chapter", book, chapter };
}

/**
 * Suggestions for the autocomplete list. Always returns books whose name
 * starts with or contains the query, plus a parsed result if any.
 */
export function suggestions(raw: string, max = 8): SearchResult[] {
  const q = raw.trim();
  if (!q) return [];
  const parsed = parseQuery(q);
  const results: SearchResult[] = [];
  if (parsed) results.push(parsed);

  const norm = normalize(q.replace(/\s*\d.*$/, ""));
  if (norm) {
    const seen = new Set(results.map((r) => r.book.id + ":B"));
    const matches = BOOKS.filter((b) => {
      const n = normalize(b.name);
      return n.startsWith(norm) || n.includes(norm);
    }).sort((a, b) => {
      const an = normalize(a.name);
      const bn = normalize(b.name);
      const ap = an.startsWith(norm) ? 0 : 1;
      const bp = bn.startsWith(norm) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.canonicalOrder - b.canonicalOrder;
    });
    for (const b of matches) {
      const key = b.id + ":B";
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ kind: "book", book: b });
      if (results.length >= max) break;
    }
  }
  return results.slice(0, max);
}
