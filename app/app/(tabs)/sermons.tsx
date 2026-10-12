import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatSerialized } from "@/data/parseReference";
import { useSermons } from "@/contexts/SermonContext";
import { useColors } from "@/hooks/useColors";

function formatDate(iso: string): string {
  // iso is YYYY-MM-DD; render in a friendly way without timezone surprises
  const [y, m, d] = iso.split("-").map((p) => parseInt(p, 10));
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SermonsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { sermons, createSermon } = useSermons();

  const sorted = useMemo(
    () => [...sermons].sort((a, b) => b.updatedAt - a.updatedAt),
    [sermons]
  );

  const handleNew = () => {
    const sermon = createSermon();
    router.push(`/sermon/${sermon.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 16,
        }}
      >
        <Text style={[styles.kicker, { color: c.mutedForeground }]}>Take it deeper</Text>
        <Text style={[styles.title, { color: c.foreground }]}>Sermon Mode</Text>
        <Text style={[styles.lede, { color: c.mutedForeground }]}>
          Read along, capture main points, and revisit every supplemental verse.
        </Text>

        {sorted.length === 0 ? (
          <View style={[styles.empty, { borderColor: c.border, backgroundColor: c.card }]}>
            <Ionicons name="mic" size={28} color={c.gold} />
            <Text style={[styles.emptyTitle, { color: c.foreground }]}>
              No sermons logged yet
            </Text>
            <Text style={[styles.emptySub, { color: c.mutedForeground }]}>
              Tap “New sermon” to set the passage, jot the main points, and save the cross-references.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 16 }}>
            {sorted.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/sermon/${s.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: c.foreground }]} numberOfLines={1}>
                    {s.title || "Untitled sermon"}
                  </Text>
                  <Text style={[styles.cardMeta, { color: c.mutedForeground }]} numberOfLines={1}>
                    {[s.speaker, formatDate(s.date)].filter(Boolean).join(" · ")}
                  </Text>
                  {s.passage ? (
                    <View style={[styles.refPill, { borderColor: c.gold + "60", backgroundColor: c.gold + "15" }]}>
                      <Ionicons name="book-outline" size={11} color={c.gold} />
                      <Text style={[styles.refText, { color: c.gold }]} numberOfLines={1}>
                        {formatSerialized(s.passage)}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[styles.cardCounts, { color: c.mutedForeground }]}>
                    {s.points.length} {s.points.length === 1 ? "point" : "points"} ·{" "}
                    {s.supplemental.length} cross-{s.supplemental.length === 1 ? "ref" : "refs"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={c.mutedForeground} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={handleNew}
        style={({ pressed }) => [
          styles.fab,
          {
            bottom: insets.bottom + 90,
            backgroundColor: c.gold,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={20} color={c.background} />
        <Text style={[styles.fabText, { color: c.background }]}>New sermon</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2 },
  lede: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 6 },
  empty: {
    marginTop: 24,
    padding: 22,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 4 },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 18 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  cardMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  cardCounts: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 6, letterSpacing: 0.3 },
  refPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 6,
  },
  refText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  fab: {
    position: "absolute",
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { fontFamily: "Inter_700Bold", fontSize: 13 },
});
