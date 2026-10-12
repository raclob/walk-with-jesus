import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BOOKS, type Genre } from "@/data/books";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";

// ── Section definitions ──────────────────────────────────────────────────────

const PAUL_IDS = new Set([
  "romans", "1corinthians", "2corinthians", "galatians", "ephesians",
  "philippians", "colossians", "1thessalonians", "2thessalonians",
  "1timothy", "2timothy", "titus", "philemon",
]);

interface SectionDef {
  short: string;
  label: string;
  testament: "OT" | "NT";
  genres: Genre[];
  filter?: (id: string) => boolean;
}

const SECTIONS: SectionDef[] = [
  { short: "LAW",   label: "Law",            testament: "OT", genres: ["Law"] },
  { short: "HIST",  label: "History",        testament: "OT", genres: ["History"] },
  { short: "POET",  label: "Poetry",         testament: "OT", genres: ["Wisdom"] },
  { short: "MAJ",   label: "Major Prophets", testament: "OT", genres: ["Major Prophets"] },
  { short: "MIN",   label: "Minor Prophets", testament: "OT", genres: ["Minor Prophets"] },
  { short: "GOSP",  label: "Gospels & Acts", testament: "NT", genres: ["Gospel", "Acts"] },
  { short: "PAUL",  label: "Paul's Letters", testament: "NT", genres: ["Epistle"], filter: (id) => PAUL_IDS.has(id) },
  { short: "LET",   label: "Letters",        testament: "NT", genres: ["Epistle"], filter: (id) => !PAUL_IDS.has(id) },
  { short: "REV",   label: "Revelation",     testament: "NT", genres: ["Apocalypse"] },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function bookIntensity(
  bookId: string,
  chapterCount: number,
  heatMap: Record<string, number>,
  maxAvg: number,
): number {
  let total = 0;
  for (let ch = 1; ch <= chapterCount; ch++) {
    total += heatMap[`${bookId}:${ch}`] ?? 0;
  }
  const avg = total / chapterCount;
  if (avg <= 0 || maxAvg <= 0) return 0;
  return Math.min(1, Math.log(1 + avg) / Math.log(1 + maxAvg));
}

// ── Component ────────────────────────────────────────────────────────────────

export function HeatMap() {
  const c = useColors();
  const progress = useProgress();

  // Pre-compute the max avg reads/chapter across all books for normalisation
  const maxAvg = useMemo(() => {
    let max = 0;
    for (const book of BOOKS) {
      let total = 0;
      for (let ch = 1; ch <= book.chapterCount; ch++) {
        total += progress.heatMap[`${book.id}:${ch}`] ?? 0;
      }
      const avg = total / book.chapterCount;
      if (avg > max) max = avg;
    }
    return max;
  }, [progress.heatMap]);

  const totalReads = useMemo(
    () => Object.values(progress.heatMap).reduce((a, b) => a + b, 0),
    [progress.heatMap],
  );

  function swatch(level: number): string {
    if (level <= 0) return c.border + "50";
    const alpha = Math.round(55 + 200 * level).toString(16).padStart(2, "0");
    return c.gold + alpha;
  }

  const sections = useMemo(
    () =>
      SECTIONS.map((def) => ({
        ...def,
        books: BOOKS.filter(
          (b) =>
            (def.genres as string[]).includes(b.genre) &&
            (def.filter ? def.filter(b.id) : true),
        ),
      })),
    [],
  );

  const legendLevels = [0, 0.3, 0.6, 1];

  let lastTestament: "OT" | "NT" | null = null;

  return (
    <View style={{ marginTop: 24 }}>
      {/* Header */}
      <Text style={[styles.title, { color: c.foreground }]}>Reading Heat Map</Text>
      <Text style={[styles.sub, { color: c.mutedForeground }]}>
        {totalReads === 0
          ? "Each book lights up as you read its chapters. Tap to open."
          : `${totalReads} chapter reads · block width = chapter count`}
      </Text>

      <View style={[styles.grid, { backgroundColor: c.card, borderColor: c.border }]}>
        {sections.map((section) => {
          const showDivider = section.testament !== lastTestament;
          if (showDivider) lastTestament = section.testament;

          return (
            <React.Fragment key={section.short}>
              {showDivider && (
                <View style={styles.testamentRow}>
                  <View style={[styles.testamentLine, { backgroundColor: section.testament === "OT" ? c.ot : c.nt }]} />
                  <Text style={[styles.testamentLabel, { color: section.testament === "OT" ? c.ot : c.nt }]}>
                    {section.testament === "OT" ? "OLD TESTAMENT" : "NEW TESTAMENT"}
                  </Text>
                  <View style={[styles.testamentLine, { backgroundColor: section.testament === "OT" ? c.ot : c.nt }]} />
                </View>
              )}

              <View style={styles.sectionRow}>
                {/* Section label */}
                <Text
                  style={[styles.sectionLabel, { color: c.mutedForeground }]}
                  numberOfLines={1}
                >
                  {section.short}
                </Text>

                {/* Book blocks */}
                <View style={styles.blocks}>
                  {section.books.map((book) => {
                    const lv = bookIntensity(book.id, book.chapterCount, progress.heatMap, maxAvg);
                    const flexVal = Math.max(book.chapterCount, 5);
                    const showAbbr = book.chapterCount >= 5;
                    return (
                      <Pressable
                        key={book.id}
                        onPress={() => router.push(`/chapter/${book.id}/1`)}
                        style={({ pressed }) => ({
                          flex: flexVal,
                          height: 26,
                          backgroundColor: swatch(lv),
                          borderRadius: 3,
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: pressed ? 0.6 : 1,
                        })}
                      >
                        {showAbbr && (
                          <Text
                            style={[
                              styles.bookAbbr,
                              { color: lv > 0.4 ? "#070B14" : c.mutedForeground },
                            ]}
                            numberOfLines={1}
                          >
                            {book.abbreviation}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: c.mutedForeground }]}>Unread</Text>
        <View style={styles.legendSwatch}>
          {legendLevels.map((lv) => (
            <View
              key={lv}
              style={[styles.legendCell, { backgroundColor: swatch(lv) }]}
            />
          ))}
        </View>
        <Text style={[styles.legendLabel, { color: c.mutedForeground }]}>Most read</Text>
      </View>
    </View>
  );
}

const LABEL_W = 36;

const styles = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 16 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2, marginBottom: 12 },
  grid: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    gap: 4,
  },
  testamentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 2,
  },
  testamentLine: { flex: 1, height: StyleSheet.hairlineWidth },
  testamentLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.5,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    width: LABEL_W,
    fontFamily: "Inter_500Medium",
    fontSize: 8,
    letterSpacing: 0.8,
    textAlign: "right",
  },
  blocks: {
    flex: 1,
    flexDirection: "row",
    gap: 2,
  },
  bookAbbr: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.3,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    justifyContent: "flex-end",
  },
  legendLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
  legendSwatch: { flexDirection: "row", gap: 2 },
  legendCell: { width: 14, height: 14, borderRadius: 2 },
});
