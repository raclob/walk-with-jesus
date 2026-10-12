import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProgressBar } from "@/components/ProgressBar";
import { getBook } from "@/data/books";
import { JourneyType, getJourney } from "@/data/journeys";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";

export default function JourneyScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const progress = useProgress();

  const journey = getJourney(progress.journeyType);
  const idx = Math.min(progress.journeyIndex, journey.length - 1);
  const current = journey[idx];
  const upcoming = useMemo(() => journey.slice(idx, Math.min(journey.length, idx + 8)), [journey, idx]);
  const recent = useMemo(() => journey.slice(Math.max(0, idx - 5), idx).reverse(), [journey, idx]);

  const totalPct = idx / Math.max(1, journey.length);

  const switchType = (t: JourneyType) => {
    progress.setJourneyType(t);
  };

  const currentBook = getBook(current.bookId);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 16,
      }}
    >
      <Text style={[styles.kicker, { color: c.mutedForeground }]}>The Journey</Text>
      <Text style={[styles.title, { color: c.foreground }]}>
        {progress.journeyType === "canonical" ? "Canonical Path" : "Chronological Path"}
      </Text>

      {/* Journey toggle */}
      <View style={[styles.toggle, { backgroundColor: c.card, borderColor: c.border }]}>
        <Pressable
          onPress={() => switchType("canonical")}
          style={[
            styles.toggleBtn,
            progress.journeyType === "canonical" && { backgroundColor: c.gold + "30" },
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              { color: progress.journeyType === "canonical" ? c.gold : c.mutedForeground },
            ]}
          >
            Canonical
          </Text>
        </Pressable>
        <Pressable
          onPress={() => switchType("chronological")}
          style={[
            styles.toggleBtn,
            progress.journeyType === "chronological" && { backgroundColor: c.gold + "30" },
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              { color: progress.journeyType === "chronological" ? c.gold : c.mutedForeground },
            ]}
          >
            Chronological
          </Text>
        </Pressable>
      </View>

      {/* Hero — current chapter */}
      <Pressable
        onPress={() => router.push(`/chapter/${current.bookId}/${current.chapter}`)}
        style={({ pressed }) => [
          styles.hero,
          { backgroundColor: c.cardElevated, borderColor: c.gold + "60", opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={[styles.heroLabel, { color: c.gold }]}>NEXT STEP</Text>
        <Text style={[styles.heroTitle, { color: c.foreground }]}>
          {currentBook?.name} · Chapter {current.chapter}
        </Text>
        <Text style={[styles.heroBlurb, { color: c.mutedForeground }]} numberOfLines={3}>
          {currentBook?.context}
        </Text>
        <View style={styles.heroFooter}>
          <Text style={[styles.heroCta, { color: c.gold }]}>Begin</Text>
          <Ionicons name="arrow-forward" size={16} color={c.gold} />
        </View>
      </Pressable>

      {/* Overall journey progress */}
      <View style={{ marginTop: 24, marginBottom: 8 }}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: c.mutedForeground }]}>Overall journey</Text>
          <Text style={[styles.progressValue, { color: c.foreground }]}>
            {idx} / {journey.length}
          </Text>
        </View>
        <ProgressBar progress={totalPct} />
      </View>

      {/* Upcoming */}
      <Text style={[styles.sectionTitle, { color: c.foreground }]}>Coming up</Text>
      <View style={{ gap: 6 }}>
        {upcoming.slice(1).map((stop, i) => {
          const book = getBook(stop.bookId);
          const completed = progress.isChapterRead(stop.bookId, stop.chapter);
          return (
            <Pressable
              key={`${stop.bookId}-${stop.chapter}`}
              onPress={() => router.push(`/chapter/${stop.bookId}/${stop.chapter}`)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.rowIndex, { color: c.mutedForeground }]}>+{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: c.foreground }]}>{book?.name}</Text>
                <Text style={[styles.rowSub, { color: c.mutedForeground }]}>Chapter {stop.chapter}</Text>
              </View>
              {completed ? <Ionicons name="checkmark" size={16} color={c.success} /> : null}
            </Pressable>
          );
        })}
      </View>

      {recent.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: c.foreground, marginTop: 24 }]}>Just read</Text>
          <View style={{ gap: 6 }}>
            {recent.map((stop) => {
              const book = getBook(stop.bookId);
              return (
                <View
                  key={`r-${stop.bookId}-${stop.chapter}`}
                  style={[styles.row, { backgroundColor: c.card, borderColor: c.border, opacity: 0.7 }]}
                >
                  <Ionicons name="checkmark-circle" size={18} color={c.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: c.foreground }]}>{book?.name}</Text>
                    <Text style={[styles.rowSub, { color: c.mutedForeground }]}>Chapter {stop.chapter}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2, marginBottom: 16 },
  toggle: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  toggleText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  hero: { borderRadius: 16, padding: 18, borderWidth: 1, gap: 8 },
  heroLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1.4 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  heroBlurb: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  heroFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  heroCta: { fontFamily: "Inter_700Bold", fontSize: 14 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  progressValue: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 16, marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowIndex: { fontFamily: "Inter_700Bold", fontSize: 12, width: 26, textAlign: "center" },
  rowTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  rowSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
});
