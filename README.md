# Walk with Jesus for Android

**[Download Walk with Jesus v0.001](https://github.com/raclob/walk-with-jesus/raw/refs/heads/main/downloads/walk-with-jesus-v0.001.apk)**

[APK file page](downloads/walk-with-jesus-v0.001.apk) · [Release v0.001](https://github.com/raclob/walk-with-jesus/releases/tag/v0.001)

A Bible reading and study app with a midnight-and-gold theme, offline KJV text, reading journeys, prophecy discoveries, progress tracking, and sermon notes.

## Install on your phone

1. Download the APK on your Android phone.
2. Open it and allow installation from your browser or file manager if Android asks.
3. Launch **Walk with Jesus** and choose your reading journey.

Requires Android 7.0+ on an ARM64 phone. This is a development-signed test release. Compilation and APK checks pass; installation and behavior on a real device still need testing. AI sermon summaries require a configured backend; sermon notes work without one.

## Features

- Read all 66 books of the KJV offline, with Bible browsing and reference search.
- Follow canonical or chronological reading journeys.
- Discover prophecies and follow their fulfillment.
- Track chapter completion, reading streaks, heat maps, milestones, and prestige.
- Save sermon notes, main points, and linked scripture references.
- Switch to supported online public-domain translations, cached after reading. The provider's YLT covers the New Testament only.

Reading progress, preferences, and sermons are stored on your device. Existing web/Replit data is not automatically transferred. Uninstalling may remove saved data.

## Repository layout

| Folder | Contents |
| --- | --- |
| [app/](app/) | Expo/React Native source, Bible data, assets, and native Android project |
| [docs/](docs/) | Build guide, versioning, changelog, and validation status |
| [downloads/](downloads/) | Versioned installable APKs and SHA-256 checksums |
| [.github/](.github/) | Android build automation |

GitHub's **Code → Download ZIP** includes the installable APK in `downloads/`.

Release numbering starts at **v0.001** and increases sequentially. [VERSION](VERSION) is the source of truth; [versioning instructions](docs/VERSIONING.md) explain how it stays synchronized with Settings and Android updates. Future changes should follow [AGENTS.md](AGENTS.md).

For development:

```sh
cd app
npm ci
npm run version:check
npm run typecheck
npm start
```

Read the [build guide](docs/BUILD.md), [changelog](docs/CHANGELOG.md), and [validation status](docs/STATUS.md).
