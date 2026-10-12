import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import type { LlamaContext } from "llama.rn";
import { prepareAiNotes, SUMMARY_SYSTEM_PROMPT, type SummaryInput } from "./summaryText";

export const AI_MODEL = {
  name: "SmolLM2-360M-Instruct",
  bytes: 270590880,
  md5: "8fb47ed2f7efaa6ca1547ef37bee2c8c",
  sha256: "2fa3f013dcdd7b99f9b237717fa0b12d75bbb89984cc1274be1471a465bac9c2",
  url: "https://huggingface.co/bartowski/SmolLM2-360M-Instruct-GGUF/resolve/7be6f65f1db715fe5dc5a4634c0d459b4eed42ec/SmolLM2-360M-Instruct-Q4_K_M.gguf",
};

type Phase = "checking" | "missing" | "ready" | "downloading" | "loading" | "generating" | "stopping";
export interface AiState { phase: Phase; progress: number; error?: string }
let state: AiState = { phase: "checking", progress: 0 };
const listeners = new Set<() => void>();
let transfer: { task: FileSystem.DownloadResumable; cancelled: boolean } | undefined;
let generation: { cancelled: boolean; context?: LlamaContext } | undefined;
const directory = FileSystem.cacheDirectory ? FileSystem.cacheDirectory + "sermon-ai/" : undefined;
const modelPath = directory ? directory + "smollm2-360m-q4-k-m.gguf" : undefined;

export const getAiState = () => state;
export const subscribeAi = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
function update(next: AiState) { state = next; for (const listener of listeners) listener(); }
export const isAiBusy = () => !!(transfer || generation);

async function modelExists() {
  if (!modelPath || Platform.OS !== "android") return false;
  const file = await FileSystem.getInfoAsync(modelPath);
  return file.exists && !file.isDirectory && file.size === AI_MODEL.bytes;
}

export async function refreshAiStatus() {
  if (isAiBusy()) return;
  try {
    const ready = await modelExists();
    if (!isAiBusy()) update({ phase: ready ? "ready" : "missing", progress: 0 });
  } catch {
    if (!isAiBusy()) update({ phase: "missing", progress: 0 });
  }
}

export async function downloadAiModel() {
  if (isAiBusy()) throw new Error("Another AI task is already running.");
  if (!directory || !modelPath || Platform.OS !== "android") throw new Error("On-device AI is available in the Android app. Offline summaries work here.");
  const partial = modelPath + ".part";
  const task = FileSystem.createDownloadResumable(AI_MODEL.url, partial, {}, progress => {
    const ratio = Math.min(1, progress.totalBytesWritten / AI_MODEL.bytes);
    if (state.phase === "downloading" && Math.floor(ratio * 100) !== Math.floor(state.progress * 100)) update({ phase: "downloading", progress: ratio });
  });
  const job = { task, cancelled: false };
  let failureMessage: string | undefined;
  transfer = job;
  update({ phase: "downloading", progress: 0 });
  try {
    const free = await FileSystem.getFreeDiskStorageAsync();
    if (free < AI_MODEL.bytes + 128 * 1024 * 1024) throw new Error("Free at least 400 MB of storage, or use the offline summary without a download.");
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    await FileSystem.deleteAsync(partial, { idempotent: true });
    if (job.cancelled) throw new Error("Download canceled.");
    const result = await task.downloadAsync();
    if (job.cancelled || !result) throw new Error("Download canceled.");
    if (result.status !== 200) throw new Error("The model download failed. Please try again on Wi-Fi.");
    const file = await FileSystem.getInfoAsync(partial, { md5: true });
    if (!file.exists || file.isDirectory || file.size !== AI_MODEL.bytes || file.md5 !== AI_MODEL.md5) throw new Error("The download was incomplete or damaged. Please try again.");
    if (job.cancelled) throw new Error("Download canceled.");
    await FileSystem.moveAsync({ from: partial, to: modelPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    failureMessage = job.cancelled ? undefined : /^(Free at least|The model download|The download was)/.test(message) ? message : "Could not download the AI model. Try again on Wi-Fi; offline summaries are still available.";
    throw error;
  } finally {
    await FileSystem.deleteAsync(partial, { idempotent: true }).catch(() => {});
    const ready = await modelExists().catch(() => false);
    transfer = undefined;
    update({ phase: ready ? "ready" : "missing", progress: 0, error: failureMessage });
  }
}

export async function cancelAiDownload() {
  if (!transfer) return;
  transfer.cancelled = true;
  await transfer.task.cancelAsync().catch(() => {});
}

export async function removeAiModel() {
  if (isAiBusy()) throw new Error("Wait for the current AI task to finish.");
  if (directory) await FileSystem.deleteAsync(directory, { idempotent: true });
  update({ phase: "missing", progress: 0 });
}

export async function stopAiSummary() {
  if (!generation) return;
  generation.cancelled = true;
  update({ phase: "stopping", progress: 0 });
  await generation.context?.stopCompletion().catch(() => {});
}

export async function generateAiSummary(input: SummaryInput): Promise<{ text: string; truncated: boolean }> {
  if (isAiBusy()) throw new Error("Another AI task is already running.");
  const job: { cancelled: boolean; context?: LlamaContext } = { cancelled: false };
  generation = job;
  update({ phase: "loading", progress: 0 });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (!(await modelExists()) || !modelPath) throw new Error("Download the free AI model first, or use the offline summary.");
    if (job.cancelled) throw new Error("Summary canceled.");
    const { initLlama } = await import("llama.rn");
    job.context = await initLlama({ model: modelPath, n_ctx: 2048, n_batch: 128, n_ubatch: 128, n_parallel: 1, n_threads: 2, n_gpu_layers: 0, use_mmap: true, use_mlock: false });
    if (job.cancelled) throw new Error("Summary canceled.");
    const prepared = prepareAiNotes(input);
    let text = prepared.text;
    let truncated = prepared.truncated;
    let prompt = "";
    while (true) {
      prompt = (await job.context.getFormattedChat([{ role: "system", content: SUMMARY_SYSTEM_PROMPT }, { role: "user", content: "Summarize these sermon notes in three short bullet points:\n\n" + text }])).prompt;
      if ((await job.context.tokenize(prompt)).tokens.length <= 1500) break;
      text = text.slice(0, Math.floor(text.length * 0.75));
      truncated = true;
      if (text.length < 100) throw new Error("These notes could not fit in the on-device AI. Use the offline summary instead.");
    }
    if (job.cancelled) throw new Error("Summary canceled.");
    update({ phase: "generating", progress: 0 });
    timer = setTimeout(() => { void stopAiSummary(); }, 120000);
    const result = await job.context.completion({ prompt, n_predict: 240, temperature: 0.2, seed: 42, penalty_repeat: 1.1, stop: ["<|im_end|>", "<|endoftext|>"] });
    if (job.cancelled) throw new Error("Summary stopped. You can use the instant offline summary instead.");
    if (result.text.trim().length < 15) throw new Error("The AI did not produce a useful summary. Try the offline summary instead.");
    return { text: result.text.trim(), truncated };
  } finally {
    if (timer) clearTimeout(timer);
    await job.context?.release().catch(() => {});
    const ready = await modelExists().catch(() => false);
    generation = undefined;
    update({ phase: ready ? "ready" : "missing", progress: 0 });
  }
}
