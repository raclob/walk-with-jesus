import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { FeatureButton, FeatureCard, FeaturePage, featureStyles as styles } from "@/components/FeaturePage";
import { usePremium } from "@/contexts/PremiumContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";
import { readingInsights, sampleReadingDays } from "@/services/readingInsights";

export default function InsightsScreen() {
  const c = useColors();
  const { premium } = usePremium();
  const progress = useProgress();
  const data = readingInsights(premium ? progress.readingDays : sampleReadingDays(), premium ? progress.heatMap : {
    "psalms:23": 5, "john:1": 3, "genesis:1": 2, "matthew:5": 2,
  });
  const max = Math.max(1, ...data.week.map(day => day.count));
  const total = data.ot + data.nt;
  return <FeaturePage title={premium ? "Your reading insights" : "A closer look at your walk"}
    subtitle={premium ? "Patterns from the chapters you mark as read. These insights are private to your device." : "Preview the personal reading insights included with Premium. All numbers below are sample data."}>
    {!premium && <FeatureCard>
      <Text style={[styles.heading, { color: c.gold }]}>Sample preview</Text>
      <Text style={[styles.body, { color: c.mutedForeground }]}>This is an example, not your reading history. Your existing progress and streaks remain free.</Text>
      <FeatureButton label="Explore Premium" onPress={() => router.push("/premium")} />
    </FeatureCard>}
    <FeatureCard>
      <Text style={[styles.heading, { color: c.foreground }]}>{premium ? "Last 7 days" : "Sample · Last 7 days"}</Text>
      <Text style={[styles.small, { color: c.mutedForeground }]}>Chapters marked as read, including rereads</Text>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
        {data.week.map(day => <View key={day.key} style={{ flex: 1, alignItems: "center", gap: 6 }} accessibilityLabel={`${day.key}: ${day.count} chapter reads`}>
          <Text style={[styles.small, { color: c.foreground }]}>{day.count}</Text>
          <View style={{ height: 90, width: "100%", justifyContent: "flex-end", alignItems: "center" }}>
            <View style={{ width: "65%", height: day.count ? Math.max(4, 90 * day.count / max) : 2, borderRadius: 5, backgroundColor: day.count ? c.gold : c.border }} />
          </View>
          <Text style={[styles.small, { color: c.mutedForeground }]} numberOfLines={1}>{day.label}</Text>
        </View>)}
      </View>
    </FeatureCard>
    <FeatureCard>
      <Text style={[styles.heading, { color: c.foreground }]}>{premium ? "Last 30 days" : "Sample · Last 30 days"}</Text>
      <Text style={[styles.body, { color: c.foreground }]}>{data.total} chapter reads · {data.activeDays} active days</Text>
      <Text style={[styles.body, { color: c.mutedForeground }]}>{data.average.toFixed(1)} chapters per active day</Text>
      {premium && <Text style={[styles.small, { color: c.mutedForeground }]}>{progress.readingHistoryStartedOn
        ? `Daily history begins ${progress.readingHistoryStartedOn}. Earlier chapter reads have no saved dates.`
        : "Daily history begins when you next mark a chapter as read. Earlier chapter reads have no saved dates."}</Text>}
    </FeatureCard>
    <FeatureCard>
      <Text style={[styles.heading, { color: c.foreground }]}>{premium ? "Books you return to" : "Sample · Books you return to"}</Text>
      <Text style={[styles.small, { color: c.mutedForeground }]}>All-time chapter reads, across your reading journeys</Text>
      {data.books.slice(0, 5).map(book => <View key={book.id} style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
          <Text style={[styles.body, { color: c.foreground, flex: 1 }]}>{book.name}</Text>
          <Text style={[styles.body, { color: c.foreground }]}>{book.reads}</Text>
        </View>
        <View style={{ backgroundColor: c.border, borderRadius: 4, height: 5 }}><View style={{ backgroundColor: book.testament === "OT" ? c.ot : c.nt,
          width: `${Math.round(100 * book.reads / Math.max(1, data.books[0]?.reads ?? 1))}%`, borderRadius: 4, height: 5 }} /></View>
      </View>)}
      {!data.books.length && <Text style={[styles.body, { color: c.mutedForeground }]}>Your first chapter read will appear here.</Text>}
      <Text style={[styles.body, { color: c.mutedForeground }]}>Old Testament: {data.ot} · New Testament: {data.nt}{total ? ` (${Math.round(100 * data.nt / total)}% NT)` : ""}</Text>
    </FeatureCard>
    <Text style={[styles.small, { color: c.mutedForeground }]}>These counts reflect chapters you mark as read, rather than time spent in the app. Resetting progress also clears this history.</Text>
  </FeaturePage>;
}
