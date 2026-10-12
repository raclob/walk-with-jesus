import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProphecyCard } from "@/components/ProphecyCard";
import { ProgressBar } from "@/components/ProgressBar";
import { PROPHECIES, Prophecy } from "@/data/prophecies";
import { getBook } from "@/data/books";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";

type Filter = "all" | "watching" | "fulfilled";

export default function PropheciesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Prophecy | null>(null);

  const filtered = useMemo(() => {
    if (filter === "watching") return PROPHECIES.filter((p) => progress.prophecyStatus(p.id) === "watching");
    if (filter === "fulfilled") return PROPHECIES.filter((p) => progress.prophecyStatus(p.id) === "fulfilled");
    return PROPHECIES;
  }, [filter, progress]);

  const discoveredCount = progress.collectedCount;
  const fulfilledCount = progress.fulfilledCount;
  const pct = discoveredCount / PROPHECIES.length;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
      >
        <Text style={[styles.kicker, { color: c.mutedForeground }]}>Discoveries</Text>
        <Text style={[styles.title, { color: c.foreground }]}>Prophecy Collection</Text>

        <View style={[styles.summary, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: c.mutedForeground }]}>Discovered</Text>
              <Text style={[styles.summaryValue, { color: c.gold }]}>
                {discoveredCount} / {PROPHECIES.length}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: c.mutedForeground }]}>Fulfilled</Text>
              <Text style={[styles.summaryValue, { color: c.success }]}>
                {fulfilledCount} / {PROPHECIES.length}
              </Text>
            </View>
            <Ionicons name="sparkles" size={28} color={c.gold} />
          </View>
          <ProgressBar progress={pct} height={6} color={c.gold} />
          <Text style={[styles.hint, { color: c.mutedForeground }]}>
            Find a prophecy in its source chapter, then watch it come true centuries later in the New Testament.
          </Text>
        </View>

        {/* Filter pills */}
        <View style={styles.filters}>
          {(["all", "watching", "fulfilled"] as Filter[]).map((f) => {
            const accent = f === "fulfilled" ? c.success : c.gold;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.filter,
                  {
                    backgroundColor: filter === f ? accent + "30" : c.card,
                    borderColor: filter === f ? accent + "60" : c.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: filter === f ? accent : c.mutedForeground }]}>
                  {f === "all" ? "All" : f === "watching" ? "Watching & waiting" : "Fulfilled"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: 10 }}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search" size={32} color={c.mutedForeground} />
              <Text style={[styles.emptyText, { color: c.mutedForeground }]}>
                No prophecies match this filter yet.
              </Text>
            </View>
          ) : (
            filtered.map((p) => (
              <ProphecyCard
                key={p.id}
                prophecy={p}
                status={progress.prophecyStatus(p.id)}
                onPress={() => setActive(p)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Detail modal */}
      <Modal visible={!!active} animationType="slide" transparent onRequestClose={() => setActive(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setActive(null)} />
          <View style={[styles.modalCard, { backgroundColor: c.cardElevated, paddingBottom: insets.bottom + 16 }]}>
            {active ? (() => {
              const status = progress.prophecyStatus(active.id);
              const known = status !== "hidden";
              const fulfilled = status === "fulfilled";
              const sourceBook = getBook(active.sourceBookId);
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHandle}>
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.mutedForeground }} />
                  </View>
                  <View style={styles.modalHeader}>
                    <Ionicons
                      name={fulfilled ? "checkmark-circle" : known ? "sparkles" : "lock-closed"}
                      size={24}
                      color={fulfilled ? c.success : known ? c.gold : c.mutedForeground}
                    />
                    <Text style={[styles.modalTitle, { color: c.foreground }]}>
                      {known ? active.title : "Hidden Prophecy"}
                    </Text>
                  </View>
                  <Text style={[styles.modalSource, { color: fulfilled ? c.success : c.gold }]}>
                    {fulfilled ? "Fulfilled" : known ? "Watching & waiting" : "Hidden"} · {sourceBook?.name} {active.sourceChapter}
                  </Text>
                  <Text style={[styles.modalBody, { color: c.foreground }]}>
                    {known
                      ? active.summary
                      : `A prophecy waits in ${sourceBook?.name} ${active.sourceChapter}. ${active.type === "verse" ? "Look for the glowing words and tap them when you find them." : "It will be revealed when you read this chapter."}`}
                  </Text>

                  {known && active.glowingPhrase ? (
                    <View style={[styles.quote, { borderLeftColor: fulfilled ? c.success : c.gold, backgroundColor: c.card }]}>
                      <Text style={[styles.quoteText, { color: c.foreground }]}>"{active.glowingPhrase}"</Text>
                    </View>
                  ) : null}

                  {known ? (
                    <>
                      <Text style={[styles.modalSection, { color: c.mutedForeground }]}>
                        {fulfilled ? "FULFILLED IN" : "WILL BE FULFILLED IN"}
                      </Text>
                      {active.fulfillments.map((f, i) => {
                        const fb = getBook(f.bookId);
                        const fulfillRead = progress.isChapterRead(f.bookId, f.chapter);
                        return (
                          <View key={i} style={[styles.fulfillment, { backgroundColor: c.card, borderColor: c.border }]}>
                            <Text style={[styles.fulfillmentRef, { color: fulfillRead ? c.success : c.nt }]}>
                              {fb?.name} {f.chapter} {fulfillRead ? "✓" : ""}
                            </Text>
                            <Text style={[styles.fulfillmentText, { color: c.foreground }]}>{f.description}</Text>
                          </View>
                        );
                      })}
                    </>
                  ) : null}
                </ScrollView>
              );
            })() : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2, marginBottom: 16 },
  summary: { borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth, gap: 12, marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontFamily: "Inter_500Medium", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  summaryValue: { fontFamily: "Inter_700Bold", fontSize: 24, marginTop: 2 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 14 },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  filterText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  empty: { padding: 32, alignItems: "center", gap: 8 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  modalRoot: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 6, maxHeight: "85%" },
  modalHandle: { alignItems: "center", paddingVertical: 8 },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, flex: 1 },
  modalSource: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginTop: 4, marginBottom: 12 },
  modalBody: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  quote: { borderLeftWidth: 3, padding: 12, borderRadius: 8, marginTop: 14 },
  quoteText: { fontFamily: "Inter_500Medium", fontSize: 15, lineHeight: 22, fontStyle: "italic" },
  modalSection: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 1.4, marginTop: 20, marginBottom: 8 },
  fulfillment: { padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8, gap: 4 },
  fulfillmentRef: { fontFamily: "Inter_700Bold", fontSize: 13 },
  fulfillmentText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
});
