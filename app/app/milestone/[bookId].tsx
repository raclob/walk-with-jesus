import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getBook } from "@/data/books";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";

export default function MilestoneScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ bookId: string }>();
  const progress = useProgress();
  const book = getBook(params.bookId);

  if (!book) {
    return <View style={{ flex: 1, backgroundColor: c.background }} />;
  }

  const isPrestige = progress.prestigeLevel > 0;
  const milestoneText = isPrestige ? book.prestigeMilestone : book.milestone;

  const continueOn = () => {
    progress.acknowledgeMilestone(book.id);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <View style={[styles.iconWrap, { backgroundColor: c.gold + "20" }]}>
          <Ionicons name="ribbon" size={48} color={c.gold} />
        </View>
        <Text style={[styles.kicker, { color: c.gold }]}>BOOK COMPLETED</Text>
        <Text style={[styles.bookName, { color: c.foreground }]}>{book.name}</Text>
        <Text style={[styles.bookMeta, { color: c.mutedForeground }]}>
          {book.chapterCount} chapters · {book.testament === "OT" ? "Old Testament" : "New Testament"} · {book.genre}
        </Text>
        <View style={[styles.quote, { backgroundColor: c.cardElevated, borderColor: c.gold + "40" }]}>
          <Text style={[styles.quoteText, { color: c.foreground }]}>{milestoneText}</Text>
        </View>

        <Pressable
          onPress={continueOn}
          style={({ pressed }) => [styles.cta, { backgroundColor: c.gold, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={[styles.ctaText, { color: c.background }]}>Continue the journey</Text>
          <Ionicons name="arrow-forward" size={18} color={c.background} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 24, alignSelf: "center" },
  kicker: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 2, textAlign: "center" },
  bookName: { fontFamily: "Inter_700Bold", fontSize: 36, textAlign: "center", marginTop: 8 },
  bookMeta: { fontFamily: "Inter_500Medium", fontSize: 13, textAlign: "center", marginTop: 6 },
  quote: { borderRadius: 16, borderWidth: 1, padding: 20, marginTop: 28 },
  quoteText: { fontFamily: "Inter_500Medium", fontSize: 17, lineHeight: 26, textAlign: "center", fontStyle: "italic" },
  cta: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginTop: 32,
  },
  ctaText: { fontFamily: "Inter_700Bold", fontSize: 15 },
});
