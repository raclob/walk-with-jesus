# Versioning

Release numbering follows `v0.001`, `v0.002`, and so on. The root `VERSION` file is the source of truth. Use the same number for the Git tag, APK filename, changelog entry, and version displayed in Settings.

Android and npm use valid semantic versions internally. Release `v0.001` maps to app version `0.0.1` and Android version code `1`; `v0.002` maps to `0.0.2` and code `2`. The increasing code lets Android accept compatible updates signed with the same key.

For a new release:

1. Increase the root `VERSION` number.
2. From `app/`, run `npm run version:sync` and `npm run version:check`.
3. Complete the checks in [BUILD.md](BUILD.md) and compile the APK.
4. Copy the verified APK into `downloads/walk-with-jesus-v<version>.apk`. Preserve prior versioned files.
5. Add its SHA-256 to `downloads/SHA256SUMS`; update the download links, changelog, and validation status.
6. Commit the source and APK together, tag that commit `v<version>`, and create the matching GitHub release.
7. Confirm the **Publish APK download** workflow succeeded and the APK and `SHA256SUMS` appear under the release's Assets. Use the direct `releases/download/v<version>/walk-with-jesus-v<version>.apk` URL for download buttons. If the release was created after the workflow's wait period, run that workflow manually. Keep the repository copy as a fallback.

The initial APK is a development-signed ARM64 test build. Preserve the signing key for compatible test updates. Production distribution has a separate signing process.
