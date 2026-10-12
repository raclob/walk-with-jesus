# Privacy information and store preparation

This describes the v0.004 code and test build. The owner must add their identity, public contact details, and a hosted privacy-policy page before a store submission. It is not a completed Play Console declaration.

## Data on the phone

Bible progress, journey preferences, theme selection, chapter counts, dated reading counts, and sermon notes/summaries are stored locally. Reading insights are calculated on the phone. Progress reset clears its reading history; it does not clear sermon notes or change store ownership of Premium. Uninstalling may remove local data. Android's device backup/restore behavior may also depend on the system and account settings.

The instant summary uses the supplied notes locally. Optional SmolLM2 inference is on-device after an explicit model download. Sermon notes are not uploaded to an AI service. The download requests a model file from Hugging Face; that host receives normal connection information. See [AI.md](AI.md).

The bundled KJV works without a connection. Optional online translations request the selected book/chapter from the configured Bible text provider; those requests include normal connection information. They do not upload sermon notes or reading history.

## Optional purchases

The distributed v0.004 test APK has billing disabled. It does not initialize RevenueCat or send it purchase data. A later build with the public Android SDK key configured initializes the billing SDK and uses an anonymous app-user identifier; a separate app account is not required.

When billing is configured, Google Play processes purchases and RevenueCat processes store purchase receipts, the app-user identifier, and SDK/store/device information needed to validate and manage entitlements. The app does not send reading statistics or sermon text to either provider. Those providers have their own privacy policies and retention practices:

- [Google privacy policy](https://policies.google.com/privacy)
- [RevenueCat privacy policy](https://www.revenuecat.com/privacy/)

Premium restore requires the store account that owns the purchase. Resetting progress does not erase store transaction records. Requests concerning the owner's configured billing project require the owner's published contact details. Refunds follow Google Play's processes.

## Analytics and publication

No separate developer usage analytics or advertising SDK was added. Personal reading insights do not transmit telemetry. RevenueCat can provide purchase metrics in a configured project; these are separate from reading activity.

Before publication, review the complete dependency set, actual production configuration, provider disclosures, Android backup behavior, and data handling to complete Google's Data safety form accurately. Supply a public policy with the app/owner name and a working contact channel. Do not claim that a billing-enabled app never communicates with third parties.
