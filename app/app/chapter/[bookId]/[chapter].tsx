import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View, Modal, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProgressBar } from "@/components/ProgressBar";
import { TranslationPickerModal } from "@/components/TranslationPickerModal";
import { VerseList } from "@/components/VerseList";
import { getBook } from "@/data/books";
import { getChapterOverride } from "@/data/chapterContexts";
import { getChapterVerses } from "@/data/bibleText";
import { getPropheciesAtSource, Prophecy } from "@/data/prophecies";
import { useProgress } from "@/contexts/ProgressContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useColors } from "@/hooks/useColors";
import { fetchChapterText } from "@/services/bibleApi";

export default function ChapterScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ bookId: string; chapter: string; verse?: string }>();
  const bookId = params.bookId;
  const chapter = parseInt(params.chapter ?? "1", 10);
  const highlightVerse = params.verse ? parseInt(params.verse, 10) : null;
  const progress = useProgress();
  type Celebration = { prophecy: Prophecy; kind: "discovered" | "fulfilled" };
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [showCelebration, setShowCelebration] = useState<Celebration | null>(null);
  const [advanceAfter, setAdvanceAfter] = useState(false);

  const book = getBook(bookId);
  if (!book || isNaN(chapter)) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.foreground }}>Chapter not found.</Text>
      </View>
    );
  }

  const isPrestige = progress.prestigeLevel > 0;
  const override = getChapterOverride(bookId, chapter);
  const contextText = override
    ? (isPrestige && override.prestigeContext ? override.prestigeContext : override.context)
    : (isPrestige ? book.prestigeContext : book.context);

  const verseProphecies = useMemo(
    () => getPropheciesAtSource(bookId, chapter).filter((p) => p.type === "verse"),
    [bookId, chapter]
  );

  const { translation } = useTranslation();
  const bundledVerses = useMemo(() => getChapterVerses(bookId, chapter), [bookId, chapter]);
  const [remoteVerses, setRemoteVerses] = useState<string[] | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const useBundled = translation.source === "bundled";

  useEffect(() => {
    let cancelled = false;
    if (useBundled) {
      setRemoteVerses(null);
      setRemoteError(null);
      setRemoteLoading(false);
      return;
    }
    setRemoteLoading(true);
    setRemoteError(null);
    fetchChapterText(translation.id, bookId, chapter)
      .then((data) => {
        if (cancelled) return;
        setRemoteVerses(data.verses.map((v) => v.text));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setRemoteError(err.message);
        setRemoteVerses(null);
      })
      .finally(() => {
        if (!cancelled) setRemoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [translation.id, useBundled, bookId, chapter]);

  const verses = useBundled ? bundledVerses : remoteVerses ?? [];

  const isCompleted = progress.isChapterRead(bookId, chapter);
  const heat = progress.heatMap[`${bookId}:${chapter}`] ?? 0;

  const handleDiscover = (p: Prophecy) => {
    if (progress.prophecyStatus(p.id) !== "hidden") return;
    progress.discoverProphecy(p.id);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    setShowCelebration({ prophecy: p, kind: "discovered" });
  };

  const handleMarkRead = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    const result = progress.markChapterRead(bookId, chapter);
    const events: Celebration[] = [
      ...result.newlyDiscovered.map((p) => ({ prophecy: p, kind: "discovered" as const })),
      ...result.newlyFulfilled.map((p) => ({ prophecy: p, kind: "fulfilled" as const })),
    ];

    if (events.length > 0) {
      setQueue(events.slice(1));
      setShowCelebration(events[0]);
      setAdvanceAfter(true);
    } else {
      const nextChapter = chapter + 1;
      if (nextChapter <= book.chapterCount) {
        router.replace(`/chapter/${bookId}/${nextChapter}`);
      } else {
        router.back();
      }
    }
  };

  const dismissCelebration = () => {
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      setShowCelebration(next);
      return;
    }
    setShowCelebration(null);
    if (advanceAfter) {
      setAdvanceAfter(false);
      const nextChapter = chapter + 1;
      if (nextChapter <= book.chapterCount) {
        router.replace(`/chapter/${bookId}/${nextChapter}`);
      } else {
        router.back();
      }
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: book.name,
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.foreground,
        }}
      />
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        {/* Chapter heading */}
        <View style={styles.headerRow}>
          <View style={[styles.testamentBadge, { backgroundColor: book.testament === "OT" ? c.ot + "30" : c.nt + "30" }]}>
            <Text style={[styles.testamentText, { color: book.testament === "OT" ? c.ot : c.nt }]}>
              {book.testament === "OT" ? "Old Testament" : "New Testament"}
            </Text>
          </View>
          {heat > 0 ? (
            <View style={styles.heatBadge}>
              <Ionicons name="flame" size={12} color={c.gold} />
              <Text style={[styles.heatText, { color: c.gold }]}>{heat}× walked</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.bookName, { color: c.mutedForeground }]}>{book.name}</Text>
        <Text style={[styles.chapterTitle, { color: c.foreground }]}>Chapter {chapter}</Text>

        {/* Narrative context — campaign voice */}
        <View style={[styles.narrative, { borderColor: c.border, backgroundColor: c.card }]}>
          <Text style={[styles.narrativeLabel, { color: c.gold }]}>
            {book.testament === "OT" ? "WANDERER" : "COMPANION"}
            {isPrestige ? " · RETURNING" : ""}
          </Text>
          <Text style={[styles.narrativeText, { color: c.foreground }]}>{contextText}</Text>
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
          <Ionicons name="swap-horizontal" size={14} color={c.mutedForeground} />
        </Pressable>

        {/* Bible verse text */}
        <View style={{ marginTop: 12 }}>
          {remoteLoading ? (
            <View style={[styles.loadingBox, { borderColor: c.border, backgroundColor: c.card }]}>
              <ActivityIndicator color={c.gold} />
              <Text style={[styles.loadingText, { color: c.mutedForeground }]}>
                Loading {translation.abbreviation}…
              </Text>
            </View>
          ) : remoteError ? (
            <View style={[styles.loadingBox, { borderColor: c.destructive + "60", backgroundColor: c.card }]}>
              <Ionicons name="cloud-offline" size={20} color={c.destructive} />
              <Text style={[styles.loadingText, { color: c.foreground }]}>
                Couldn’t load this chapter in {translation.abbreviation}.
              </Text>
              <Text style={[styles.loadingSub, { color: c.mutedForeground }]}>
                Check your connection or pick a different translation.
              </Text>
            </View>
          ) : (
            <VerseList
              verses={verses}
              prophecies={verseProphecies}
              prophecyStatus={progress.prophecyStatus}
              onDiscoverProphecy={handleDiscover}
              translationLabel={
                useBundled
                  ? `${translation.name} · Public Domain`
                  : `${translation.name} · via bible-api.com`
              }
              highlightVerse={highlightVerse}
              scrollRef={scrollRef}
            />
          )}
        </View>

        {/* Hidden prophecies hint */}
        {verseProphecies.length > 0 ? (
          <View style={[styles.hintCard, { backgroundColor: c.cardElevated, borderColor: c.gold + "40" }]}>
            <Ionicons name="sparkles" size={16} color={c.gold} />
            <Text style={[styles.hintText, { color: c.foreground }]}>
              {verseProphecies.length === 1
                ? "A prophecy hides in this chapter. Tap the glowing verse to collect it."
                : `${verseProphecies.length} prophecies hide in this chapter. Tap each glowing verse to collect it.`}
            </Text>
          </View>
        ) : null}

        {/* Prophecy reference cards */}
        {verseProphecies.length > 0 ? (
          <View style={{ gap: 16, marginTop: 20 }}>
            <Text style={[styles.passagesLabel, { color: c.mutedForeground }]}>WATCH THE VERSES</Text>
            {verseProphecies.map((p) => {
              const status = progress.prophecyStatus(p.id);
              const collected = status !== "hidden";
              const accent = status === "fulfilled" ? c.success : c.gold;
              const ref = p.verses
                ? `v${p.verses.start}–${p.verses.end}`
                : p.verse
                ? `v${p.verse}`
                : null;
              return (
                <Pressable
                  key={p.id}
                  onPress={collected ? undefined : () => handleDiscover(p)}
                  disabled={collected}
                  style={({ pressed }) => [
                    styles.passageCard,
                    {
                      backgroundColor: c.card,
                      borderColor: collected ? accent + "60" : c.border,
                      opacity: pressed && !collected ? 0.85 : 1,
                    },
                  ]}
                >
                  <View style={styles.passageHeaderRow}>
                    {ref ? (
                      <View style={[styles.verseRefBadge, { borderColor: accent, backgroundColor: accent + "1A" }]}>
                        <Text style={[styles.verseRefText, { color: accent }]}>{ref}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.passageTitle, { color: c.foreground }]} numberOfLines={2}>
                      {collected ? p.title : "A prophecy waits here"}
                    </Text>
                  </View>
                  {collected ? (
                    <>
                      <Text style={[styles.passageSummary, { color: c.mutedForeground }]}>{p.summary}</Text>
                      <Text style={[styles.passageRevealed, { color: accent }]}>
                        {status === "fulfilled" ? "✓✓ Fulfilled" : "✓ Watching"}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.passageHint, { color: c.gold }]}>
                      Tap the glowing verse above to discover it.
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* Mark read */}
        <Pressable
          onPress={handleMarkRead}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: isCompleted ? c.cardElevated : c.gold,
              borderColor: c.gold,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons
            name={isCompleted ? "checkmark-done" : "checkmark"}
            size={18}
            color={isCompleted ? c.gold : c.background}
          />
          <Text style={[styles.actionText, { color: isCompleted ? c.gold : c.background }]}>
            {isCompleted ? "Read again — onward" : "Mark read · continue"}
          </Text>
        </Pressable>

        {/* Chapter nav */}
        <View style={styles.navRow}>
          <Pressable
            onPress={() => chapter > 1 && router.replace(`/chapter/${bookId}/${chapter - 1}`)}
            disabled={chapter <= 1}
            style={[styles.navBtn, { borderColor: c.border, opacity: chapter <= 1 ? 0.3 : 1 }]}
          >
            <Ionicons name="chevron-back" size={18} color={c.foreground} />
            <Text style={[styles.navText, { color: c.foreground }]}>Previous</Text>
          </Pressable>
          <Pressable
            onPress={() => chapter < book.chapterCount && router.replace(`/chapter/${bookId}/${chapter + 1}`)}
            disabled={chapter >= book.chapterCount}
            style={[styles.navBtn, { borderColor: c.border, opacity: chapter >= book.chapterCount ? 0.3 : 1 }]}
          >
            <Text style={[styles.navText, { color: c.foreground }]}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color={c.foreground} />
          </Pressable>
        </View>

        {/* Book progress mini */}
        <View style={{ marginTop: 24 }}>
          <View style={styles.bpRow}>
            <Text style={[styles.bpLabel, { color: c.mutedForeground }]}>{book.name}</Text>
            <Text style={[styles.bpValue, { color: c.foreground }]}>
              {progress.bookProgress(book.id).completed} / {book.chapterCount}
            </Text>
          </View>
          <ProgressBar progress={progress.bookProgress(book.id).completed / book.chapterCount} />
        </View>
      </ScrollView>

      <TranslationPickerModal
        visible={showTranslationPicker}
        onClose={() => setShowTranslationPicker(false)}
      />

      {/* Celebration modal */}
      <Modal visible={!!showCelebration} transparent animationType="fade" onRequestClose={dismissCelebration}>
        <View style={styles.celebrationRoot}>
          {showCelebration ? (() => {
            const isFulfilled = showCelebration.kind === "fulfilled";
            const accent = isFulfilled ? c.success : c.gold;
            const p = showCelebration.prophecy;
            return (
              <View style={[styles.celebration, { backgroundColor: c.cardElevated, borderColor: accent }]}>
                <View style={[styles.celebIconWrap, { backgroundColor: accent + "30" }]}>
                  <Ionicons name={isFulfilled ? "checkmark-circle" : "sparkles"} size={36} color={accent} />
                </View>
                <Text style={[styles.celebKicker, { color: accent }]}>
                  {isFulfilled ? "PROPHECY FULFILLED" : "PROPHECY DISCOVERED"}
                </Text>
                <Text style={[styles.celebTitle, { color: c.foreground }]}>{p.title}</Text>
                <Text style={[styles.celebSummary, { color: c.mutedForeground }]}>{p.summary}</Text>
                {!isFulfilled && p.fulfillments.length > 0 ? (
                  <View style={[styles.celebFulfill, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.celebFulfillLabel, { color: c.nt }]}>Watch for it in</Text>
                    <Text style={[styles.celebFulfillText, { color: c.foreground }]}>
                      {getBook(p.fulfillments[0].bookId)?.name} {p.fulfillments[0].chapter}
                    </Text>
                    <Text style={[styles.celebFulfillDesc, { color: c.mutedForeground }]}>
                      {p.fulfillments[0].description}
                    </Text>
                  </View>
                ) : null}
                {isFulfilled ? (
                  <View style={[styles.celebFulfill, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.celebFulfillLabel, { color: c.success }]}>Centuries later, here.</Text>
                    <Text style={[styles.celebFulfillDesc, { color: c.mutedForeground }]}>
                      The promise made long ago has come true in this chapter.
                    </Text>
                  </View>
                ) : null}
                <Pressable
                  onPress={dismissCelebration}
                  style={({ pressed }) => [styles.celebBtn, { backgroundColor: accent, opacity: pressed ? 0.85 : 1 }]}
                >
                  <Text style={[styles.celebBtnText, { color: c.background }]}>Continue</Text>
                </Pressable>
              </View>
            );
          })() : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  testamentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  testamentText: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.5 },
  heatBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  heatText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  bookName: { fontFamily: "Inter_500Medium", fontSize: 14, marginTop: 12 },
  chapterTitle: { fontFamily: "Inter_700Bold", fontSize: 32, marginTop: 2, marginBottom: 18 },
  narrative: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 8 },
  translationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  translationTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
  },
  translationTagText: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 },
  translationName: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12 },
  translationNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 15,
  },
  loadingBox: {
    padding: 22,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 8,
  },
  loadingText: { fontFamily: "Inter_600SemiBold", fontSize: 13, textAlign: "center" },
  loadingSub: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },
  narrativeLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1.5 },
  narrativeText: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 23 },
  hintCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  hintText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 19 },
  passagesLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1.5 },
  passageCard: { padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, gap: 8 },
  passageHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  verseRefBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  verseRefText: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.5 },
  passageTitle: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  passageSummary: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  passageHint: { fontFamily: "Inter_500Medium", fontSize: 12, fontStyle: "italic" },
  passageRevealed: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  actionBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 24,
  },
  actionText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  navRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  navText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  bpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  bpLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  bpValue: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  celebrationRoot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.7)", padding: 24 },
  celebration: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", maxWidth: 380, gap: 12 },
  celebIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  celebKicker: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 2 },
  celebTitle: { fontFamily: "Inter_700Bold", fontSize: 22, textAlign: "center" },
  celebSummary: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 21 },
  celebFulfill: { padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignSelf: "stretch", gap: 4 },
  celebFulfillLabel: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 },
  celebFulfillText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  celebFulfillDesc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
  celebBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  celebBtnText: { fontFamily: "Inter_700Bold", fontSize: 14 },
});
