import React, { useEffect, useMemo, useRef } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Prophecy } from "@/data/prophecies";
import type { ProphecyStatus } from "@/contexts/ProgressContext";

interface VerseListProps {
  verses: string[];
  prophecies: Prophecy[];
  prophecyStatus: (id: string) => ProphecyStatus;
  onDiscoverProphecy: (p: Prophecy) => void;
  translationLabel?: string;
  highlightVerse?: number | null;
  scrollRef?: React.RefObject<ScrollView | null>;
}

interface VerseAnchor {
  prophecy: Prophecy;
  start: number;
  end: number;
}

export function VerseList({
  verses,
  prophecies,
  prophecyStatus,
  onDiscoverProphecy,
  translationLabel = "King James Version · Public Domain",
  highlightVerse = null,
  scrollRef,
}: VerseListProps) {
  const c = useColors();
  const highlightRef = useRef<View>(null);

  // Scroll to highlighted verse once layout is available
  useEffect(() => {
    if (highlightVerse == null || !scrollRef?.current) return;
    const timer = setTimeout(() => {
      if (!highlightRef.current || !scrollRef.current) return;
      if (Platform.OS === "web") {
        // On web the ref is a DOM element — use native scrollIntoView
        const el = highlightRef.current as unknown as HTMLElement;
        el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      } else {
        // On native use measureLayout relative to the ScrollView node
        const { findNodeHandle } = require("react-native");
        const node = findNodeHandle(scrollRef.current);
        if (node) {
          highlightRef.current.measureLayout(
            node,
            (_x: number, y: number) => {
              scrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true });
            },
            () => {},
          );
        }
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [highlightVerse, scrollRef]);

  const anchorsByVerse = useMemo(() => {
    const map = new Map<number, VerseAnchor>();
    for (const p of prophecies) {
      let start: number | null = null;
      let end: number | null = null;
      if (p.verses) {
        start = p.verses.start;
        end = p.verses.end;
      } else if (p.verse) {
        start = p.verse;
        end = p.verse;
      } else {
        continue;
      }
      for (let v = start; v <= end; v++) {
        const idx = v - 1;
        if (idx < 0 || idx >= verses.length) continue;
        if (!map.has(idx)) {
          map.set(idx, { prophecy: p, start, end });
        }
      }
    }
    return map;
  }, [verses, prophecies]);

  if (verses.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: c.border, backgroundColor: c.card }]}>
        <Text style={[styles.emptyText, { color: c.mutedForeground }]}>
          Verse text for this chapter is not available yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 4 }}>
      <Text style={[styles.translation, { color: c.mutedForeground }]}>{translationLabel}</Text>
      <View style={[styles.verseBlock, { backgroundColor: c.card, borderColor: c.border }]}>
        {verses.map((v, i) => {
          const anchor = anchorsByVerse.get(i);
          const isFocused = highlightVerse != null && highlightVerse === i + 1;

          if (anchor) {
            const status = prophecyStatus(anchor.prophecy.id);
            const collected = status !== "hidden";
            const accent = status === "fulfilled" ? c.success : c.gold;
            const tintBg = collected ? accent + "1F" : c.glow + "26";
            const borderColor = collected ? accent : c.glow;
            return (
              <View key={i} ref={isFocused ? highlightRef : undefined}>
              <Pressable
                onPress={collected ? undefined : () => onDiscoverProphecy(anchor.prophecy)}
                disabled={collected}
                style={({ pressed }) => [
                  styles.prophecyVerse,
                  {
                    backgroundColor: tintBg,
                    borderLeftColor: borderColor,
                    opacity: pressed && !collected ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={[styles.verseLine, { color: c.foreground }]}>
                  <Text style={[styles.verseNum, { color: collected ? accent : c.glow }]}>
                    {i + 1}{" "}
                  </Text>
                  <Text style={{ color: collected ? accent : c.glow, fontFamily: "Inter_600SemiBold" }}>
                    {v}
                  </Text>
                </Text>
                <Text style={[styles.prophecyHint, { color: collected ? accent : c.glow }]}>
                  {collected
                    ? status === "fulfilled"
                      ? "✓✓ Prophecy fulfilled"
                      : "✓ Prophecy collected"
                    : "Tap — a prophecy lives here"}
                </Text>
              </Pressable>
              </View>
            );
          }

          return (
            <View
              key={i}
              ref={isFocused ? highlightRef : undefined}
              style={
                isFocused
                  ? {
                      backgroundColor: c.gold + "1A",
                      borderLeftColor: c.gold,
                      borderLeftWidth: 3,
                      paddingLeft: 8,
                      paddingVertical: 4,
                      marginLeft: -4,
                      borderRadius: 4,
                    }
                  : undefined
              }
            >
              <Text style={[styles.verseLine, { color: c.foreground }]}>
                <Text
                  style={[
                    styles.verseNum,
                    { color: isFocused ? c.gold : c.mutedForeground },
                  ]}
                >
                  {i + 1}{" "}
                </Text>
                {v}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  translation: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  verseBlock: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  verseLine: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  verseNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  prophecyVerse: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 8,
    marginLeft: -4,
    borderRadius: 6,
    gap: 4,
  },
  prophecyHint: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  empty: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
  },
});
