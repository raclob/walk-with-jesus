import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getRank } from "@/data/prestige";
import { useColors } from "@/hooks/useColors";

interface Props {
  level: number;
  compact?: boolean;
}

export function PrestigeBadge({ level, compact }: Props) {
  const c = useColors();
  const rank = getRank(level);

  if (compact) {
    return (
      <View style={[styles.compact, { backgroundColor: c.gold + "20", borderColor: c.gold + "60" }]}>
        <Ionicons name="ribbon" size={12} color={c.gold} />
        <Text style={[styles.compactText, { color: c.gold }]}>{rank.title}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: c.cardElevated, borderColor: c.gold + "60" }]}>
      <Ionicons name="ribbon" size={20} color={c.gold} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: c.gold }]}>{rank.title}</Text>
        <Text style={[styles.desc, { color: c.mutedForeground }]} numberOfLines={2}>
          {rank.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 15 },
  desc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 16 },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  compactText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
});
