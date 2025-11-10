# Housebook

A React Native mobile application built with Expo for tracking property maintenance, designed for property owners and tradespeople to collaborate on building maintenance records.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (version 18 or later)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** or **pnpm** (package manager)
   - npm comes with Node.js
   - For pnpm: `npm install -g pnpm`
   - Verify installation: `npm --version` or `pnpm --version`

3. **Expo CLI** (optional - can use npx instead)
   ```bash
   # Global installation (optional)
   npm install -g @expo/cli
   
   # Or use npx (recommended to avoid installation issues)
   npx expo --version
   ```

4. **Mobile device or emulator**
   - **For physical device**: Install Expo Go app from App Store (iOS) or Google Play Store (Android)
   - **For emulator**: 
     - Android: Install Android Studio with Android SDK
     - iOS: Install Xcode (macOS only)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ex4ca/ITProject-HouseBook-Mobile-Frontend.git
   cd ITProject-HouseBook
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Or using pnpm (recommended for faster installation)
   pnpm install
   ```

3. **Start the development server**
   ```bash
   # Using npm
   npm start
   
   # Or using pnpm (recommended)
   pnpm start
   
   # Or using npx expo (if you didn't install Expo CLI globally)
   npx expo start
   ```

## Running the App

### Option 1: Physical Device (Recommended)
1. After running `npx expo start --tunnel`, a QR code will appear in your terminal
2. Open the **Expo Go** app on your phone
3. Scan the QR code with your camera (iOS) or within the Expo Go app (Android)
4. The app will load on your device

### Option 2: iOS Simulator (macOS only)
```bash
npm run ios
# Or: expo start --ios
```

### Option 3: Android Emulator
```bash
npm run android
# Or: expo start --android
```

### Option 4: Web Browser (for testing)
```bash
npm run web
# Or: expo start --web
```

## Testing Mobile UI in Browser (not recommended)

If you're running the web version and want to simulate mobile view:

1. Open your browser (Chrome recommended)
2. Press **F12** to open Developer Tools
3. Click the **device toggle icon** (phone/tablet icon) or press **Ctrl+Shift+M**
4. Select a mobile device from the dropdown (e.g., iPhone 12, Pixel 5)
5. The app will now display in mobile view

## Shutdown / stop development server
To stop the running Expo/Metro dev server and related processes:

1. In the terminal where you ran `npm start`, press Ctrl+C. That will stop the Expo process and Metro bundler.
2. If the process does not stop or a background node process persists, you can find and kill it (Windows PowerShell):
```powershell
# List node processes (inspect PID)
Get-Process node
# Force kill all node processes (use carefully)
Stop-Process -Name node -Force
```
3. To stop any running Android emulators, close the emulator window or stop via Android Studio AVD Manager. For iOS simulator, quit the Simulator app.

Notes:
- On some machines Expo may spawn helper processes. Ctrl+C in the same terminal is the recommended first step. Use `Stop-Process` only if the process refuses to terminate.


## Project Structure

```
src/
├── screens/           # App screens
│   ├── auth/         # Login and SignUp screens
│   ├── property/     # Property management screens
│   ├── scanner/      # QR scanner and PIN entry
│   └── profile/      # User profile and account
├── components/       # Reusable UI components
│   ├── common/       # Common components (Button, TextField, etc.)
│   └── styles/       # Styling constants
├── constants/        # App constants and mock data
├── services/         # API services
└── utils/           # Utility functions
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

## File & folder descriptions

Below are brief descriptions of key files and folders. This is not an exhaustive line-by-line doc, but it highlights the important entry points, services, screens and utilities.

**Top-level**
- `App.tsx` — App entry point for the React Native application. Handles Supabase session state and mounts the appropriate navigator (authentication or main app navigator).
- `index.js` — Registers the root component with Expo.
- `app.json` — Expo configuration (app id, icons, splash screen settings).
- `package.json` — Lists project scripts and dependencies. Use `npm start` / `pnpm start` to run the dev server.
- `tsconfig.json` — TypeScript configuration.

**Assets**
- `assets/` — App icons and splash images used by Expo and the app UI.

**Config**
- `src/config/supabaseClient.js` — Supabase client setup and configuration (auth storage, keys). Contains the project Supabase URL and anon key used by services.

**Navigation**
- `src/navigation/AppNavigator.tsx` — Top-level navigator that chooses between owner and tradie tab navigators and exposes route entries like `PropertyDetails`, QR scanner, and PIN screens.
- `src/navigation/OwnerTabNavigator.tsx` — Owner-centric tab navigation (owner flows).
- `src/navigation/TradieTabNavigator.tsx` — Tradie-centric tab navigation (tradie flows).
- `src/navigation/PropertyControlNavigator.tsx` — Stack navigator used for property owner control screens.
- `src/navigation/TradiePropertyNavigator.tsx` — Tradie property hub navigator.

**Screens (high level)**
- `src/screens/auth/AuthScreen.tsx` — Authentication UI (login / role selection) and login handlers.
- `src/screens/property/PropertyList.tsx` — Shows properties available to the user.
- `src/screens/property/PropertyGeneral.tsx` — Property summary (name, address, details).
- `src/screens/property/PropertyDetails.tsx` — Property timeline, spaces and assets listing. Where owners/tradies can add spaces/assets/history entries.
- `src/screens/property/PropertyRequest.tsx` — Owner pending requests list. Allows accepting/declining requests.
- `src/screens/property/Role.tsx` — Authority view for a property. This is where property owners can see and manage active tradie sessions ("Active on Property"). See note below.
- `src/screens/tradie/TradiePropertyDetails.tsx` — Tradie-facing timeline and ability to submit updates for assets.
- `src/screens/tradie/JobBoard.tsx` — List of tradie jobs and property cards (jobs assigned to tradie).
- `src/screens/scanner/QRScannerScreen.tsx` — QR scanning flow for tradies to claim jobs.

**Components**
- `src/components/` — Reusable UI components exported from `src/components/index.ts` (Button, TextField, DropField, Checkbox). Many larger UI elements like `SpecificationDetails` and `AssetAccordion` live in `src/components` or `src/screens/property` as separate files.

**Services**
- `src/services/` — Business logic and Supabase interactions. Notable modules:
  - `FetchAuthority.ts` — Convenience APIs for authority-related data (fetching owners, active tradie jobs, tradie job lists).
  - `propertyDetails.ts` — Operations related to property Spaces, Assets and ChangeLog (add asset, add history, fetch details used by property UI).
  - `Request.ts` — Fetching and updating pending property requests (accept/decline flows).
  - `AuthService.ts` — Authentication helpers and Supabase auth wrappers.
  - `FetchAssetTypes.ts` — Helpers to fetch reference data used by asset/space forms.

**Styles & Types**
- `src/styles/` — All style modules (per-screen and shared) and color palette.
- `src/types/index.ts` — Common TypeScript types used across the app (Property, UserProfile, AssetWithChangelog, PendingRequest, etc.).