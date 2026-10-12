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

## APK

The organized repository's ARM64 release build succeeds with JDK 17, SDK 36, and Gradle 8.14.3. APK signature verification and 16 KB native-library ZIP alignment checks pass.

`downloads/walk-with-jesus-v0.001.apk` is a 40.7 MiB development-signed test APK. Its embedded Expo config reports release `0.001`; Android metadata reports version `0.0.1`, code `1`, package `com.walkwithjesus.app`, minimum SDK 24, target SDK 36, and ARM64. The compiled app bundle is embedded, so no Metro development server is needed.

## Still to test

No emulator or physical phone was available for runtime acceptance testing. Check onboarding; Bible/search/chapter navigation; Android Back and modal dismissal; mark-read persistence after relaunch; sermon edits followed immediately by Back; keyboard resizing; chapter text themes; large system fonts; gesture and three-button navigation; offline KJV reading; online translation failures and recovery.

Live sermon AI was not tested because no backend deployment URL was supplied. Online translation checks cover the sample chapters above, rather than every book.

## Distribution

This is a development-signed test release, not a Play Store publication. Progress, preferences, and sermon notes are local to the device; uninstalling may remove them. A web/Replit installation's saved data is not automatically migrated.
