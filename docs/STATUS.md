# Android test release status — 2026-10-11 (America/New_York)

## Verified

- Reproducible dependency installation and Expo SDK compatibility.
- TypeScript validation and production Metro/Hermes Android export.
- All seven original font registrations retained; 19 unused font files removed, reducing bundled assets from 71 to 52.
- Bundled KJV integrity: 66 books, 1,189 chapters, and 31 verses in Genesis 1.
- Live Genesis 1 requests for WEB, ASV, BBE, and Darby return 31 verses each.
- The provider catalog identifies YLT as New Testament only; Matthew 1 returns 25 verses. Unsupported Old Testament chapters are rejected locally with guidance; supported chapters still load from cache.
- Source organized under `app/`, with root workflows and separate `docs/` and `downloads/`.
- Release metadata synchronized from `VERSION`, including the version displayed in Settings.
- Instant summaries preserve provided notes and scripture references. Automated tests cover empty/long notes, missing models, storage errors, checksum failures, cancellation, concurrent requests, native context cleanup, and model removal.
- Pinned SmolLM2 weights verified against their published SHA-256 and tested through desktop llama.cpp with sample sermon notes.
- Model/runtime license notices included in Android assets; model weights remain outside the APK.

## APK

The v0.003 ARM64 release build succeeds with JDK 17, SDK 36, and Gradle 8.14.3. APK signature and ZIP alignment checks pass. All 37 packaged ARM64 native libraries have 16 KB ELF segment alignment.

`downloads/walk-with-jesus-v0.003.apk` is 60,632,405 bytes (57.8 MiB). Embedded config reports release `0.003`; Android reports version `0.0.3`, code `3`, package `com.walkwithjesus.app`, minimum SDK 24, and target SDK 36. The APK contains the local AI runtime and license notices. Model weights are downloaded separately when enabled.

## Still to test

No emulator or physical phone was available for runtime acceptance testing. Check onboarding; Bible/search/chapter navigation; Android Back and modal dismissal; mark-read persistence after relaunch; sermon edits followed immediately by Back; keyboard resizing; chapter text themes; large system fonts; gesture and three-button navigation; offline KJV reading; online translation failures and recovery.

Real-phone AI inference, speed/memory behavior, model download, cancel/remove, backgrounding, restart persistence, and summary quality have not yet been verified. The AI feature needs no backend. Online translation checks cover the sample chapters above, rather than every book.

## Distribution

This is a development-signed test release, not a Play Store publication. Progress, preferences, and sermon notes are local to the device; uninstalling may remove them. A web/Replit installation's saved data is not automatically migrated.
