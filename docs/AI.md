# Free on-device summaries

Walk with Jesus offers two free summary options in each sermon. Neither needs an account, subscription, provider API key, or backend.

## Instant offline summary

**Summarize offline** selects important sentences from the saved notes, includes the supplied main points, and preserves the supplied scripture references. This is an extractive summary, not a language model. It works immediately without internet or a model download and does not invent new passages or teachings.

## Optional on-device AI

**Download free AI model** downloads SmolLM2-360M-Instruct, quantized as Q4_K_M, from a public Hugging Face model repository. The download is 270,590,880 bytes (about 270 MB / 258 MiB); Wi-Fi is recommended. No model file is included in the APK or Git history.

The model runs on the phone using `llama.rn` and `llama.cpp`. Notes are not uploaded. CPU inference uses a 2,048-token context and limits generated output; long sermons use excerpts. The native context is released after completion or cancellation. Generation can be stopped and is stopped after two minutes if it has not finished. Leaving the sermon or backgrounding the app stops the current summary/download.

Saved summaries and notes stay in the existing local sermon store. The model lives in the app's cache and can be removed without deleting notes or summaries. Android may clear cached weights when storage is low; the app then offers a download again. Failed downloads remove incomplete files, and the instant summary remains available.

This compact English model has limited capability, can repeat notes, omit details, or make mistakes. Review AI summaries against the original notes. It is not a source of new Bible quotations or authoritative theological advice. Older phones may be slow or unable to load it; use the instant summary in that case.

## Model and distribution details

- Base model: [HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct), Apache License 2.0.
- Quantization: [bartowski/SmolLM2-360M-Instruct-GGUF](https://huggingface.co/bartowski/SmolLM2-360M-Instruct-GGUF), `SmolLM2-360M-Instruct-Q4_K_M.gguf`.
- Pinned revision: `7be6f65f1db715fe5dc5a4634c0d459b4eed42ec`.
- SHA-256 verified during development: `2fa3f013dcdd7b99f9b237717fa0b12d75bbb89984cc1274be1471a465bac9c2`.
- The app checks expected size and native streaming MD5 (`8fb47ed2f7efaa6ca1547ef37bee2c8c`) before installing a download. The pinned HTTPS URL and checksum detect incomplete/corrupt transfers; MD5 is not a tamper-proof authenticity scheme.
- Runtime: `llama.rn` 0.12.9 and its `llama.cpp` implementation, MIT licensed.
- License notices are in `app/licenses/` and copied into the APK by the Expo plugin. Model weights are not modified by this app; the downloaded file is the published quantization.

There are no per-summary API fees. The initial model download still uses the user's internet connection and storage. Public hosting availability is external to the app; an unavailable model host does not disable the instant offline summary.

## Verification

`npm run test:summaries` checks extractive summaries, provided scripture references, empty/long notes, missing weights, storage errors, corrupt downloads, cancellation, concurrency, native cleanup, and model removal using mocked native/file-system boundaries.

The actual pinned weights were downloaded and verified, then tested with sample sermon notes through desktop `llama.cpp`. This demonstrates desktop model loading and generation, not Android runtime performance. Android compilation and APK validation are separate checks. Real-phone download, inference, low-memory behavior, backgrounding, cancellation, and summary quality still need testing.
