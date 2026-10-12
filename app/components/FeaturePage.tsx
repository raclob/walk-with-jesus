import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export function FeaturePage({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 36, gap: 20 }}>
    <View style={{ gap: 8 }}>
      <Text style={[featureStyles.title, { color: c.foreground }]}>{title}</Text>
      <Text style={[featureStyles.body, { color: c.mutedForeground }]}>{subtitle}</Text>
    </View>
    {children}
  </ScrollView>;
}

export function FeatureCard({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 18, gap: 12 }}>{children}</View>;
}

export function FeatureButton({ label, onPress, disabled = false, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  const c = useColors();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ paddingVertical: 15, paddingHorizontal: 18, minHeight: 48, borderRadius: 12, borderWidth: 1,
      backgroundColor: secondary ? c.card : c.primary, borderColor: secondary ? c.border : c.primary, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 })}>
    <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, textAlign: "center", color: secondary ? c.foreground : c.primaryForeground }}>{label}</Text>
  </Pressable>;
}

export const featureStyles = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  heading: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  body: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  small: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
});
