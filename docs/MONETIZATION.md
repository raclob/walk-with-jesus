# Freemium and store setup

The v0.004 test release previews an optional **one-time Premium unlock**. Billing is not configured in the distributed test APK: it takes no payments and does not grant a pretend entitlement. The owner confirmed a one-time Premium unlock with personal reading statistics. They do not yet have a Play developer account, and pricing is undecided. No RevenueCat public SDK key is configured.

## Included features

| Free | Premium |
| --- | --- |
| Offline Bible, supported online translations, both journeys, prophecies | Still Forest, Quiet Waters, and Evening Plum app themes |
| Sermon notes, instant summaries, optional downloaded on-device AI | Weekly reading chart, 30-day counts and active-day averages |
| Existing progress, streaks, heat maps, milestones, prestige | All-time most-read book and testament breakdowns |
| Midnight Gold and Daylight themes; chapter text preferences | One non-recurring purchase with restore |

Everyone can preview the themes and clearly labeled **sample** insight charts. Previewing a paid theme does not apply it to the app. No subscription, ads, usage limits, API keys, or account requirement have been added to the free features.

Daily statistics count chapters marked as read, including rereads. The history starts with reads recorded by v0.004 or later. Old all-time chapter counts remain available, but earlier reading dates were never saved and cannot be reconstructed. Prestige retains history; resetting progress clears it. These are personal statistics stored on the phone, not developer analytics.

## Enable real Google Play purchases

1. Create or use your Google Play developer account and configure the payments profile. Preserve application ID `com.walkwithjesus.app`. Configure production signing and Play App Signing. The APKs in `downloads/` are development-signed tests; they are not production store submissions.
2. Choose the price in Play Console. Create the one-time in-app product **`walk_with_jesus_premium_lifetime`**, activate its purchase option, for a permanent unlock. Do not use a subscription or a consumable item.
3. Create a RevenueCat project and Android app for this package, connect its Google Play credentials according to RevenueCat's instructions, and import that product as a **non-consumable**. This server-side product configuration is essential: the SDK uses it to acknowledge, rather than consume, the Play purchase so it remains restorable. Link it to entitlement **`premium`**. In the current offering, attach it to the **Lifetime** package. Set the project's restore/transfer behavior so users can recover their purchase on a reinstall or another phone using their Play account; verify this with testers. Configure Google Play real-time developer notifications for refund/revocation updates.
4. Set the public Android SDK key (`goog_…`) as **`EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`** in the build environment. This is the publishable SDK key, never a secret RevenueCat API key or Google service-account credential. See `app/.env.example`. Expo embeds this value when creating the JavaScript bundle, so rebuild after changing it. Leave it empty for preview builds. Expo Go and RevenueCat test-store keys cannot enable real billing in this app.
5. Upload a production-signed AAB to a Play test track, add license testers, and install through Play. Products must be available to those accounts and the package/signature must match. Direct APK sideloading is not the store acceptance test. Complete the privacy policy, Data safety answers, store listing, and owner contact before publication; review [PRIVACY.md](PRIVACY.md).
6. Test successful payment, cancel, pending payment, network failure, restore after reinstall and on another phone, offline cached access, and refund/revocation. Check every theme, large text, and both free and Premium reading flows on phones. Then publish through Play Console when ready.

For local builds, a private `app/.env` can hold the public SDK key. For EAS, set it in the selected EAS environment. CI test APKs intentionally leave the key empty. Changing account setup or enabling live billing is separate from this preview release.

## Purchase behavior

The SDK is `react-native-purchases` 10.12.2 (MIT). Google Play handles the payment; RevenueCat verifies purchase receipts and manages entitlements and acknowledgments. The app only accepts the expected lifetime product in a non-subscription Lifetime package, and displays the store's localized price.

Trusted-entitlement verification is enabled using the SDK's informational mode; the app itself rejects anything except `VERIFIED` or `VERIFIED_ON_DEVICE`. A successful checkout without an active, verified `premium` entitlement does not unlock the app. Pending and cancelled purchases do not unlock it. Restore rechecks the store account. Customer-info updates remove paid access after revocation while preserving the saved theme preference. Transient catalog failures retain previously verified access.

Premium status is held by the SDK's receipt/customer cache, rather than an editable app preference. Cached access can work offline, but a fresh installation needs the store to restore its purchase. Refund detection needs an updated customer-info response; it is not instantaneous while offline.

RevenueCat receives purchase information and an anonymous app-user identifier when billing is configured. No sermon text or reading statistics are sent by this integration. Optional purchase-provider analytics are distinct from the local insights feature. If developer usage analytics are later desired, define their scope and consent separately.

The owner pays applicable Google Play fees. RevenueCat's published pricing when checked for this release is free through $2,500 of monthly tracked revenue, then 1% of tracked revenue; confirm current terms at [RevenueCat pricing](https://www.revenuecat.com/pricing/) before committing. These publisher costs do not require users of the free app to pay.

## Validation limits

Automated mocked-provider tests cover entitlement signatures, wrong products/subscriptions, cancel/failure/pending, restore, revocation, theme gating, localized pricing, and cached access during catalog failures. These tests do not make purchases or establish live store readiness. No real Google Play purchase or device acceptance test has been performed.
