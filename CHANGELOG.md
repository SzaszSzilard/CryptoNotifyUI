# Changelog

All notable changes to **CryptoNotifyUI** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-31

### Changed
- **Expo SDK Upgrade:** Migrated project from Expo SDK 54 (`54.0.20`) to **Expo SDK 58** (`^58.0.21`) and updated all `expo-*` native modules (`expo-router`, `expo-dev-client`, `expo-splash-screen`, `expo-secure-store`, `expo-image`, `expo-font`, `expo-constants`, `expo-symbols`, etc.).
- **Expo Router TopTabs & Navigation Alignment:** Migrated `app/(tabs)/_layout.tsx` from standalone `@react-navigation/material-top-tabs` to Expo Router's built-in `TopTabs` (`expo-router/js-top-tabs`) and consolidated `ThemeProvider`, `DarkTheme`, `DefaultTheme`, and `useFocusEffect` imports onto `expo-router` to avoid duplicate `@react-navigation` context instances.
- **React & React Native Upgrade:** Upgraded React & React DOM from `19.1.0` to `19.3.0` and React Native from `0.81.5` to `0.88.1` (New Architecture enabled).
- **Firebase Modular v27 Migration:** Upgraded `@react-native-firebase/app` and `@react-native-firebase/messaging` from `^22.2.1` to `^27.1.0` and migrated root notification listeners in `app/_layout.tsx` to the modular `onMessage(getMessaging(getApp()), ...)` API.
- **Navigation, Animation & Tooling:** Upgraded `@react-navigation/*` (`native` `^7.5.1`, `bottom-tabs` `^7.21.0`, `material-top-tabs` `^7.8.1`, `elements` `^2.9.45`), `react-native-reanimated` (`4.7.1`), `react-native-gesture-handler` (`~3.3.0`), `react-native-pager-view` (`9.0.7`), `react-native-screens` (`~4.30.0`), `react-native-webview` (`14.0.1`), `typescript` (`~6.0.3`), and `eslint-config-expo` (`~58.0.4`).
- **Gemini AI Summary Model:** Updated AI summary endpoint in `components/ui/CNF/CryptoCard.tsx` from the retired `gemini-1.5-flash-latest` model to `gemini-2.5-flash` with explicit `Content-Type: application/json` headers.
- **Node.js & CLI Environment:** Upgraded runtime environment to **Node.js v26.13.0 LTS**, **npm 11.20.0**, and **EAS CLI 27.2.0**.

### Fixed
- **1-Second Background Refresh Input & Button Drop Bug:**
  - Extracted `TargetSelector` outside of `NotificationSetup` in `app/screens/notifications/target.tsx` so it is no longer unmounted and remounted on every render cycle.
  - Isolated the 1-second live price ticker into a dedicated `LiveSymbolPrice` child component in `target.tsx` and `nonTarget.tsx`, preventing the form inputs, direction selector, and `Submit` button from re-rendering during background price polling.
  - Changed target price/percentage `TextInput` state in `target.tsx` to preserve raw string input while typing (supporting decimals like `6.` or `0.05` and comma separators) and parse only upon submission.
  - Isolated `CryptoListContent` from the search `TextInput` in `app/(tabs)/crypto-list.tsx` so background price updates do not re-render the active search input.
  - Added `keyboardShouldPersistTaps="handled"` to `ScrollView` and `FlatList` across `target.tsx`, `crypto-list.tsx`, `index.tsx`, and `symbol.tsx` so button presses register immediately on the first tap even while the soft keyboard is open.
- **Real-Time Polling & Rendering Performance (`RealTimeCrypto.tsx` & `CryptoCard.tsx`):**
  - Added an in-flight request guard (`isFetching`) and unmount safety to the 1-second `crypto/list` polling loop to prevent overlapping network requests.
  - Preserved object references for unchanged `CryptoPrice` entries across ticks and wrapped `CryptoCard` in `React.memo` so cards only re-render when their specific price or notification count changes.
  - Added `useUserId` and `useLatestCryptoGetter` hooks so screens that only require `userId` (`symbol.tsx`) or on-submit price lookup (`target.tsx`) do not subscribe to 1-second re-renders.
- **HTTP Service Empty Body Handling:** Updated `services/httpService.ts` to safely parse empty HTTP response bodies (`200 OK` / `204 No Content`) without throwing `JSON.parse` errors.
- **TypeScript & Linting Fixes:**
  - Fixed missing `Notification` model import in `app/(tabs)/crypto-list.tsx`.
  - Fixed `SymbolViewProps['name']` index type constraint in `components/ui/IconSymbol.tsx` for `expo-symbols` SDK 58.
  - Memoized `StyleSheet` creation across screens and components using `useMemo`.

### Security
- **Zero CVEs (`npm audit`):** Resolved all **63 security vulnerabilities** (7 critical, 28 high, 16 moderate, 12 low) across direct and transitive dependencies (`@grpc/grpc-js`, `@react-native-community/cli`, `@xmldom/xmldom`, `fast-xml-parser`, `undici`, `ws`, `zod`, `glob`, `minimatch`, `deepmerge`, etc.).

---

## [1.0.0] - 2025-10-28

### Added
- Initial release of **CryptoNotifyUI** built on Expo SDK 54.
- Real-time cryptocurrency price tracking (`RealTimeCrypto` provider with 1s polling).
- Tracked cryptos dashboard (`HomeScreen`) and searchable cryptocurrency list (`CryptoListScreen`).
- Push notification integration via Firebase Cloud Messaging (`@react-native-firebase/messaging`).
- Notification creation and management for:
  - Price Target (`n-above`, `n-below`)
  - Percentage Change (`n-percent-above`, `n-percent-below`)
  - Short-Term Rally (`n-rally`)
  - Change of Direction (`n-change`)
- AI-powered cryptocurrency summary modal in `CryptoCard` using the Gemini API.
- Light and dark theme support across all screens.

