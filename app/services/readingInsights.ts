import { BOOKS } from "@/data/books";

export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function recordReadingDay(days: Record<string, number>, day: string): Record<string, number> {
  return { ...days, [day]: (days[day] ?? 0) + 1 };
}

export function readingInsights(days: Record<string, number>, heatMap: Record<string, number>, now = new Date()) {
  // Calendar arithmetic avoids fixed 24-hour assumptions across DST changes.
  const recent = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    date.setDate(date.getDate() - (29 - index));
    const key = localDayKey(date);
    return { key, label: date.toLocaleDateString(undefined, { weekday: "short" }), count: Math.max(0, days[key] ?? 0) };
  });
  const week = recent.slice(-7);
  const total = recent.reduce((sum, day) => sum + day.count, 0);
  const activeDays = recent.filter(day => day.count > 0).length;
  const books = BOOKS.map(book => {
    let reads = 0;
    for (let chapter = 1; chapter <= book.chapterCount; chapter++) reads += Math.max(0, heatMap[`${book.id}:${chapter}`] ?? 0);
    return { id: book.id, name: book.name, testament: book.testament, reads };
  }).filter(book => book.reads > 0).sort((a, b) => b.reads - a.reads);
  const ot = books.filter(book => book.testament === "OT").reduce((sum, book) => sum + book.reads, 0);
  const nt = books.filter(book => book.testament === "NT").reduce((sum, book) => sum + book.reads, 0);
  return { week, total, activeDays, average: activeDays ? total / activeDays : 0, books, ot, nt };
}

export function sampleReadingDays(now = new Date()): Record<string, number> {
  const sample: Record<string, number> = {};
  [2, 1, 0, 3, 2, 0, 1].forEach((count, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    date.setDate(date.getDate() - (6 - index));
    sample[localDayKey(date)] = count;
  });
  return sample;
}
