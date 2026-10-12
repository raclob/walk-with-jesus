import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { FeatureButton, FeatureCard, FeaturePage, featureStyles as styles } from "@/components/FeaturePage";
import { usePremium } from "@/contexts/PremiumContext";
import { useColors } from "@/hooks/useColors";

export default function PremiumScreen() {
  const c = useColors();
  const billing = usePremium();
  const waiting = billing.busy || billing.loading;
  return <FeaturePage title={billing.premium ? "Your Premium extras" : "Support your daily walk"}
    subtitle="An optional, one-time upgrade for extra colors and a closer look at your reading habits.">
    <FeatureCard>
      <Ionicons name="sparkles-outline" size={30} color={c.gold} />
      <Text style={[styles.heading, { color: c.foreground }]}>{billing.premium ? "Premium is unlocked" : "Walk with Jesus Premium"}</Text>
      <Text style={[styles.body, { color: c.foreground }]}>Three exclusive themes: Still Forest, Quiet Waters, and Evening Plum.</Text>
      <Text style={[styles.body, { color: c.foreground }]}>Personal reading insights: weekly patterns, a 30-day overview, and your most-read books and testaments.</Text>
      <Text style={[styles.small, { color: c.mutedForeground }]}>One purchase. No recurring subscription. Your reading insights stay on your device.</Text>
      <FeatureButton label="Preview themes" secondary onPress={() => router.push("/appearance")} />
      <FeatureButton label={billing.premium ? "View my insights" : "Preview reading insights"} secondary onPress={() => router.push("/insights")} />
    </FeatureCard>
    {!billing.premium && <View style={{ gap: 12 }}>
      <FeatureButton label={billing.busy ? "Waiting for the store…" : billing.loading ? "Checking the store…"
        : !billing.configured ? "Premium purchases coming soon" : billing.price ? `Unlock Premium · ${billing.price}` : "Premium currently unavailable"}
        disabled={!billing.configured || !billing.price || waiting} onPress={() => void billing.purchase()} />
      {!billing.configured && <Text style={[styles.body, { color: c.mutedForeground }]}>You can preview the extras now. This version does not take payments.</Text>}
    </View>}
    {billing.configured && <View style={{ gap: 12 }}>
      <FeatureButton label="Restore purchases" secondary disabled={waiting} onPress={() => void billing.restore()} />
      {!billing.price && !billing.premium && <FeatureButton label="Try the store again" secondary disabled={waiting} onPress={() => void billing.refresh()} />}
      <Text style={[styles.small, { color: c.mutedForeground }]}>Purchases are handled by Google Play. To restore Premium, use the store account that made the purchase.</Text>
      <Text style={[styles.small, { color: c.mutedForeground }]}>Google Play and RevenueCat process purchase receipts and an anonymous app ID to manage Premium. Your sermon notes and reading history stay on your device.</Text>
    </View>}
    {billing.message && <Text accessibilityLiveRegion="polite" style={[styles.body, { color: c.foreground }]}>{billing.message}</Text>}
    <FeatureCard>
      <Text style={[styles.heading, { color: c.foreground }]}>Always available for free</Text>
      <Text style={[styles.body, { color: c.mutedForeground }]}>Bible reading, both reading journeys, prophecies, sermon notes, summaries and on-device AI, basic progress and streaks, and the Midnight Gold and Daylight themes.</Text>
      <Text style={[styles.small, { color: c.mutedForeground }]}>No purchase or account is needed for these features.</Text>
    </FeatureCard>
  </FeaturePage>;
}
