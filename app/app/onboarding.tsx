import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JourneyType } from "@/data/journeys";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";

export default function OnboardingScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const [choice, setChoice] = useState<JourneyType>("canonical");

  const finish = () => {
    progress.completeOnboarding(choice);
    router.replace("/");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 24,
      }}
    >
      <View style={[styles.iconWrap, { backgroundColor: c.gold + "20" }]}>
        <Ionicons name="map" size={36} color={c.gold} />
      </View>
      <Text style={[styles.kicker, { color: c.gold }]}>WELCOME, SEEKER</Text>
      <Text style={[styles.title, { color: c.foreground }]}>The whole story, one chapter at a time.</Text>
      <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
        You will walk through every book of the Bible. Along the way you will discover prophecies and watch them fulfilled centuries later. Choose how you want to begin.
      </Text>

      <View style={{ gap: 12, marginTop: 32 }}>
        <Pressable
          onPress={() => setChoice("canonical")}
          style={[
            styles.choice,
            {
              backgroundColor: c.card,
              borderColor: choice === "canonical" ? c.gold : c.border,
              borderWidth: choice === "canonical" ? 2 : StyleSheet.hairlineWidth,
            },
          ]}
        >
          <View style={styles.choiceHeader}>
            <Ionicons name="book" size={20} color={c.gold} />
            <Text style={[styles.choiceTitle, { color: c.foreground }]}>Canonical</Text>
            {choice === "canonical" ? <Ionicons name="checkmark-circle" size={20} color={c.gold} /> : null}
          </View>
          <Text style={[styles.choiceText, { color: c.mutedForeground }]}>
            Genesis to Revelation, in the order it was bound. The traditional walk through Scripture.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setChoice("chronological")}
          style={[
            styles.choice,
            {
              backgroundColor: c.card,
              borderColor: choice === "chronological" ? c.gold : c.border,
              borderWidth: choice === "chronological" ? 2 : StyleSheet.hairlineWidth,
            },
          ]}
        >
          <View style={styles.choiceHeader}>
            <Ionicons name="time" size={20} color={c.gold} />
            <Text style={[styles.choiceTitle, { color: c.foreground }]}>Chronological</Text>
            {choice === "chronological" ? <Ionicons name="checkmark-circle" size={20} color={c.gold} /> : null}
          </View>
          <Text style={[styles.choiceText, { color: c.mutedForeground }]}>
            Walk events in the order they happened. Job before Genesis, prophets weaving into the kings.
          </Text>
        </Pressable>
      </View>

      <View style={[styles.note, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="information-circle" size={16} color={c.mutedForeground} />
        <Text style={[styles.noteText, { color: c.mutedForeground }]}>
          You can switch journeys anytime. Your reading progress carries over.
        </Text>
      </View>

      <Pressable
        onPress={finish}
        style={({ pressed }) => [styles.cta, { backgroundColor: c.gold, opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={[styles.ctaText, { color: c.background }]}>Begin the journey</Text>
        <Ionicons name="arrow-forward" size={18} color={c.background} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  kicker: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, lineHeight: 34 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22, marginTop: 12 },
  choice: { padding: 16, borderRadius: 14, gap: 8 },
  choiceHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  choiceTitle: { flex: 1, fontFamily: "Inter_700Bold", fontSize: 17 },
  choiceText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 20,
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
});
