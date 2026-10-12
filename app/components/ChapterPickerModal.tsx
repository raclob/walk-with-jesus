import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Book } from "@/data/books";
import { useProgress } from "@/contexts/ProgressContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  book: Book | null;
  visible: boolean;
  onClose: () => void;
  onPick: (chapter: number) => void;
}

export function ChapterPickerModal({ book, visible, onClose, onPick }: Props) {
  const c = useColors();
  const progress = useProgress();

  if (!book) return null;
  const numbers = Array.from({ length: book.chapterCount }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: c.cardElevated, borderColor: c.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: c.mutedForeground }]}>
                {book.testament === "OT" ? "Old Testament" : "New Testament"}
              </Text>
              <Text style={[styles.title, { color: c.foreground }]}>{book.name}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={c.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.sub, { color: c.mutedForeground }]}>Pick a chapter</Text>
          <ScrollView contentContainerStyle={styles.grid}>
            {numbers.map((n) => {
              const read = progress.isChapterRead(book.id, n);
              return (
                <Pressable
                  key={n}
                  onPress={() => onPick(n)}
                  style={({ pressed }) => [
                    styles.cell,
                    {
                      backgroundColor: read ? c.gold + "22" : c.card,
                      borderColor: read ? c.gold + "80" : c.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.cellText, { color: read ? c.gold : c.foreground }]}>{n}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "78%",
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  kicker: { fontFamily: "Inter_500Medium", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 2 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 8 },
  cell: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
