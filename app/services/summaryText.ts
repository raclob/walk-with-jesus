import { formatSerialized, type SerializedReference } from "../data/parseReference";

export interface SummaryInput {
  title: string;
  speaker?: string;
  date: string;
  passage?: SerializedReference;
  points: { point: string; answer: string; supplements?: { ref: SerializedReference; note?: string }[] }[];
  supplemental: { ref: SerializedReference; note?: string }[];
  notes?: string;
}

const STOP = new Set("that this with have from they their were what when where which would could should about there into also your then than them these those will been each some only very more most says said through because after before".split(" "));

export function hasSummaryContent(input: SummaryInput): boolean {
  return !!input.notes?.trim() || input.points.some(p => !!(p.point.trim() || p.answer.trim() || p.supplements?.some(s => s.note?.trim()))) || input.supplemental.some(s => !!s.note?.trim());
}

function keySentences(text: string, limit: number): string[] {
  const sentences = (text.match(/[^.!?\n]+(?:[.!?]+|$)/g) ?? []).map(s => s.trim()).filter(Boolean).slice(0, 2000);
  if (sentences.length <= limit) return sentences;
  const words = (s: string) => (s.toLowerCase().match(/[a-z']{4,}/g) ?? []).filter(w => !STOP.has(w));
  const frequency = new Map<string, number>();
  for (const sentence of sentences) for (const word of new Set(words(sentence))) frequency.set(word, (frequency.get(word) ?? 0) + 1);
  const selected = sentences.map((text, index) => ({ text, index, score: words(text).reduce((sum, word) => sum + (frequency.get(word) ?? 0), 0) / Math.max(1, Math.sqrt(words(text).length)) }))
    .sort((a, b) => b.score - a.score || a.index - b.index).slice(0, limit).sort((a, b) => a.index - b.index);
  return selected.map(s => s.text);
}

export function buildOfflineSummary(input: SummaryInput): string {
  if (!hasSummaryContent(input)) throw new Error("Add sermon notes or main points first.");
  const sections: string[] = [];
  const points = input.points.map(p => [p.point.trim(), p.answer.trim()].filter(Boolean).join(" — ")).filter(Boolean);
  if (points.length) sections.push("Main points\n" + points.slice(0, 8).map(p => `• ${p}`).join("\n"));
  const text = [input.notes?.trim(), ...input.points.flatMap(p => p.supplements?.map(s => s.note?.trim()) ?? []), ...input.supplemental.map(s => s.note?.trim())].filter(Boolean).join("\n");
  if (text) sections.push("From your notes\n" + keySentences(text, 4).map(s => `• ${s}`).join("\n"));
  const refs = [input.passage, ...input.supplemental.map(s => s.ref), ...input.points.flatMap(p => p.supplements?.map(s => s.ref) ?? [])].filter((r): r is SerializedReference => !!r);
  if (refs.length) sections.push("Scripture references\n" + [...new Set(refs.map(formatSerialized))].map(r => `• ${r}`).join("\n"));
  return sections.join("\n\n");
}

export function prepareAiNotes(input: SummaryInput): { text: string; truncated: boolean } {
  if (!hasSummaryContent(input)) throw new Error("Add sermon notes or main points first.");
  const points = input.points.map(p => [p.point.trim(), p.answer.trim()].filter(Boolean).join(" — ")).filter(Boolean);
  const refs = [input.passage, ...input.supplemental.map(s => s.ref), ...input.points.flatMap(p => p.supplements?.map(s => s.ref) ?? [])].filter((r): r is SerializedReference => !!r);
  const extra = [...input.supplemental.map(s => s.note?.trim()), ...input.points.flatMap(p => p.supplements?.map(s => s.note?.trim()) ?? [])].filter(Boolean);
  const full = [input.title.trim() ? `Title: ${input.title.trim()}` : "", points.length ? `Main points:\n${points.join("\n")}` : "", input.notes?.trim() ? `Notes:\n${input.notes.trim()}` : "", extra.length ? `Additional notes:\n${extra.join("\n")}` : "", refs.length ? `References: ${[...new Set(refs.map(formatSerialized))].join(", ")}` : ""].filter(Boolean).join("\n\n");
  // Excerpts keep short-context mobile inference practical; the full notes stay saved.
  if (full.length <= 5000) return { text: full, truncated: false };
  const excerpt = [input.title.trim() ? `Title: ${input.title.trim().slice(0, 150)}` : "", buildOfflineSummary(input)].filter(Boolean).join("\n\n");
  return { text: excerpt.slice(0, 5000), truncated: true };
}

export const SUMMARY_SYSTEM_PROMPT = "You are a helpful assistant. Summarize only the supplied notes. Do not add facts, advice, or Bible quotations.";
