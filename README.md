# Housebook - Property Maintenance Tracking App

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
   git clone https://github.com/AntonioWang0810/ITProject-HouseBook.git
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
1. After running `npm start`, a QR code will appear in your terminal
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

## Testing Mobile UI in Browser

If you're running the web version and want to simulate mobile view:

1. Open your browser (Chrome recommended)
2. Press **F12** to open Developer Tools
3. Click the **device toggle icon** (phone/tablet icon) or press **Ctrl+Shift+M**
4. Select a mobile device from the dropdown (e.g., iPhone 12, Pixel 5)
5. The app will now display in mobile view

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
