const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const modules = new Map();
const files = new Map();
let badChecksum = false;
let lowStorage = false;
let holdDownload = false;
let resolveDownload;
let released = 0;
let stopped = 0;
let holdCompletion = false;
let resolveCompletion;

const disk = {
  cacheDirectory: 'file:///cache/',
  getInfoAsync: async file => files.has(file) ? { exists: true, isDirectory: false, ...files.get(file) } : { exists: false },
  getFreeDiskStorageAsync: async () => lowStorage ? 1 : 1024 * 1024 * 1024,
  makeDirectoryAsync: async () => {},
  deleteAsync: async file => { for (const key of [...files.keys()]) if (key.startsWith(file)) files.delete(key); },
  moveAsync: async ({ from, to }) => { files.set(to, files.get(from)); files.delete(from); },
  createDownloadResumable: (url, file, options, progress) => ({
    downloadAsync: async () => {
      if (holdDownload) return await new Promise(resolve => { resolveDownload = resolve; });
      assert.match(url, /^https:\/\/huggingface.co\/bartowski\//);
      files.set(file, { size: 270590880, md5: badChecksum ? 'damaged' : '8fb47ed2f7efaa6ca1547ef37bee2c8c' });
      progress({ totalBytesWritten: 270590880 });
      return { status: 200 };
    },
    cancelAsync: async () => { resolveDownload?.(undefined); },
  }),
};
const native = {
  initLlama: async () => ({
    getFormattedChat: async messages => ({ prompt: messages.map(m => m.content).join('\n') }),
    tokenize: async prompt => ({ tokens: new Array(Math.ceil(prompt.length / 3)).fill(1) }),
    completion: async () => holdCompletion ? await new Promise(resolve => { resolveCompletion = resolve; }) : { text: '• Compassion crosses social boundaries.\n• Mercy costs time and resources.' },
    stopCompletion: async () => { stopped++; resolveCompletion?.({ text: 'partial' }); },
    release: async () => { released++; },
  }),
};

function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} }; modules.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const resolve = name => {
    if (name === 'expo-file-system/legacy') return disk;
    if (name === 'react-native') return { Platform: { OS: 'android' } };
    if (name === 'llama.rn') return native;
    if (name.startsWith('.') || name.startsWith('@/')) return load(path.resolve(name.startsWith('@/') ? root : path.dirname(file), name.replace(/^@\//, '')) + '.ts');
    throw new Error(`Unexpected dependency: ${name}`);
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: resolve, console, setTimeout, clearTimeout, fetch: () => { throw new Error('Sermon text must never be sent over the network'); } }, { filename: file });
  return module.exports;
}

const text = load(path.join(root, 'services/summaryText.ts'));
const ai = load(path.join(root, 'services/offlineAi.ts'));
const input = { title: 'Compassion', date: '2026-10-11', passage: { bookId: 'luke', chapter: 10, verseStart: 25, verseEnd: 37 }, points: [{ point: 'Mercy costs time and resources.', answer: '' }], supplemental: [], notes: 'Compassion crosses social boundaries. The Samaritan stopped and helped the injured man.' };
const pause = () => new Promise(resolve => setImmediate(resolve));

(async () => {
  assert.throws(() => text.buildOfflineSummary({ ...input, points: [], notes: '' }), /Add sermon notes/);
  const summary = text.buildOfflineSummary(input);
  assert.match(summary, /Mercy costs time and resources\./);
  assert.match(summary, /Luke 10:25-37/);
  assert.ok(!summary.includes('John 3:16'), 'Never invent scripture references');
  const fragments = text.buildOfflineSummary({ ...input, points: [], notes: 'Compassion crosses boundaries\nMercy costs time\nHelp a neighbor this week' });
  assert.match(fragments, /Compassion crosses boundaries/);
  assert.match(fragments, /Mercy costs time/);
  assert.match(fragments, /Help a neighbor this week/);
  assert.equal(text.prepareAiNotes(input).truncated, false);
  assert.equal(text.prepareAiNotes({ ...input, notes: input.notes.repeat(200) }).truncated, true);
  assert.ok(text.prepareAiNotes({ ...input, notes: input.notes.repeat(200) }).text.length <= 5000);
  await ai.refreshAiStatus(); assert.equal(ai.getAiState().phase, 'missing');
  await assert.rejects(ai.generateAiSummary(input), /Download the free AI model/);

  lowStorage = true;
  await assert.rejects(ai.downloadAiModel(), /Free at least 400 MB/);
  lowStorage = false;
  badChecksum = true;
  await assert.rejects(ai.downloadAiModel(), /incomplete or damaged/);
  assert.equal(files.size, 0, 'A corrupted model is removed');
  badChecksum = false;
  holdDownload = true;
  const pendingDownload = ai.downloadAiModel();
  const cancelledDownload = assert.rejects(pendingDownload, /Download canceled/);
  await pause();
  await ai.cancelAiDownload(); await cancelledDownload;
  assert.equal(ai.getAiState().phase, 'missing');
  assert.equal(ai.getAiState().error, undefined);
  holdDownload = false;
  await ai.downloadAiModel(); assert.equal(ai.getAiState().phase, 'ready');
  const generated = await ai.generateAiSummary(input);
  assert.match(generated.text, /Compassion/);
  assert.equal(released, 1, 'Native memory is released after generating');
  holdCompletion = true;
  const pending = ai.generateAiSummary(input);
  const cancelledSummary = assert.rejects(pending, /Summary stopped/);
  await pause();
  await assert.rejects(ai.generateAiSummary(input), /already running/);
  await ai.stopAiSummary(); await cancelledSummary;
  assert.equal(stopped, 1);
  assert.equal(released, 2, 'Native memory is released after cancellation');
  assert.equal(ai.getAiState().phase, 'ready');
  await ai.removeAiModel(); assert.equal(files.size, 0);
  assert.equal(ai.getAiState().phase, 'missing');
  console.log('Summary checks passed: faithful offline extracts, empty/long notes, missing model, storage failure, corrupt download, cancellation, native cleanup, and model removal.');
})().catch(error => { console.error(error); process.exitCode = 1; });
