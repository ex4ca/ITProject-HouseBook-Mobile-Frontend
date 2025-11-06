# Housebook — Developer Guide (Appended)

This developer guide expands the repository README with detailed file/folder descriptions, quick startup/shutdown commands, where to find key flows in the code, and suggested next steps.

## Detailed file & folder descriptions

Below are brief descriptions of key files and folders to help new developers navigate the codebase. This is not an exhaustive line-by-line doc, but it highlights the important entry points, services, screens and utilities.

Top-level
- `App.tsx` — App entry point for the React Native application. Handles Supabase session state and mounts the appropriate navigator (authentication or main app navigator).
- `index.js` — Registers the root component with Expo.
- `app.json` — Expo configuration (app id, icons, splash screen settings).
- `package.json` — Lists project scripts and dependencies. Use `npm start` / `pnpm start` to run the dev server.
- `tsconfig.json` — TypeScript configuration.

Assets
- `assets/` — App icons and splash images used by Expo and the app UI.

Config
- `src/config/supabaseClient.js` — Supabase client setup and configuration (auth storage, keys). Contains the project Supabase URL and anon key used by services.

Navigation
- `src/navigation/AppNavigator.tsx` — Top-level navigator that chooses between owner and tradie tab navigators and exposes route entries like `PropertyDetails`, QR scanner, and PIN screens.
- `src/navigation/OwnerTabNavigator.tsx` — Owner-centric tab navigation (owner flows).
- `src/navigation/TradieTabNavigator.tsx` — Tradie-centric tab navigation (tradie flows).
- `src/navigation/PropertyControlNavigator.tsx` — Stack navigator used for property owner control screens.
- `src/navigation/TradiePropertyNavigator.tsx` — Tradie property hub navigator.

Screens (high level)
- `src/screens/auth/AuthScreen.tsx` — Authentication UI (login / role selection) and login handlers.
- `src/screens/property/PropertyList.tsx` — Shows properties available to the user.
- `src/screens/property/PropertyGeneral.tsx` — Property summary (name, address, details).
- `src/screens/property/PropertyDetails.tsx` — Property timeline, spaces and assets listing. Where owners/tradies can add spaces/assets/history entries.
- `src/screens/property/PropertyRequest.tsx` — Owner pending requests list. Allows accepting/declining requests.
- `src/screens/property/Role.tsx` — Authority view for a property. This is where property owners can see and manage active tradie sessions ("Active on Property"). See note below.
- `src/screens/tradie/TradiePropertyDetails.tsx` — Tradie-facing timeline and ability to submit updates for assets.
- `src/screens/tradie/JobBoard.tsx` — List of tradie jobs and property cards (jobs assigned to tradie).
- `src/screens/scanner/QRScannerScreen.tsx` — QR scanning flow for tradies to claim jobs.

Components
- `src/components/` — Reusable UI components exported from `src/components/index.ts` (Button, TextField, DropField, Checkbox). Many larger UI elements like `SpecificationDetails` and `AssetAccordion` live in `src/components` or `src/screens/property` as separate files.

Services
- `src/services/` — Business logic and Supabase interactions. Notable modules:
  - `FetchAuthority.ts` — Convenience APIs for authority-related data (fetching owners, active tradie jobs, tradie job lists).
  - `propertyDetails.ts` — Operations related to property Spaces, Assets and ChangeLog (add asset, add history, fetch details used by property UI).
  - `Request.ts` — Fetching and updating pending property requests (accept/decline flows).
  - `AuthService.ts` — Authentication helpers and Supabase auth wrappers.
  - `FetchAssetTypes.ts`, `FetchSpaceEnum.ts` — Helpers to fetch reference data used by asset/space forms.

Styles & Types
- `src/styles/` — All style modules (per-screen and shared) and color palette.
- `src/types/index.ts` — Common TypeScript types used across the app (Property, UserProfile, AssetWithChangelog, PendingRequest, etc.).

## Where to see active tradie sessions
- Owners: open a property and navigate to the "Authority" screen (component: `src/screens/property/Role.tsx`). The "Active on Property" section lists all currently assigned tradies and the job they're working on. Owners can end a tradie's session from this screen.
- Tradies: tradies see their assigned jobs in the `src/screens/tradie/JobBoard.tsx` and may view property details via the Tradie property navigator.

## Startup (quick reference)
These steps are already listed in the main README; here are compact commands and an additional note about clearing cache.

On Windows (PowerShell) or macOS/Linux terminal:
```powershell
# Install deps (only once or when dependencies change)
npm install
# or (recommended) pnpm install
pnpm install

# Start dev server (Metro + Expo)
npm start
# or
pnpm start
# to clear Metro/Expo cache
npx expo start -c
```

After `npm start` you can open the app with Expo Go (scan QR), or run in emulator:
- `npm run android` (Android emulator / device)
- `npm run ios` (macOS only)
- `npm run web` (browser)

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

## Verification & common dev tasks
- To verify you have environment working: run `npm start` and load the Expo QR in Expo Go or use an emulator.
- To reproduce the tradie session view as an owner: log in as an owner and open a property, then open the Authority screen (`src/screens/property/Role.tsx`).

## Suggested next steps (optional improvements)
- Add a small CONTRIBUTING.md with local development checks and branching rules.
- Add unit tests and CI config for the service-layer helpers that are already using Node-friendly tests.
- Add a short section documenting common Supabase schema shapes the app expects (Owner, OwnerProperty, Property, Jobs, JobTradies) — this helps debugging null/missing nested objects.

---

_Appended developer guide generated on behalf of the team. If you'd like, I can expand the per-file descriptions into a full, line-by-line README appendix (this will require reading each source file and will take longer)._ 
