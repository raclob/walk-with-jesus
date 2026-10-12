import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProgress } from "@/contexts/ProgressContext";
import { useSettings, type DailyGoal } from "@/contexts/SettingsContext";
import { useColors } from "@/hooks/useColors";
import type { JourneyType } from "@/data/journeys";

const DAILY_GOALS: { value: DailyGoal; label: string }[] = [
  { value: 1,  label: "1" },
  { value: 2,  label: "2" },
  { value: 3,  label: "3" },
  { value: 5,  label: "5" },
  { value: 7,  label: "7" },
  { value: 10, label: "10" },
];

interface JourneyOption {
  value: JourneyType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const JOURNEY_OPTIONS: JourneyOption[] = [
  {
    value: "canonical",
    title: "Canonical",
    subtitle: "Genesis to Revelation in the traditional Bible order — the most familiar reading path.",
    icon: "book-outline",
  },
  {
    value: "chronological",
    title: "Chronological",
    subtitle: "Books and events arranged in the order they historically occurred.",
    icon: "time-outline",
  },
];

export default function SettingsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const settings = useSettings();

  const handleReset = () => {
    Alert.alert(
      "Reset everything?",
      "This will erase all progress, prestige levels, prophecy collection, and heat map. Your journey will start completely over.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => progress.resetAll() },
      ],
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
      <Text style={[styles.kicker, { color: c.mutedForeground }]}>Preferences</Text>
      <Text style={[styles.title, { color: c.foreground }]}>Settings</Text>

      {/* ── Journey Type ─────────────────────────────────────────── */}
      <Section label="Journey Type" c={c} mt={24}>
        <Text style={[styles.sectionDesc, { color: c.mutedForeground }]}>
          Choose the order in which you walk through the Bible. Switching recalculates your position based on chapters you have already read.
        </Text>
        <View style={{ gap: 10, marginTop: 14 }}>
          {JOURNEY_OPTIONS.map((opt) => {
            const active = progress.journeyType === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => progress.setJourneyType(opt.value)}
                style={({ pressed }) => [
                  styles.journeyCard,
                  {
                    backgroundColor: active ? c.gold + "18" : c.card,
                    borderColor: active ? c.gold : c.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <View style={[styles.journeyIconWrap, { backgroundColor: active ? c.gold + "28" : c.accent }]}>
                  <Ionicons name={opt.icon} size={20} color={active ? c.gold : c.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.journeyTitleRow}>
                    <Text style={[styles.journeyTitle, { color: active ? c.gold : c.foreground }]}>
                      {opt.title}
                    </Text>
                    {active && (
                      <View style={[styles.activeBadge, { backgroundColor: c.gold + "28", borderColor: c.gold + "60" }]}>
                        <Text style={[styles.activeBadgeText, { color: c.gold }]}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.journeySubtitle, { color: c.mutedForeground }]}>
                    {opt.subtitle}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* ── Daily Reading Goal ───────────────────────────────────── */}
      <Section label="Daily Reading Goal" c={c} mt={28}>
        <Text style={[styles.sectionDesc, { color: c.mutedForeground }]}>
          How many chapters you aim to read each day. This is tracked against your reading streak.
        </Text>
        <View style={[styles.goalRow, { marginTop: 14 }]}>
          {DAILY_GOALS.map((g) => {
            const active = settings.dailyGoal === g.value;
            return (
              <Pressable
                key={g.value}
                onPress={() => settings.setDailyGoal(g.value)}
                style={({ pressed }) => [
                  styles.goalChip,
                  {
                    backgroundColor: active ? c.gold : c.card,
                    borderColor: active ? c.gold : c.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.goalChipText, { color: active ? c.background : c.mutedForeground }]}>
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
          <Text style={[styles.goalUnit, { color: c.mutedForeground }]}>ch / day</Text>
        </View>
      </Section>

      {/* ── About ────────────────────────────────────────────────── */}
      <Section label="About" c={c} mt={28}>
        <View style={[styles.aboutCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Row label="App" value="Walk with Jesus" c={c} />
          <Divider c={c} />
          <Row label="Version" value={Constants.expoConfig?.extra?.releaseVersion ?? Constants.expoConfig?.version ?? "Unknown"} c={c} />
          <Divider c={c} />
          <Row label="Prestige level" value={`${progress.prestigeLevel}`} c={c} />
          <Divider c={c} />
          <Row label="Total chapter reads" value={`${Object.values(progress.heatMap).reduce((a, b) => a + b, 0)}`} c={c} />
        </View>
      </Section>

      {/* ── Danger Zone ──────────────────────────────────────────── */}
      <Section label="Danger Zone" c={c} mt={28}>
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.resetBtn,
            { borderColor: c.destructive + "60", opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="refresh" size={16} color={c.destructive} />
          <Text style={[styles.resetText, { color: c.destructive }]}>Reset all progress</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  label,
  children,
  c,
  mt = 24,
}: {
  label: string;
  children: React.ReactNode;
  c: ReturnType<typeof useColors>;
  mt?: number;
}) {
  return (
    <View style={{ marginTop: mt }}>
      <Text style={[styles.sectionLabel, { color: c.gold }]}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  c,
}: {
  label: string;
  value: string;
  c: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.aboutRow}>
      <Text style={[styles.aboutLabel, { color: c.mutedForeground }]}>{label}</Text>
      <Text style={[styles.aboutValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

function Divider({ c }: { c: ReturnType<typeof useColors> }) {
  return <View style={[styles.divider, { backgroundColor: c.border }]} />;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  kicker: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginTop: 2,
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sectionDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },

  // Journey cards
  journeyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  journeyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  journeyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  journeySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  activeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // Daily goal
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  goalChip: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  goalChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  goalUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginLeft: 4,
  },

  // About card
  aboutCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  aboutLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  aboutValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },

  // Reset
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
