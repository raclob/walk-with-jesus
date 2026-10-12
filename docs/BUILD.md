# Build and run

## Requirements

- Node.js 22 LTS (used by CI).
- JDK 17, including the Java compiler. Set `JAVA_HOME` to that installation.
- Android SDK platform 36, build tools 36.0.0, and platform tools. Set `ANDROID_HOME` to the SDK directory.
- Native builds also use NDK 27.1.12297006 and CMake 3.22.1. Gradle can install them after SDK licenses are accepted.

Run npm commands from the repository's `app/` folder:

```sh
cd app
npm ci
npm run version:check
npm run typecheck
npm run export:android
```

For development, use `npm start` and `npm run android` with an emulator or connected phone.

## Local Android APK

From `app/`:

```sh
npm run prebuild:android
npm run version:check
cd android
./gradlew assembleRelease --no-daemon --max-workers=2 -PreactNativeArchitectures=arm64-v8a
```

On Windows, use `gradlew.bat`. The APK is `app/android/app/build/outputs/apk/release/app-release.apk`, relative to the repository root. It includes its JavaScript bundle and runs without a Metro server.

The phone download targets ARM64 Android 7.0+ devices. For an x86_64 emulator build, change the architecture argument to `-PreactNativeArchitectures=x86_64`. Omitting the argument builds all architectures configured in `gradle.properties`.

Open `app/android/` in Android Studio for device testing and production signing. The included release configuration uses the development signing key for test APKs. The application ID is `com.walkwithjesus.app`; preserve it and the signing key for compatible test updates.

## Expo cloud builds

From `app/`:

```sh
npx eas-cli login
npm run build:apk
```

The preview profile creates an APK. Expo may ask to create/link a project and configure signing credentials. Use your own Expo account; service limits may apply. `npm run build:store` produces an Android App Bundle with production credentials for store distribution. No Play Store upload has been made.

## Optional sermon AI

Sermon notes work without a backend. For AI summaries, copy `app/.env.example` to `app/.env`, set `EXPO_PUBLIC_API_URL` to your complete HTTPS API base, and rebuild. GitHub Actions can use the repository variable `EXPO_PUBLIC_API_URL` instead.

The app calls `POST <base>/sermon/summarize` with title, speaker, date, passage, points, supplemental references, and notes. It expects `{ "summary": "..." }` or `{ "error": "..." }`.

`app/backend-reference/sermon.ts` is an integration reference, not a deployed server. Keep provider API keys on the server; never include them in public Expo variables.

## Continuous integration and releases

The Android workflow runs on pushes to `main`, pull requests, and manual dispatch. It installs dependencies, checks synchronized versions and TypeScript, regenerates the Android project, builds an ARM64 test APK, verifies its signature and ZIP alignment, and uploads a version-named artifact with a checksum.

Published test APKs are tracked in `downloads/` so GitHub's source ZIP includes an installable app. Follow [VERSIONING.md](VERSIONING.md) when publishing an update. Device testing is tracked separately in [STATUS.md](STATUS.md).
