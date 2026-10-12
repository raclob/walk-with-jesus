import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getRank } from "@/data/prestige";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";

export default function PrestigeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const progress = useProgress();

  const currentRank = getRank(progress.prestigeLevel);
  const nextRank = getRank(progress.prestigeLevel + 1);

  const ascend = () => {
    progress.prestige();
    router.replace("/");
  };

  const keepExploring = () => {
    progress.declinePrestige();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <View style={[styles.iconWrap, { backgroundColor: c.gold + "30", borderColor: c.gold }]}>
          <Ionicons name="trophy" size={56} color={c.gold} />
        </View>

        <Text style={[styles.kicker, { color: c.gold }]}>YOU HAVE WALKED THE WHOLE STORY</Text>
        <Text style={[styles.headline, { color: c.foreground }]}>
          From Genesis to Revelation. Cover to cover.
        </Text>

        <View style={[styles.statsRow, { backgroundColor: c.cardElevated, borderColor: c.gold + "40" }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: c.gold }]}>{progress.totalRunsCompleted + 1}</Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}>
              {progress.totalRunsCompleted + 1 === 1 ? "Walk" : "Walks"}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: c.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: c.gold }]}>{progress.collectedCount}</Text>
            <Text style={[styles.statLabel, { color: c.mutedForeground }]}>Prophecies</Text>
          </View>
        </View>

        <View style={[styles.rankCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.rankLabel, { color: c.mutedForeground }]}>You ascend from</Text>
          <View style={styles.rankRow}>
            <Text style={[styles.rankCurrent, { color: c.mutedForeground }]}>{currentRank.title}</Text>
            <Ionicons name="arrow-forward" size={20} color={c.gold} />
            <Text style={[styles.rankNext, { color: c.gold }]}>{nextRank.title}</Text>
          </View>
          <Text style={[styles.rankDesc, { color: c.foreground }]}>{nextRank.description}</Text>
        </View>

        <View style={[styles.note, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="information-circle" size={16} color={c.mutedForeground} />
          <Text style={[styles.noteText, { color: c.mutedForeground }]}>
            Your prophecies, heat map, and rank are kept. Chapter progress resets so you can walk the story again with new eyes.
          </Text>
        </View>

        <Pressable
          onPress={ascend}
          style={({ pressed }) => [styles.cta, { backgroundColor: c.gold, opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons name="arrow-up-circle" size={20} color={c.background} />
          <Text style={[styles.ctaText, { color: c.background }]}>Ascend & begin again</Text>
        </Pressable>

        <Pressable
          onPress={keepExploring}
          style={({ pressed }) => [styles.secondary, { borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="footsteps" size={16} color={c.mutedForeground} />
          <Text style={[styles.secondaryText, { color: c.mutedForeground }]}>
            Not yet — keep exploring freely
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 2,
    marginBottom: 28,
  },
  kicker: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 2, textAlign: "center" },
  headline: { fontFamily: "Inter_700Bold", fontSize: 24, textAlign: "center", marginTop: 10, lineHeight: 30 },
  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 28,
    alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 28 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: "stretch" },
  rankCard: { borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth, marginTop: 16, gap: 8 },
  rankLabel: { fontFamily: "Inter_500Medium", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  rankCurrent: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  rankNext: { fontFamily: "Inter_700Bold", fontSize: 20 },
  rankDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  noteText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
  cta: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginTop: 28,
  },
  ctaText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  secondary: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
  },
  secondaryText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
