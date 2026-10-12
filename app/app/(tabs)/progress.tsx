import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HeatMap } from "@/components/HeatMap";
import { PrestigeBadge } from "@/components/PrestigeBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { BOOKS, TOTAL_CHAPTERS } from "@/data/books";
import { PROPHECIES } from "@/data/prophecies";
import { getRank } from "@/data/prestige";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";

export default function ProgressScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const progress = useProgress();

  const totals = progress.totalProgress();
  const collectedCount = progress.collectedCount;
  const fulfilledCount = progress.fulfilledCount;
  const heatTotal = useMemo(
    () => Object.values(progress.heatMap).reduce((a, b) => a + b, 0),
    [progress.heatMap]
  );

  // Find hottest chapters
  const hottest = useMemo(() => {
    const entries = Object.entries(progress.heatMap)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    return entries.map(([key, count]) => {
      const [bookId, chapterStr] = key.split(":");
      const book = BOOKS.find((b) => b.id === bookId);
      return { book, chapter: parseInt(chapterStr, 10), count };
    });
  }, [progress.heatMap]);

  const nextRank = getRank(progress.prestigeLevel + 1);

  const handleReset = () => {
    Alert.alert(
      "Reset everything?",
      "This will erase all progress, prestige levels, prophecy collection, heat map, and reading history. Your journey will start completely over.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => progress.resetAll() },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 16,
      }}
    >
      <Text style={[styles.kicker, { color: c.mutedForeground }]}>Your Story</Text>
      <Text style={[styles.title, { color: c.foreground }]}>Progress</Text>

      <PrestigeBadge level={progress.prestigeLevel} />

      <View style={[styles.statsCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.statRow}>
          <Stat label="This run" value={`${totals.completed} / ${TOTAL_CHAPTERS}`} c={c} />
          <Stat label="Discovered" value={`${collectedCount} / ${PROPHECIES.length}`} c={c} />
        </View>
        <ProgressBar progress={totals.completed / TOTAL_CHAPTERS} />
        <View style={[styles.statRow, { marginTop: 14 }]}>
          <Stat label="Fulfilled" value={`${fulfilledCount} / ${PROPHECIES.length}`} c={c} />
          <Stat label="Day streak" value={`${progress.readingStreak.count}`} c={c} />
        </View>
        <View style={[styles.statRow, { marginTop: 14 }]}>
          <Stat label="Total chapters read" value={`${heatTotal}`} c={c} />
          <Stat label="Runs completed" value={`${progress.totalRunsCompleted}`} c={c} />
        </View>
      </View>

      <HeatMap />

      <Pressable accessibilityRole="button" onPress={() => router.push("/insights")}
        style={{ marginTop: 20, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name="bar-chart-outline" size={22} color={c.gold} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: c.foreground }}>Personal reading insights</Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: c.mutedForeground }}>Explore the optional Premium charts</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.mutedForeground} />
      </Pressable>

      {/* Milestone history */}
      {progress.milestoneHistory.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>Books finished</Text>
          <Text style={[styles.sectionSub, { color: c.mutedForeground }]}>
            Every book you have closed (across all runs).
          </Text>
          <View style={styles.historyWrap}>
            {progress.milestoneHistory.slice(-12).reverse().map((bookId, i) => {
              const book = BOOKS.find((b) => b.id === bookId);
              if (!book) return null;
              return (
                <View key={`${bookId}-${i}`} style={[styles.historyChip, { backgroundColor: c.card, borderColor: book.testament === "OT" ? c.ot + "60" : c.nt + "60" }]}>
                  <Text style={[styles.historyText, { color: c.foreground }]}>{book.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Next rank */}
      <View style={[styles.nextRank, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="trending-up" size={20} color={c.gold} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.nextLabel, { color: c.mutedForeground }]}>NEXT RANK</Text>
          <Text style={[styles.nextTitle, { color: c.foreground }]}>{nextRank.title}</Text>
          <Text style={[styles.nextDesc, { color: c.mutedForeground }]} numberOfLines={2}>
            Complete the whole Bible to ascend.
          </Text>
        </View>
      </View>

      {/* Most-read chapters */}
      {hottest.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>Most-walked chapters</Text>
          <Text style={[styles.sectionSub, { color: c.mutedForeground }]}>
            The places you keep coming back to (across all runs).
          </Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {hottest.map((h, i) => (
              <View
                key={i}
                style={[styles.hotRow, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hotName, { color: c.foreground }]}>
                    {h.book?.name} · Chapter {h.chapter}
                  </Text>
                </View>
                <View style={[styles.heatBadge, { backgroundColor: c.gold + "30", borderColor: c.gold + "60" }]}>
                  <Ionicons name="flame" size={12} color={c.gold} />
                  <Text style={[styles.heatText, { color: c.gold }]}>{h.count}×</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={handleReset}
        style={({ pressed }) => [
          styles.reset,
          { borderColor: c.destructive + "60", opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Ionicons name="refresh" size={14} color={c.destructive} />
        <Text style={[styles.resetText, { color: c.destructive }]}>Reset all progress</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value, c }: { label: string; value: string; c: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.statLabel, { color: c.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2, marginBottom: 16 },
  statsCard: { borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth, marginTop: 16, gap: 12 },
  statRow: { flexDirection: "row", gap: 12 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 4 },
  nextRank: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
    alignItems: "center",
  },
  nextLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 1 },
  nextTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 2 },
  nextDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  hotRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  hotName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  heatBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  heatText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  reset: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 28,
  },
  resetText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  historyWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  historyChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  historyText: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
