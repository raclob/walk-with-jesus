import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FeatureButton, FeatureCard, FeaturePage, featureStyles as styles } from "@/components/FeaturePage";
import { THEMES, getTheme, type ThemeId } from "@/data/themes";
import { usePremium } from "@/contexts/PremiumContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function AppearanceScreen() {
  const c = useColors();
  const { premium } = usePremium();
  const { theme, selectTheme } = useTheme();
  const [previewId, setPreviewId] = useState<ThemeId>(theme.id);
  const preview = getTheme(previewId);
  const p = preview.palette;
  const locked = preview.premium && !premium;
  return <FeaturePage title="Make it your own" subtitle="Two themes are free. Preview every Premium theme before you decide.">
    <View style={{ gap: 10 }}>
      {THEMES.map(item => <Pressable key={item.id} onPress={() => setPreviewId(item.id)} accessibilityRole="button"
        accessibilityLabel={`Preview ${item.name}, ${item.premium ? "Premium" : "free"}`} accessibilityState={{ selected: previewId === item.id }}
        style={{ padding: 15, borderRadius: 14, borderWidth: 2, borderColor: previewId === item.id ? c.gold : c.border, backgroundColor: c.card, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 3 }}>
          {[item.palette.background, item.palette.cardElevated, item.palette.gold].map((color, index) => <View key={index} style={{ width: 14, height: 34, borderRadius: 5, backgroundColor: color, borderWidth: 1, borderColor: c.border }} />)}
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: c.foreground }}>{item.name}{theme.id === item.id ? " · Active" : ""}</Text>
          <Text style={[styles.small, { color: c.mutedForeground }]}>{item.description}</Text>
        </View>
        <Ionicons name={item.premium && !premium ? "lock-closed-outline" : previewId === item.id ? "checkmark-circle" : "ellipse-outline"} size={20} color={c.gold} />
      </Pressable>)}
    </View>
    <View style={{ padding: 20, borderRadius: 18, backgroundColor: p.background, borderWidth: 1, borderColor: p.border, gap: 14 }}>
      <Text style={[styles.small, { color: p.gold }]}>{preview.name.toUpperCase()} · PREVIEW</Text>
      <Text style={{ fontFamily: "CormorantGaramond_500Medium", fontSize: 28, color: p.foreground }}>A moment of peace</Text>
      <View style={{ backgroundColor: p.card, borderRadius: 12, padding: 18, gap: 8 }}>
        <Text style={[styles.small, { color: p.gold }]}>PSALM 23:1 · KJV</Text>
        <Text style={{ fontFamily: "CormorantGaramond_400Regular", fontSize: 24, lineHeight: 32, color: p.cardForeground }}>The LORD is my shepherd; I shall not want.</Text>
        <Text style={[styles.small, { color: p.mutedForeground }]}>Your reading, in your favorite colors.</Text>
      </View>
    </View>
    <FeatureButton label={locked ? "Explore Premium" : theme.id === preview.id ? "Theme applied" : `Apply ${preview.name}`}
      disabled={!locked && theme.id === preview.id}
      onPress={() => locked ? router.push("/premium") : selectTheme(preview.id)} />
    <FeatureCard><Text style={[styles.small, { color: c.mutedForeground }]}>Premium changes the app’s appearance. Bible reading, chapter text settings, notes, and free summaries remain available to everyone.</Text></FeatureCard>
  </FeaturePage>;
}
