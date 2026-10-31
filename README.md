# Starpoint Garage camera-enabled Android wrappers

Three product flavors load the **current live** Member, Owner, and Technician Supabase apps. The hosted HTML, CSS, business logic, login, transactions, and vouchers are not copied or modified here.

At launch, the original Starpoint Garage logo is shown on a black background for exactly 1.5 seconds while the live page begins loading underneath it.

Android camera support is added in the manifest and `WebChromeClient`, with a runtime prompt restricted to video capture requests from `https://msvdxyicostwztisvbvl.supabase.co`. Owner and Technician scanners use `BarcodeDetector`; if Android WebView lacks that API, the wrapper supplies a QR-only decoder through ZXing without changing the page layout.

Security hardening in version 104 keeps the existing UI intact while disabling application-data backup, WebView file/content access, mixed HTTP content, WebView debugging, pop-up windows, geolocation, and form persistence. Android Safe Browsing is enabled, cleartext traffic remains disabled, and the network trust configuration accepts system certificate authorities only.

Supabase Edge Functions rewrite HTML responses to `text/plain`. The wrapper downloads only the trusted live Starpoint document, validates that it is HTML, and loads the exact document into WebView with the live URL as its base origin.

Build (JDK 17, Android SDK 35, Gradle 8.9): `gradle :app:assembleDebug`.
Debug packages use the `.camera.preview` suffix so they install beside the existing apps for testing without replacing them.

Installable release packages use the `.camera` suffix and a separate signing key so they also install beside existing apps. To build a signed release, set `STARPOINT_SIGNING_STORE` to the absolute path of the release keystore and `STARPOINT_SIGNING_PASSWORD` to its password, then run `gradle :app:assembleRelease`. Keep that keystore safe: future updates to these `.camera` packages require the same key.

These are new build sources. The current installed Member, Owner, and Technician APKs and their private signing keys were not available for byte-for-byte comparison. These builds do not update the installed apps. Matching APKs and signing material must be checked before producing updates to the original package IDs. Camera behavior must be validated on a physical Android device.
