# Walk with Jesus for Android

**[Download Walk with Jesus v0.004](https://github.com/raclob/walk-with-jesus/raw/refs/heads/main/downloads/walk-with-jesus-v0.004.apk)**

[APK file page](downloads/walk-with-jesus-v0.004.apk) · [Release v0.004](https://github.com/raclob/walk-with-jesus/releases/tag/v0.004)

A freemium Bible reading and study app with free midnight-and-gold and daylight themes, offline KJV text, reading journeys, prophecy discoveries, progress tracking, and sermon notes.

## Install on your phone

1. Download the APK on your Android phone.
2. Open it and allow installation from your browser or file manager if Android asks.
3. Launch **Walk with Jesus** and choose your reading journey.

Requires Android 7.0+ on an ARM64 phone. This is a development-signed test release. Compilation and APK checks pass; installation and behavior on a real device still need testing. Sermon summaries are free: use the instant offline summary, or download the optional on-device AI model. No account, API key, subscription, or backend is needed.

## Features

- Read all 66 books of the KJV offline, with Bible browsing and reference search.
- Follow canonical or chronological reading journeys.
- Discover prophecies and follow their fulfillment.
- Track chapter completion, reading streaks, heat maps, milestones, and prestige.
- Save sermon notes, main points, and linked scripture references.
- Summarize notes for free on your phone. The instant summary requires no download; optional SmolLM2 AI needs about 270 MB once and works offline afterward.
- Switch to supported online public-domain translations, cached after reading. The provider's YLT covers the New Testament only.
- Preview optional Premium themes and private personal reading insights. Core features, basic progress, and on-device AI stay free.

Reading progress, preferences, and sermons are stored on your device. Existing web/Replit data is not automatically transferred. Uninstalling may remove saved data.

## Optional Premium

Premium is designed as a one-time unlock for three extra app themes and richer personal reading statistics. The v0.004 APK includes theme and sample-insight previews; **checkout is disabled until Google Play products and RevenueCat are configured**. This release takes no payments. Prices will come from the store.

Bible reading, journeys, prophecies, sermon notes, summaries/on-device AI, existing progress and streaks, and the Midnight Gold and Daylight themes remain free. Personal reading statistics stay on the device. Daily history starts with newly recorded chapter reads; older progress is preserved without inventing dates.

See [store setup and feature details](docs/MONETIZATION.md) and [privacy information](docs/PRIVACY.md). [Appearance](docs/screenshots/appearance-preview.png), [Premium](docs/screenshots/premium-preview.png), and [insight](docs/screenshots/insights-preview.png) screenshots show the browser preview at phone width; Android device testing is still pending.

## Repository layout

| Folder | Contents |
| --- | --- |
| [app/](app/) | Expo/React Native source, Bible data, assets, and native Android project |
| [docs/](docs/) | Build guide, versioning, changelog, and validation status |
| [downloads/](downloads/) | Versioned installable APKs and SHA-256 checksums |
| [.github/](.github/) | Android build automation |

GitHub's **Code → Download ZIP** includes the installable APK in `downloads/`.

The current release is **v0.004**; releases increase sequentially from v0.001. [VERSION](VERSION) is the source of truth; [versioning instructions](docs/VERSIONING.md) explain how it stays synchronized with Settings and Android updates. Future changes should follow [AGENTS.md](AGENTS.md).

For development:

```sh
cd app
npm ci
npm run version:check
npm run typecheck
npm start
```

Read the [build guide](docs/BUILD.md), [changelog](docs/CHANGELOG.md), and [validation status](docs/STATUS.md), and [free on-device AI](docs/AI.md).
