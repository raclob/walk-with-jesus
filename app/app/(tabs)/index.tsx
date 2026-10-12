import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChapterPickerModal } from "@/components/ChapterPickerModal";
import { PrestigeBadge } from "@/components/PrestigeBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { TranslationPickerModal } from "@/components/TranslationPickerModal";
import {
  BOOKS,
  GENRE_DESCRIPTIONS,
  GENRE_ORDER,
  getBook,
  type Book,
  type Genre,
} from "@/data/books";
import { getJourney } from "@/data/journeys";
import { parseQuery, suggestions, type SearchResult } from "@/data/searchBible";
import { useProgress } from "@/contexts/ProgressContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useColors } from "@/hooks/useColors";

export default function BibleHomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const progress = useProgress();

  const [query, setQuery] = useState("");
  const [pickerBook, setPickerBook] = useState<Book | null>(null);
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const { translation } = useTranslation();

  // Onboarding redirect
  useEffect(() => {
    if (progress.loaded && !progress.hasOnboarded) {
      router.replace("/onboarding");
    }
  }, [progress.loaded, progress.hasOnboarded]);

  // Pending milestone check
  useEffect(() => {
    if (progress.pendingMilestones.length > 0) {
      const next = progress.pendingMilestones[0];
      router.push(`/milestone/${next}`);
    }
  }, [progress.pendingMilestones]);

  // Full Bible completion (offer prestige once per run)
  useEffect(() => {
    if (!progress.loaded) return;
    const total = progress.totalProgress();
    if (
      total.completed === total.total &&
      total.total > 0 &&
      progress.prestigeOfferedAt !== progress.totalRunsCompleted
    ) {
      router.push("/prestige");
    }
  }, [
    progress.completedThisRun,
    progress.loaded,
    progress.prestigeOfferedAt,
    progress.totalRunsCompleted,
  ]);

  const grouped = useMemo(() => {
    const map: Record<Genre, Book[]> = {
      Law: [],
      History: [],
      Wisdom: [],
      "Major Prophets": [],
      "Minor Prophets": [],
      Gospel: [],
      Acts: [],
      Epistle: [],
      Apocalypse: [],
    };
    for (const b of BOOKS) map[b.genre].push(b);
    return map;
  }, []);

  const totals = progress.totalProgress();
  const overallPct = totals.total > 0 ? totals.completed / totals.total : 0;

  // Current journey position
  const journey = getJourney(progress.journeyType);
  const currentStop = journey[Math.min(progress.journeyIndex, journey.length - 1)];
  const hasStartedCampaign = progress.journeyIndex > 0 || totals.completed > 0;

  const trimmed = query.trim();
  const sugg = useMemo(() => (trimmed ? suggestions(trimmed) : []), [trimmed]);

  const openResult = (r: SearchResult) => {
    if (r.kind === "book") {
      setPickerBook(r.book);
      return;
    }
    if (r.kind === "verse") {
      router.push(`/chapter/${r.book.id}/${r.chapter}?verse=${r.verse}`);
    } else {
      router.push(`/chapter/${r.book.id}/${r.chapter}`);
    }
    setQuery("");
  };

  const onSubmit = () => {
    if (!trimmed) return;
    const parsed = parseQuery(trimmed);
    if (parsed) {
      openResult(parsed);
      return;
    }
    if (sugg.length > 0) openResult(sugg[0]);
  };

  const continueCampaign = () => {
    if (!currentStop) return;
    router.push(`/chapter/${currentStop.bookId}/${currentStop.chapter}`);
  };

  if (!progress.loaded || !progress.hasOnboarded) {
    return <View style={{ flex: 1, backgroundColor: c.background }} />;
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: c.mutedForeground }]}>The Word</Text>
            <Text style={[styles.title, { color: c.foreground }]}>Bible</Text>
          </View>
          <PrestigeBadge level={progress.prestigeLevel} compact />
        </View>

        {/* Translation switcher */}
        <Pressable
          onPress={() => setShowTranslationPicker(true)}
          style={({ pressed }) => [
            styles.translationChip,
            { borderColor: c.border, backgroundColor: c.card, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={[styles.translationTag, { borderColor: c.gold, backgroundColor: c.gold + "18" }]}>
            <Text style={[styles.translationTagText, { color: c.gold }]}>
              {translation.abbreviation}
            </Text>
          </View>
          <Text style={[styles.translationName, { color: c.foreground }]} numberOfLines={1}>
            {translation.name}
          </Text>
          <Text style={[styles.translationChange, { color: c.mutedForeground }]}>Change</Text>
          <Ionicons name="chevron-forward" size={14} color={c.mutedForeground} />
        </Pressable>

        {/* Search */}
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: c.card, borderColor: trimmed ? c.gold + "80" : c.border },
          ]}
        >
          <Ionicons name="search" size={18} color={c.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Find a verse or chapter (e.g. John 3:16)"
            placeholderTextColor={c.mutedForeground}
            style={[styles.searchInput, { color: c.foreground }]}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
          {trimmed ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={c.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        {/* Search results */}
        {trimmed ? (
          sugg.length > 0 ? (
            <View style={[styles.results, { backgroundColor: c.card, borderColor: c.border }]}>
              {sugg.map((r, i) => (
                <Pressable
                  key={`${r.kind}-${r.book.id}-${i}`}
                  onPress={() => openResult(r)}
                  style={({ pressed }) => [
                    styles.resultRow,
                    {
                      borderBottomColor: c.border,
                      borderBottomWidth: i === sugg.length - 1 ? 0 : StyleSheet.hairlineWidth,
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.resultDot,
                      { backgroundColor: r.book.testament === "OT" ? c.ot : c.nt },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultTitle, { color: c.foreground }]}>
                      {r.kind === "verse"
                        ? `${r.book.name} ${r.chapter}:${r.verse}`
                        : r.kind === "chapter"
                          ? `${r.book.name} ${r.chapter}`
                          : r.book.name}
                    </Text>
                    <Text style={[styles.resultSub, { color: c.mutedForeground }]}>
                      {r.kind === "book"
                        ? `${r.book.chapterCount} chapters · ${r.book.genre}`
                        : r.book.genre}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={c.mutedForeground} />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={[styles.results, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.empty, { color: c.mutedForeground }]}>
                No matches. Try a book name like "Genesis" or a reference like "Romans 8:28".
              </Text>
            </View>
          )
        ) : null}

        {/* Campaign card */}
        {!trimmed ? (
          <View
            style={[
              styles.campaign,
              { backgroundColor: c.cardElevated, borderColor: c.gold + "60" },
            ]}
          >
            <View style={styles.campaignHeader}>
              <Ionicons name="footsteps" size={18} color={c.gold} />
              <Text style={[styles.campaignKicker, { color: c.gold }]}>
                {hasStartedCampaign ? "YOUR CAMPAIGN" : "BEGIN YOUR CAMPAIGN"}
              </Text>
            </View>
            <Text style={[styles.campaignTitle, { color: c.foreground }]}>
              {hasStartedCampaign
                ? `Continue at ${currentStop ? getBook(currentStop.bookId)?.name ?? "" : ""} ${currentStop?.chapter ?? ""}`
                : "Walk the whole story"}
            </Text>
            <Text style={[styles.campaignBody, { color: c.mutedForeground }]}>
              {hasStartedCampaign
                ? `${totals.completed} of ${totals.total} chapters this run · ${progress.collectedCount} prophecies discovered`
                : "Read the Bible end-to-end with narrated context, prophecy hunts, and milestones along the way."}
            </Text>
            {hasStartedCampaign ? <ProgressBar progress={overallPct} height={6} /> : null}
            <View style={styles.campaignActions}>
              <Pressable
                onPress={continueCampaign}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: c.gold, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Ionicons
                  name={hasStartedCampaign ? "play" : "compass"}
                  size={16}
                  color={c.background}
                />
                <Text style={[styles.primaryBtnText, { color: c.background }]}>
                  {hasStartedCampaign ? "Continue" : "Start campaign"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/(tabs)/journey")}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { borderColor: c.border, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Text style={[styles.secondaryBtnText, { color: c.foreground }]}>
                  Open journey
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Browse by genre */}
        {!trimmed ? (
          <>
            <Text style={[styles.browseHeader, { color: c.mutedForeground }]}>BROWSE</Text>
            {GENRE_ORDER.map((genre) => {
              const books = grouped[genre];
              if (!books.length) return null;
              const isOT = books[0].testament === "OT";
              return (
                <View key={genre} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.testamentDot, { backgroundColor: isOT ? c.ot : c.nt }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sectionTitle, { color: c.foreground }]}>{genre}</Text>
                      <Text style={[styles.sectionSubtitle, { color: c.mutedForeground }]}>
                        {GENRE_DESCRIPTIONS[genre]}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bookGrid}>
                    {books.map((book) => {
                      const bp = progress.bookProgress(book.id);
                      const pct = bp.completed / book.chapterCount;
                      const isCurrent = currentStop?.bookId === book.id;
                      return (
                        <Pressable
                          key={book.id}
                          onPress={() => setPickerBook(book)}
                          style={({ pressed }) => [
                            styles.bookChip,
                            {
                              backgroundColor: c.card,
                              borderColor: isCurrent ? c.gold : c.border,
                              borderWidth: isCurrent ? 1 : StyleSheet.hairlineWidth,
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                        >
                          <View style={styles.bookChipRow}>
                            <Text
                              style={[styles.bookChipName, { color: c.foreground }]}
                              numberOfLines={1}
                            >
                              {book.name}
                            </Text>
                            <Text style={[styles.bookChipMeta, { color: c.mutedForeground }]}>
                              {bp.completed}/{book.chapterCount}
                            </Text>
                          </View>
                          <ProgressBar progress={pct} height={3} />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
        ) : null}
      </ScrollView>

      <ChapterPickerModal
        book={pickerBook}
        visible={!!pickerBook}
        onClose={() => setPickerBook(null)}
        onPick={(n) => {
          const b = pickerBook;
          setPickerBook(null);
          if (b) router.push(`/chapter/${b.id}/${n}`);
        }}
      />

      <TranslationPickerModal
        visible={showTranslationPicker}
        onClose={() => setShowTranslationPicker(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 12 },
  kicker: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2 },

  translationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  translationTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
  },
  translationTagText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 },
  translationName: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12 },
  translationChange: { fontFamily: "Inter_500Medium", fontSize: 11 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, padding: 0 },

  results: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resultDot: { width: 8, height: 8, borderRadius: 4 },
  resultTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  resultSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  empty: { fontFamily: "Inter_500Medium", fontSize: 13, padding: 16, textAlign: "center" },

  campaign: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  campaignHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  campaignKicker: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1.5 },
  campaignTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  campaignBody: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  campaignActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  primaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  browseHeader: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 26,
    marginBottom: 10,
  },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  testamentDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  sectionSubtitle: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  bookGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bookChip: {
    width: "48.5%",
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  bookChipRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  bookChipName: { fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1, marginRight: 6 },
  bookChipMeta: { fontFamily: "Inter_500Medium", fontSize: 11 },
});
