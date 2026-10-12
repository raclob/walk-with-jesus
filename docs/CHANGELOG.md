# Changelog

## v0.004 — 2026-10-12

- Added free Midnight Gold and Daylight app themes, plus previewable Premium Still Forest, Quiet Waters, and Evening Plum themes.
- Added an optional one-time Premium upgrade screen and Google Play/RevenueCat purchase and restore integration. Checkout stays disabled in this test build until store configuration is supplied; no pretend unlocks or hardcoded prices.
- Added private personal reading insight charts with clearly labeled sample previews for free users. New dated chapter-read history preserves older progress; prestige retains it and resetting progress clears it.
- Kept all existing core features and on-device AI free, with basic progress unchanged.
- Added automated entitlement, payment-boundary, theme, history-migration, and palette checks, plus store setup and privacy documentation.
- Updated synchronized release metadata to v0.004 / Android code 4.


## v0.003 — 2026-10-11

- Preserve note fragments separated by newlines in the instant offline summary, including lines without sentence punctuation.
- Added a regression check for multiline sermon notes; retains the free on-device AI introduced in v0.002.
- Updated synchronized release metadata to v0.003 / Android code 3.

## v0.002 — 2026-10-11

- Added free, private sermon summaries with no API key, subscription, or backend.
- Optional SmolLM2-360M-Instruct Q4_K_M runs on-device after a roughly 270 MB download.
- Instant extractive summaries work without a model or internet and preserve the supplied notes and references.
- Added download progress, integrity checks, cancellation, model removal, and native-memory cleanup.
- Saved summaries retain their source and the notes snapshot, so edits remain visibly stale even after restarting.
- Included model/runtime license notices and compressed native library packaging.
- Updated synchronized release metadata to v0.002 / Android code 2.

Desktop sample model inference and automated logic checks pass. Phone inference, performance, and lifecycle testing remain pending.

## v0.001 — 2026-10-11

- Initial Android test release of Walk with Jesus, preserving Bible reading, journeys, prophecies, progress, and sermon notes.
- Bundled KJV text works offline; optional online translations are cached after reading.
- Removed 19 unused font assets.
- Clarified that the provider's Young's Literal Translation covers the New Testament only; unavailable Old Testament chapters show guidance.
- Organized source in `app/`, documentation in `docs/`, and versioned APKs in `downloads/`.
- Added synchronized release numbering and Android build automation.

Compilation and APK verification pass. Physical-device acceptance testing and live sermon AI testing remain pending.
