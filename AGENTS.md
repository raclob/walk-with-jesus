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
- Clearly distinguish compile/signature checks from emulator or physical-device testing. Sermon AI remains optional and needs a configured HTTPS backend; never put provider API keys in the app.
