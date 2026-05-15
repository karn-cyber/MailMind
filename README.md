# MailMind

**AI-powered email summarisation & reply assistant.**
Paste an email → get a summary → type a casual reply → send a professional one.

Uses your own Anthropic API key (BYOK). No backend. No data stored outside your device.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install native modules
npx expo install expo-secure-store expo-mail-composer
npx expo install react-native-screens react-native-safe-area-context

# 3. Start dev server
npx expo start

# 4. Scan QR code with Expo Go app (iOS/Android)
```

---

## Project Structure

```
MailMind/
├── App.tsx                          # Root: SafeAreaProvider + AppProvider + Navigator
├── src/
│   ├── types/index.ts               # All TypeScript types & interfaces
│   ├── constants/
│   │   ├── theme.ts                 # Colors, typography, spacing, shadows
│   │   └── config.ts                # Models, tones, API constants
│   ├── utils/
│   │   ├── prompts.ts               # AI prompt builder functions
│   │   └── emailParser.ts           # HTML stripper, truncation, validation
│   ├── services/
│   │   ├── anthropic.ts             # summarizeEmail() + formalizeReply()
│   │   ├── storage.ts               # SecureStore: getApiKey / setApiKey / deleteApiKey
│   │   └── prefs.ts                 # AsyncStorage: getPrefs / savePrefs
│   ├── context/
│   │   └── AppContext.tsx           # Global state + all action dispatchers
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Root stack navigator
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Paste email input
│   │   ├── SummaryScreen.tsx        # AI summary display
│   │   ├── ComposeScreen.tsx        # Casual reply + tone selector
│   │   ├── ReviewScreen.tsx         # Editable formal reply + send
│   │   └── SettingsScreen.tsx       # API key, model, tone, signature
│   └── components/
│       ├── Button.tsx               # Multi-variant button
│       ├── ErrorBanner.tsx          # Inline error with retry
│       ├── LoadingOverlay.tsx       # Modal spinner with cancel
│       ├── ToneChips.tsx            # Formal/Semi-formal/Friendly selector
│       ├── SummaryCard.tsx          # Bullet-point summary display
│       └── ScreenHeader.tsx         # Back button + title + right action
```

---

## User Flow

```
App Launch
    │
    ├── No API key → Settings (onboarding mode)
    │       └── Enter key → Home
    │
    └── Has API key → Home
            │
            ├── Paste email text
            └── Summarise → Summary screen
                    │
                    └── Write Reply → Compose screen
                            │
                            ├── Type casual reply
                            ├── Select tone (Formal / Semi-formal / Friendly)
                            └── Formalise → Review screen
                                    │
                                    ├── Edit reply (optional)
                                    ├── Re-generate (optional)
                                    ├── Copy to clipboard
                                    └── Send → Native mail app
```

---

## AI Calls

| Call | Screen | Model | Max Tokens | Purpose |
|------|--------|-------|-----------|---------|
| Summarise | Home → Summary | Haiku (default) | 400 | 3–5 bullet summary |
| Formalise | Compose → Review | Haiku (default) | 600 | Casual → professional |

Both calls go **directly from device to Anthropic API** using the user's key.
Cost per session: ~$0.0003 with Haiku.

---

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login + configure
eas login
eas build:configure

# Build
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit
eas submit --platform ios
eas submit --platform android
```

---

## Environment Notes

- iOS minimum: 15.0 (expo-secure-store Keychain requirement)
- Android minimum: SDK 31 / Android 12 (hardware-backed Keystore)
- Update `bundleIdentifier` and `package` in `app.json` before first EAS build
- Replace `YOUR_EAS_PROJECT_ID` in `app.json` after running `eas build:configure`
# MailMind
