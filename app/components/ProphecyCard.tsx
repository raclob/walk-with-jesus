import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Prophecy } from "@/data/prophecies";
import { getBook } from "@/data/books";
import { useColors } from "@/hooks/useColors";

export type ProphecyCardStatus = "hidden" | "watching" | "fulfilled";

interface Props {
  prophecy: Prophecy;
  status: ProphecyCardStatus;
  onPress?: () => void;
}

export function ProphecyCard({ prophecy, status, onPress }: Props) {
  const c = useColors();
  const sourceBook = getBook(prophecy.sourceBookId);
  const known = status !== "hidden";
  const accent = status === "fulfilled" ? c.success : c.gold;

  const statusLabel =
    status === "fulfilled" ? "Fulfilled" : status === "watching" ? "Watching & waiting" : "Hidden";
  const iconName: React.ComponentProps<typeof Ionicons>["name"] =
    status === "fulfilled" ? "checkmark-circle" : status === "watching" ? "sparkles" : "lock-closed";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: known ? accent + "60" : c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: known ? accent + "20" : c.border + "60" }]}>
          <Ionicons name={iconName} size={16} color={known ? accent : c.mutedForeground} />
        </View>
        <View style={styles.headerText}>
          <Text
            style={[styles.title, { color: known ? c.foreground : c.mutedForeground }]}
            numberOfLines={known ? 2 : 1}
          >
            {known ? prophecy.title : "??? — Hidden"}
          </Text>
          <Text style={[styles.source, { color: c.mutedForeground }]}>
            {sourceBook?.name} {prophecy.sourceChapter}
            {prophecy.type === "verse" ? "  ·  Verse-level" : "  ·  Whole chapter"}
          </Text>
        </View>
        <View style={[styles.statusPill, { borderColor: known ? accent + "60" : c.border }]}>
          <Text style={[styles.statusText, { color: known ? accent : c.mutedForeground }]}>{statusLabel}</Text>
        </View>
      </View>
      {known ? (
        <Text style={[styles.summary, { color: c.foreground }]} numberOfLines={3}>
          {prophecy.summary}
        </Text>
      ) : (
        <Text style={[styles.summary, { color: c.mutedForeground, fontStyle: "italic" }]} numberOfLines={2}>
          A prophecy waits in {sourceBook?.name} {prophecy.sourceChapter}. {prophecy.type === "verse" ? "Watch for the glowing words." : "It will be revealed when you read this chapter."}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, borderWidth: StyleSheet.hairlineWidth, gap: 10 },
  header: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, gap: 2 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  source: { fontFamily: "Inter_500Medium", fontSize: 11 },
  summary: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 0.5 },
});
