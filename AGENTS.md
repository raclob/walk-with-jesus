# Project conventions

- Keep the editable Expo/React Native app and native Android project in `app/`.
- Keep build, release, and validation documentation in `docs/`.
- Keep versioned installable test APKs and their SHA-256 checksums in `downloads/`, so GitHub's source ZIP includes the app.
- Keep GitHub Actions workflows in `.github/workflows/` at the repository root.
- Use sequential release names `v0.001`, `v0.002`, and so on. `VERSION` is the release number without the `v` prefix. Increase it for each published APK update; retain previous versioned downloads.
- Run `npm run version:sync` from `app/` after changing `VERSION`. It synchronizes package metadata, Expo config, native Android version metadata, and the version displayed in Settings. The release sequence maps to a valid semantic app version (`0.001` -> `0.0.1`) and increasing Android version code (`1`).
- Before publishing, run `npm run version:check`, `npm run typecheck`, and an Android release build. Verify the APK signature and version metadata; update the root download link, `downloads/README.md`, `downloads/SHA256SUMS`, `docs/CHANGELOG.md`, and `docs/STATUS.md`.
- Name APKs `walk-with-jesus-v<release>.apk` and tags `v<release>`.
- Preserve application ID `com.walkwithjesus.app` and the existing development signing key for compatible test updates. Production store builds require production credentials; do not commit production keys, local SDK settings, dependencies, or build caches.
- Clearly distinguish compile/signature checks from emulator or physical-device testing. Sermon summaries are free and local: immediate extractive summaries plus optional downloaded SmolLM2 on-device AI. Never add a paid/API-key requirement or upload sermon notes without a new user request.
- Preserve pinned model revision, size, integrity checks, license notices, download consent/progress/cancel/removal, and instant offline fallback. Model weights stay outside Git and the APK; the user downloads them when enabling AI. Native AI license notices are copied into the APK by the Expo config plugin.
- Keep Bible reading, journeys, prophecies, sermon notes, summaries/on-device AI, basic progress, and the Midnight Gold and Daylight themes free. Premium is an optional one-time unlock for cosmetic themes and richer personal reading insights.
- Never grant Premium from an editable local boolean, mock checkout, or saved theme preference. Use verified store entitlements and preserve restore purchases. Display the localized price from the store; do not hardcode a price or accidentally offer a subscription. An unconfigured build must disable checkout and clearly label sample insight previews.
- Reading insights are local personal statistics. Do not send reading history or sermon notes to billing providers or add developer analytics without a new user request. Preserve old progress without inventing historical reading dates.
