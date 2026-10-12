import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ActivityIndicator, AppState, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { SermonLog } from "@/contexts/SermonContext";
import { useColors } from "@/hooks/useColors";
import { AI_MODEL, cancelAiDownload, downloadAiModel, generateAiSummary, getAiState, refreshAiStatus, removeAiModel, stopAiSummary, subscribeAi } from "@/services/offlineAi";
import { buildOfflineSummary, hasSummaryContent, type SummaryInput } from "@/services/summaryText";

type SummaryFields = Pick<SermonLog, "aiSummary" | "aiSummaryGeneratedAt" | "summarySource" | "summaryInputSnapshot" | "summaryInputTruncated" | "summaryModel">;

export function SermonSummary({ input, saved, onSave }: { input: SummaryInput; saved: SummaryFields; onSave: (summary: SummaryFields) => void }) {
  const c = useColors();
  const ai = useSyncExternalStore(subscribeAi, getAiState, getAiState);
  const [error, setError] = useState<string>();
  const alive = useRef(true);
  const ownsDownload = useRef(false);
  const ownsGeneration = useRef(false);
  const snapshot = JSON.stringify(input);
  const busy = ["downloading", "loading", "generating", "stopping"].includes(ai.phase);
  const hasContent = hasSummaryContent(input);
  const stale = !!saved.summaryInputSnapshot && saved.summaryInputSnapshot !== snapshot;

  useEffect(() => {
    alive.current = true;
    void refreshAiStatus();
    const subscription = AppState.addEventListener("change", next => {
      if (next !== "active") {
        if (ownsGeneration.current) void stopAiSummary();
        if (ownsDownload.current) void cancelAiDownload();
      } else void refreshAiStatus();
    });
    return () => {
      alive.current = false;
      subscription.remove();
      if (ownsGeneration.current) void stopAiSummary();
      if (ownsDownload.current) void cancelAiDownload();
    };
  }, []);

  function save(text: string, source: "offline" | "local-ai", captured: string, truncated = false) {
    onSave({ aiSummary: text, aiSummaryGeneratedAt: Date.now(), summarySource: source, summaryInputSnapshot: captured, summaryInputTruncated: truncated, summaryModel: source === "local-ai" ? AI_MODEL.name : undefined });
  }

  async function generate() {
    if (ownsGeneration.current || busy) return;
    const captured = snapshot;
    setError(undefined);
    ownsGeneration.current = true;
    try {
      const result = await generateAiSummary(input);
      if (alive.current) save(result.text, "local-ai", captured, result.truncated);
    } catch (failure) {
      if (alive.current) {
        const message = failure instanceof Error ? failure.message : "";
        setError(/^(Download the free|Add sermon|Summary (canceled|stopped)|These notes|The AI did not|Another AI task)/.test(message) ? message : "AI could not run on this phone. Use the offline summary instead.");
      }
    } finally { ownsGeneration.current = false; }
  }

  async function download() {
    if (ownsDownload.current || busy) return;
    setError(undefined);
    ownsDownload.current = true;
    try { await downloadAiModel(); }
    catch { /* The shared download state reports errors and cancellation. */ }
    finally { ownsDownload.current = false; }
  }

  function offline() {
    setError(undefined);
    try { save(buildOfflineSummary(input), "offline", snapshot); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Add notes or main points first."); }
  }

  const phaseLabel = ai.phase === "loading" ? "Loading AI on your phone…" : ai.phase === "stopping" ? "Stopping…" : "Summarizing on your phone…";
  const label = saved.summarySource === "local-ai" ? "On-device AI summary" : saved.summarySource === "offline" ? "Offline summary · selected from your notes" : "Saved summary";

  function button(title: string, icon: React.ComponentProps<typeof Ionicons>["name"], action: () => void, disabled = false) {
    return <Pressable onPress={action} disabled={disabled} accessibilityRole="button" style={({ pressed }) => [styles.button, { borderColor: c.gold + "80", backgroundColor: c.gold + "14", opacity: disabled || pressed ? 0.55 : 1 }]}><Ionicons name={icon} size={16} color={c.gold} /><Text style={[styles.buttonText, { color: c.gold }]}>{title}</Text></Pressable>;
  }

  return <View style={styles.container}>
    <Text style={[styles.heading, { color: c.foreground }]}>Sermon summary</Text>
    <Text style={[styles.help, { color: c.mutedForeground }]}>Free. Your notes stay on this phone. Choose an instant offline summary or optional on-device AI.</Text>
    {!hasContent ? <Text style={[styles.help, { color: c.mutedForeground }]}>Add notes or main points to summarize.</Text> : null}
    {stale && saved.aiSummary ? <Text style={[styles.help, { color: c.gold }]}>Your notes have changed. Generate a new summary to update it.</Text> : null}
    {saved.aiSummary ? <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <Text style={[styles.label, { color: c.gold }]}>{label}</Text>
      <Text selectable style={[styles.summary, { color: c.foreground }]}>{saved.aiSummary}</Text>
      {saved.summarySource === "local-ai" ? <Text style={[styles.help, { color: c.mutedForeground }]}>AI can make mistakes. Review this against your notes.{saved.summaryInputTruncated ? " Excerpts were used to fit long notes." : ""}</Text> : null}
    </View> : null}
    {button(saved.aiSummary ? "Refresh offline summary" : "Summarize offline", "document-text-outline", offline, ["loading", "generating", "stopping"].includes(ai.phase) || !hasContent)}
    {Platform.OS === "android" ? <View style={[styles.card, { borderColor: c.border, backgroundColor: c.card }]}>
      <Text style={[styles.label, { color: c.foreground }]}>Optional free AI · {AI_MODEL.name}</Text>
      <Text style={[styles.help, { color: c.mutedForeground }]}>Download about 270 MB once, then summarize without internet. Wi-Fi recommended. Older phones may be slow; the offline option needs no model.</Text>
      {ai.phase === "ready" ? <>
        {button("Summarize with on-device AI", "sparkles-outline", () => { void generate(); }, !hasContent)}
        {button("Remove AI download", "trash-outline", () => { void removeAiModel().catch(() => setError("Could not remove the model. Try again.")); })}
      </> : ai.phase === "downloading" ? <>
        <Text accessibilityLiveRegion="polite" style={[styles.help, { color: c.gold }]}>Downloading {Math.round(ai.progress * 100)}%</Text>
        {button("Cancel download", "close-outline", () => { void cancelAiDownload(); })}
      </> : ["loading", "generating", "stopping"].includes(ai.phase) ? <>
        <View style={styles.progress}><ActivityIndicator color={c.gold} /><Text accessibilityLiveRegion="polite" style={[styles.help, { color: c.gold }]}>{phaseLabel}</Text></View>
        {button("Stop AI summary", "stop-outline", () => { void stopAiSummary(); }, ai.phase === "stopping")}
      </> : button(ai.phase === "checking" ? "Checking AI download…" : "Download free AI model · 270 MB", "cloud-download-outline", () => { void download(); }, ai.phase === "checking")}
      <Text style={[styles.help, { color: c.mutedForeground }]}>Model by Hugging Face, Apache 2.0. No subscription or API key. Your phone may clear the model cache when storage is low; saved notes and summaries are kept.</Text>
    </View> : null}
    {error || ai.error ? <Text accessibilityRole="alert" style={[styles.help, { color: c.destructive }]}>{error ?? ai.error}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { marginTop: 28, gap: 10 },
  heading: { fontFamily: "Inter_700Bold", fontSize: 18 },
  help: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 14, gap: 10 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  summary: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  button: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", gap: 9 },
  buttonText: { fontFamily: "Inter_600SemiBold", fontSize: 13, flexShrink: 1 },
  progress: { flexDirection: "row", alignItems: "center", gap: 10 },
});
