import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatReference,
  formatSerialized,
  parseReference,
  serializeReference,
  type SerializedReference,
} from "@/data/parseReference";
import { useSermons, makeSermonId, type SermonPoint, type SermonSupplement } from "@/contexts/SermonContext";
import { useColors } from "@/hooks/useColors";

import { SermonSummary } from "@/components/SermonSummary";

function pushReference(ref: SerializedReference) {
  if (ref.verseStart) {
    router.push(`/chapter/${ref.bookId}/${ref.chapter}?verse=${ref.verseStart}`);
  } else {
    router.push(`/chapter/${ref.bookId}/${ref.chapter}`);
  }
}

export default function SermonDetailScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sermonId = String(id);
  const { loaded, getSermon } = useSermons();
  const sermon = getSermon(sermonId);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: c.background, justifyContent: "center" }}><ActivityIndicator color={c.primary} /></View>;
  if (!sermon) return <View style={{ flex: 1, backgroundColor: c.background, padding: 24 }}><Text style={{ color: c.foreground }}>This sermon could not be found.</Text></View>;
  return <SermonEditor key={sermonId} sermon={sermon} />;
}

function SermonEditor({ sermon }: { sermon: import("@/contexts/SermonContext").SermonLog }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const sermonId = sermon.id;
  const { updateSermon, deleteSermon } = useSermons();

  const [title, setTitle] = useState(sermon?.title ?? "");
  const [speaker, setSpeaker] = useState(sermon?.speaker ?? "");
  const [date, setDate] = useState(sermon?.date ?? "");
  const [passageText, setPassageText] = useState(
    sermon?.passage ? formatSerialized(sermon.passage) : ""
  );
  const [passage, setPassage] = useState<SerializedReference | undefined>(sermon?.passage);
  const [points, setPoints] = useState<SermonPoint[]>(sermon?.points ?? []);
  const [supplemental, setSupplemental] = useState<SermonSupplement[]>(sermon?.supplemental ?? []);
  const [notes, setNotes] = useState(sermon?.notes ?? "");
  const [newSuppText, setNewSuppText] = useState("");
  const [newSuppNote, setNewSuppNote] = useState("");
  const [passageError, setPassageError] = useState<string | null>(null);
  const [suppError, setSuppError] = useState<string | null>(null);

  // Auto-save on any change
  useEffect(() => {
    if (!sermon) return;
    updateSermon(sermonId, {
        title,
        speaker: speaker || undefined,
        date,
        passage,
        points,
        supplemental,
        notes: notes || undefined,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, speaker, date, passage, points, supplemental, notes]);

  const passageLabel = useMemo(
    () => (passage ? formatSerialized(passage) : null),
    [passage]
  );

  if (!sermon) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, padding: 24 }}>
        <Stack.Screen options={{ title: "Sermon" }} />
        <Text style={{ color: c.mutedForeground, fontFamily: "Inter_500Medium", marginTop: insets.top + 80, textAlign: "center" }}>
          This sermon could not be found.
        </Text>
      </View>
    );
  }

  const commitPassage = () => {
    const trimmed = passageText.trim();
    if (!trimmed) {
      setPassage(undefined);
      setPassageError(null);
      return;
    }
    const parsed = parseReference(trimmed);
    if (!parsed) {
      setPassageError("Try something like \u201cJohn 3:16-18\u201d.");
      return;
    }
    const serialized = serializeReference(parsed);
    setPassage(serialized);
    setPassageText(formatReference(parsed));
    setPassageError(null);
  };

  const openPassage = () => {
    if (passage) pushReference(passage);
  };

  const addPoint = () => {
    setPoints((prev) => [
      ...prev,
      { id: makeSermonId("point"), point: "", answer: "", supplements: [] },
    ]);
  };

  const updatePoint = (pid: string, patch: Partial<SermonPoint>) => {
    setPoints((prev) => prev.map((p) => (p.id === pid ? { ...p, ...patch } : p)));
  };

  const removePoint = (pid: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== pid));
  };

  const movePoint = (pid: string, direction: "up" | "down") => {
    setPoints((prev) => {
      const idx = prev.findIndex((p) => p.id === pid);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  const addPointSupplement = (pid: string, text: string, note: string): boolean => {
    const parsed = parseReference(text.trim());
    if (!parsed) return false;
    const supp: SermonSupplement = {
      id: makeSermonId("supp"),
      ref: serializeReference(parsed),
      note: note.trim() || undefined,
    };
    setPoints((prev) =>
      prev.map((p) =>
        p.id === pid ? { ...p, supplements: [...(p.supplements ?? []), supp] } : p
      )
    );
    return true;
  };

  const removePointSupplement = (pid: string, sid: string) => {
    setPoints((prev) =>
      prev.map((p) =>
        p.id === pid ? { ...p, supplements: (p.supplements ?? []).filter((s) => s.id !== sid) } : p
      )
    );
  };

  const addSupplement = () => {
    const trimmed = newSuppText.trim();
    if (!trimmed) {
      setSuppError("Enter a reference like \u201cRomans 8:28\u201d.");
      return;
    }
    const parsed = parseReference(trimmed);
    if (!parsed) {
      setSuppError("Try something like \u201cRomans 8:28\u201d.");
      return;
    }
    setSupplemental((prev) => [
      ...prev,
      {
        id: makeSermonId("supp"),
        ref: serializeReference(parsed),
        note: newSuppNote.trim() || undefined,
      },
    ]);
    setNewSuppText("");
    setNewSuppNote("");
    setSuppError(null);
  };

  const removeSupplement = (sid: string) => {
    setSupplemental((prev) => prev.filter((s) => s.id !== sid));
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete sermon?",
      "This sermon log and all its notes will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSermon(sermonId);
            router.back();
          },
        },
      ]
    );
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top + 44}
    >
      <Stack.Screen options={{ title: title || "Sermon", headerBackTitle: "Sermons" }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 80,
          paddingTop: 8,
        }}
      >
        {/* Header fields */}
        <Field label="Title">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. The God Who Sees"
            placeholderTextColor={c.mutedForeground}
            style={[styles.input, { color: c.foreground, borderColor: c.border, backgroundColor: c.card }]}
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Speaker">
              <TextInput
                value={speaker}
                onChangeText={setSpeaker}
                placeholder="Optional"
                placeholderTextColor={c.mutedForeground}
                style={[styles.input, { color: c.foreground, borderColor: c.border, backgroundColor: c.card }]}
              />
            </Field>
          </View>
          <View style={{ width: 130 }}>
            <Field label="Date">
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={c.mutedForeground}
                autoCapitalize="none"
                style={[styles.input, { color: c.foreground, borderColor: c.border, backgroundColor: c.card }]}
              />
            </Field>
          </View>
        </View>

        {/* Primary passage */}
        <Field label="Read along">
          <TextInput
            value={passageText}
            onChangeText={setPassageText}
            onBlur={commitPassage}
            onSubmitEditing={commitPassage}
            placeholder="e.g. John 3:16-18"
            placeholderTextColor={c.mutedForeground}
            autoCapitalize="words"
            style={[styles.input, { color: c.foreground, borderColor: c.border, backgroundColor: c.card }]}
          />
          {passageError ? (
            <Text style={[styles.error, { color: c.destructive }]}>{passageError}</Text>
          ) : null}
          {passageLabel ? (
            <Pressable
              onPress={openPassage}
              style={({ pressed }) => [
                styles.openBtn,
                { borderColor: c.gold + "70", backgroundColor: c.gold + "18", opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="book" size={14} color={c.gold} />
              <Text style={[styles.openBtnText, { color: c.gold }]} numberOfLines={1}>
                Open {passageLabel}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={c.gold} />
            </Pressable>
          ) : null}
        </Field>

        {/* Main points */}
        <View style={{ marginTop: 18 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>Main points</Text>
            <Pressable
              onPress={addPoint}
              style={({ pressed }) => [
                styles.addBtn,
                { borderColor: c.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="add" size={14} color={c.foreground} />
              <Text style={[styles.addBtnText, { color: c.foreground }]}>Add point</Text>
            </Pressable>
          </View>
          {points.length === 0 ? (
            <Text style={[styles.hint, { color: c.mutedForeground }]}>
              Capture each point with the answer or insight that landed.
            </Text>
          ) : null}
          {points.map((p, idx) => (
            <PointCard
              key={p.id}
              point={p}
              index={idx}
              total={points.length}
              onUpdate={(patch) => updatePoint(p.id, patch)}
              onRemove={() => removePoint(p.id)}
              onMove={(dir) => movePoint(p.id, dir)}
              onAddSupplement={(text, note) => addPointSupplement(p.id, text, note)}
              onRemoveSupplement={(sid) => removePointSupplement(p.id, sid)}
            />
          ))}
        </View>

        {/* Supplemental verses (sermon-wide) */}
        <View style={{ marginTop: 22 }}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>Supplemental verses</Text>
          <Text style={[styles.hint, { color: c.mutedForeground }]}>
            Cross-references the speaker turned to.
          </Text>

          {supplemental.length > 0 ? (
            <View style={{ gap: 8, marginTop: 10 }}>
              {supplemental.map((s) => (
                <View
                  key={s.id}
                  style={[styles.suppRow, { backgroundColor: c.card, borderColor: c.border }]}
                >
                  <Pressable
                    onPress={() => pushReference(s.ref)}
                    style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={[styles.suppRef, { color: c.gold }]}>
                      {formatSerialized(s.ref)}
                    </Text>
                    {s.note ? (
                      <Text style={[styles.suppNote, { color: c.mutedForeground }]} numberOfLines={3}>
                        {s.note}
                      </Text>
                    ) : null}
                  </Pressable>
                  <Pressable
                    onPress={() => removeSupplement(s.id)}
                    style={({ pressed }) => [styles.deleteIcon, { opacity: pressed ? 0.5 : 1 }]}
                  >
                    <Ionicons name="trash-outline" size={16} color={c.mutedForeground} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <View style={[styles.addSuppBox, { borderColor: c.border, backgroundColor: c.card }]}>
            <TextInput
              value={newSuppText}
              onChangeText={setNewSuppText}
              placeholder="Reference, e.g. Romans 8:28"
              placeholderTextColor={c.mutedForeground}
              autoCapitalize="words"
              style={[styles.input, { color: c.foreground, borderColor: c.border, backgroundColor: c.background }]}
            />
            <TextInput
              value={newSuppNote}
              onChangeText={setNewSuppNote}
              placeholder="Why it matters (optional)"
              placeholderTextColor={c.mutedForeground}
              multiline
              style={[styles.suppNoteInput, { color: c.foreground, borderColor: c.border, backgroundColor: c.background }]}
            />
            {suppError ? (
              <Text style={[styles.error, { color: c.destructive }]}>{suppError}</Text>
            ) : null}
            <Pressable
              onPress={addSupplement}
              style={({ pressed }) => [
                styles.suppAddBtn,
                { backgroundColor: c.gold, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="add" size={14} color={c.background} />
              <Text style={[styles.suppAddText, { color: c.background }]}>Add reference</Text>
            </Pressable>
          </View>
        </View>

        {/* Free notes */}
        <View style={{ marginTop: 22 }}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else worth remembering\u2026"
            placeholderTextColor={c.mutedForeground}
            multiline
            style={[styles.notesInput, { color: c.foreground, borderColor: c.border, backgroundColor: c.card }]}
          />
        </View>

        <SermonSummary
          input={{ title, speaker, date, passage, points, supplemental, notes }}
          saved={sermon}
          onSave={(summary) => updateSermon(sermonId, summary)}
        />

        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.delete,
            { borderColor: c.destructive + "60", opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="trash-outline" size={14} color={c.destructive} />
          <Text style={[styles.deleteText, { color: c.destructive }]}>Delete sermon</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface PointCardProps {
  point: SermonPoint;
  index: number;
  total: number;
  onUpdate: (patch: Partial<SermonPoint>) => void;
  onRemove: () => void;
  onMove: (dir: "up" | "down") => void;
  onAddSupplement: (text: string, note: string) => boolean;
  onRemoveSupplement: (sid: string) => void;
}

function PointCard({ point, index, total, onUpdate, onRemove, onMove, onAddSupplement, onRemoveSupplement }: PointCardProps) {
  const c = useColors();
  const [suppText, setSuppText] = useState("");
  const [suppNote, setSuppNote] = useState("");
  const [suppErr, setSuppErr] = useState<string | null>(null);
  const [showSuppForm, setShowSuppForm] = useState(false);

  const handleAddSupp = () => {
    if (!suppText.trim()) {
      setSuppErr("Enter a reference.");
      return;
    }
    const ok = onAddSupplement(suppText, suppNote);
    if (!ok) {
      setSuppErr("Try something like \u201cRomans 8:28\u201d.");
      return;
    }
    setSuppText("");
    setSuppNote("");
    setSuppErr(null);
    setShowSuppForm(false);
  };

  const supplements = point.supplements ?? [];

  return (
    <View style={[styles.pointCard, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Point header: badge + reorder arrows + remove */}
      <View style={styles.pointHeader}>
        <View style={[styles.pointBadge, { backgroundColor: c.gold + "25", borderColor: c.gold + "60" }]}>
          <Text style={[styles.pointBadgeText, { color: c.gold }]}>{index + 1}</Text>
        </View>
        <View style={styles.pointHeaderRight}>
          <Pressable
            onPress={() => onMove("up")}
            disabled={index === 0}
            style={({ pressed }) => [styles.arrowBtn, { opacity: index === 0 ? 0.25 : pressed ? 0.5 : 1 }]}
          >
            <Ionicons name="chevron-up" size={16} color={c.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() => onMove("down")}
            disabled={index === total - 1}
            style={({ pressed }) => [styles.arrowBtn, { opacity: index === total - 1 ? 0.25 : pressed ? 0.5 : 1 }]}
          >
            <Ionicons name="chevron-down" size={16} color={c.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={onRemove}
            style={({ pressed }) => [styles.deleteIcon, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Ionicons name="close" size={16} color={c.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <TextInput
        value={point.point}
        onChangeText={(t) => onUpdate({ point: t })}
        placeholder="The point"
        placeholderTextColor={c.mutedForeground}
        multiline
        style={[styles.pointInput, { color: c.foreground, borderColor: c.border }]}
      />
      <TextInput
        value={point.answer}
        onChangeText={(t) => onUpdate({ answer: t })}
        placeholder="The answer / what it means for you"
        placeholderTextColor={c.mutedForeground}
        multiline
        style={[styles.answerInput, { color: c.foreground, borderColor: c.border }]}
      />

      {/* Inline supplements for this point */}
      {supplements.length > 0 ? (
        <View style={[styles.pointSuppList, { borderColor: c.border }]}>
          <Text style={[styles.pointSuppLabel, { color: c.mutedForeground }]}>SUPPORTING VERSES</Text>
          {supplements.map((s) => (
            <View key={s.id} style={styles.pointSuppRow}>
              <Pressable
                onPress={() => pushReference(s.ref)}
                style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={[styles.suppRef, { color: c.gold }]}>{formatSerialized(s.ref)}</Text>
                {s.note ? (
                  <Text style={[styles.suppNote, { color: c.mutedForeground }]} numberOfLines={2}>
                    {s.note}
                  </Text>
                ) : null}
              </Pressable>
              <Pressable
                onPress={() => onRemoveSupplement(s.id)}
                style={({ pressed }) => [styles.deleteIcon, { opacity: pressed ? 0.5 : 1 }]}
              >
                <Ionicons name="trash-outline" size={14} color={c.mutedForeground} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {showSuppForm ? (
        <View style={[styles.pointSuppForm, { borderColor: c.border, backgroundColor: c.background }]}>
          <TextInput
            value={suppText}
            onChangeText={setSuppText}
            placeholder="Reference, e.g. John 1:1"
            placeholderTextColor={c.mutedForeground}
            autoCapitalize="words"
            style={[styles.input, { color: c.foreground, borderColor: c.border, backgroundColor: c.card }]}
          />
          <TextInput
            value={suppNote}
            onChangeText={setSuppNote}
            placeholder="Note (optional)"
            placeholderTextColor={c.mutedForeground}
            multiline
            style={[styles.suppNoteInput, { color: c.foreground, borderColor: c.border, backgroundColor: c.card }]}
          />
          {suppErr ? (
            <Text style={[styles.error, { color: c.destructive }]}>{suppErr}</Text>
          ) : null}
          <View style={styles.row}>
            <Pressable
              onPress={() => { setShowSuppForm(false); setSuppErr(null); }}
              style={({ pressed }) => [styles.suppCancelBtn, { borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.suppCancelText, { color: c.mutedForeground }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAddSupp}
              style={({ pressed }) => [styles.suppAddBtnSmall, { backgroundColor: c.gold, opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name="add" size={13} color={c.background} />
              <Text style={[styles.suppAddText, { color: c.background }]}>Add</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setShowSuppForm(true)}
          style={({ pressed }) => [
            styles.addSuppInlineBtn,
            { borderColor: c.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="add-circle-outline" size={13} color={c.mutedForeground} />
          <Text style={[styles.addSuppInlineText, { color: c.mutedForeground }]}>Add supporting verse</Text>
        </Pressable>
      )}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={[styles.fieldLabel, { color: c.mutedForeground }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: "row", gap: 8 },
  error: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 4 },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  openBtnText: { fontFamily: "Inter_700Bold", fontSize: 12, flex: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  addBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  pointCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
    gap: 8,
  },
  pointHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pointHeaderRight: { flexDirection: "row", alignItems: "center", gap: 2 },
  pointBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  pointBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  arrowBtn: { padding: 4 },
  pointInput: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 40,
    textAlignVertical: "top",
  },
  answerInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 60,
    textAlignVertical: "top",
  },
  pointSuppList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    gap: 6,
  },
  pointSuppLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  pointSuppRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  pointSuppForm: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    gap: 8,
  },
  addSuppInlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  addSuppInlineText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  suppRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  suppRef: { fontFamily: "Inter_700Bold", fontSize: 13 },
  suppNote: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  addSuppBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  suppNoteInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 50,
    textAlignVertical: "top",
  },
  suppAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  suppAddBtnSmall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  suppCancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  suppCancelText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  suppAddText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  notesInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 90,
    marginTop: 8,
    textAlignVertical: "top",
  },
  staleBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  staleText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 17,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    marginBottom: 12,
  },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryLabel: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" },
  summaryText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  aiBtnText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  deleteIcon: { padding: 4 },
  delete: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 28,
  },
  deleteText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
