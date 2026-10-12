import React from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  progress: number; // 0..1
  height?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressBar({ progress, height = 6, color, trackColor }: Props) {
  const c = useColors();
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor ?? c.border, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          height: "100%",
          backgroundColor: color ?? c.primary,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", overflow: "hidden" },
});
