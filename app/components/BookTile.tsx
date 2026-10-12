import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Book } from "@/data/books";
import { useColors } from "@/hooks/useColors";

interface Props {
  book: Book;
  completed: number;
  heatTotal: number;
  onPress: () => void;
  isCurrent?: boolean;
}

export function BookTile({ book, completed, heatTotal, onPress, isCurrent }: Props) {
  const c = useColors();
  const pct = book.chapterCount > 0 ? completed / book.chapterCount : 0;

  // Heat tint based on cumulative reads (across prestiges)
  // 0 reads -> card color; 1 -> warm; 2+ -> brighter
  const avgHeat = heatTotal / book.chapterCount;
  const heatLevel = Math.min(1, avgHeat / 3);
  const tintAlpha = heatLevel * 0.18;

  const accent = book.testament === "OT" ? c.ot : c.nt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: c.card,
          borderColor: isCurrent ? c.primary : c.border,
          borderWidth: isCurrent ? 1.5 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.gold, opacity: tintAlpha, borderRadius: 12 }]} pointerEvents="none" />
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={[styles.name, { color: c.foreground }]} numberOfLines={1}>
          {book.name}
        </Text>
        {pct >= 1 ? <Ionicons name="checkmark-circle" size={16} color={c.primary} /> : null}
      </View>
      <View style={styles.bar}>
        <View style={[styles.barTrack, { backgroundColor: c.border }]}>
          <View style={[styles.barFill, { backgroundColor: c.primary, width: `${pct * 100}%` }]} />
        </View>
        <Text style={[styles.count, { color: c.mutedForeground }]}>
          {completed}/{book.chapterCount}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    padding: 10,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  name: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bar: { marginTop: 8, gap: 4 },
  barTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2 },
  count: { fontFamily: "Inter_500Medium", fontSize: 10 },
});
