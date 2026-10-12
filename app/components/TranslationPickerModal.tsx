import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TRANSLATIONS, type Translation } from "@/data/translations";
import { useTranslation } from "@/contexts/TranslationContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function TranslationPickerModal({ visible, onClose }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { translationId, setTranslationId } = useTranslation();

  const available = TRANSLATIONS.filter((t) => t.source !== "licensed");
  const licensed = TRANSLATIONS.filter((t) => t.source === "licensed");

  const handlePick = (t: Translation) => {
    if (t.source === "licensed") return;
    setTranslationId(t.id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: c.background, borderColor: c.border, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: c.border }]} />
        </View>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: c.foreground }]}>Choose a translation</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={c.mutedForeground} />
          </Pressable>
        </View>
        <Text style={[styles.sub, { color: c.mutedForeground }]}>
          Switch any time. Pages you’ve already opened in a translation are cached for offline reading.
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={[styles.section, { color: c.mutedForeground }]}>AVAILABLE</Text>
          {available.map((t) => {
            const isSelected = t.id === translationId;
            return (
              <Pressable
                key={t.id}
                onPress={() => handlePick(t)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    borderColor: isSelected ? c.gold : c.border,
                    backgroundColor: isSelected ? c.gold + "14" : c.card,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={[styles.tag, { borderColor: isSelected ? c.gold : c.border }]}>
                  <Text style={[styles.tagText, { color: isSelected ? c.gold : c.foreground }]}>
                    {t.abbreviation}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: c.foreground }]}>{t.name}</Text>
                  <Text style={[styles.blurb, { color: c.mutedForeground }]}>{t.blurb}</Text>
                  {t.source === "bundled" ? (
                    <View style={styles.metaRow}>
                      <Ionicons name="cloud-offline" size={11} color={c.mutedForeground} />
                      <Text style={[styles.meta, { color: c.mutedForeground }]}>Offline</Text>
                    </View>
                  ) : (
                    <View style={styles.metaRow}>
                      <Ionicons name="cloud-download-outline" size={11} color={c.mutedForeground} />
                      <Text style={[styles.meta, { color: c.mutedForeground }]}>
                        Streams from bible-api.com · cached after first read
                      </Text>
                    </View>
                  )}
                </View>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={22} color={c.gold} />
                ) : null}
              </Pressable>
            );
          })}

          <Text style={[styles.section, { color: c.mutedForeground, marginTop: 22 }]}>
            REQUIRES LICENSE
          </Text>
          {licensed.map((t) => (
            <View
              key={t.id}
              style={[
                styles.row,
                styles.lockedRow,
                { borderColor: c.border, backgroundColor: c.card },
              ]}
            >
              <View style={[styles.tag, { borderColor: c.border }]}>
                <Text style={[styles.tagText, { color: c.mutedForeground }]}>{t.abbreviation}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.lockedHeader}>
                  <Text style={[styles.name, { color: c.foreground }]}>{t.name}</Text>
                  <Ionicons name="lock-closed" size={13} color={c.mutedForeground} />
                </View>
                <Text style={[styles.blurb, { color: c.mutedForeground }]}>{t.blurb}</Text>
                {t.licenseNote ? (
                  <Text style={[styles.licenseNote, { color: c.mutedForeground }]}>
                    {t.licenseNote}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    maxHeight: "85%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  handle: { alignItems: "center", paddingVertical: 8 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 20 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4, marginBottom: 12 },
  section: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  lockedRow: { opacity: 0.78 },
  tag: {
    minWidth: 50,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  tagText: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.5 },
  name: { fontFamily: "Inter_700Bold", fontSize: 14 },
  blurb: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 10 },
  lockedHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  licenseNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 6,
    fontStyle: "italic",
    lineHeight: 15,
  },
});
