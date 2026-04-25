# Smart Resource Allocation Mobile

Expo + React Native + TypeScript mobile app for field workers, volunteers, and coordinators.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run start
```

From the monorepo root:

```bash
npm install
npm run frontend:start
```

## Environment

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

For Android emulator, use your machine LAN IP or `http://10.0.2.2:3000/api/v1`.

## Features

- JWT login/signup with secure token storage
- Role-aware tab navigation
- Dashboard with urgent cases and mock fallback if backend is unavailable
- Map with color-coded need markers
- Offline-first report queue using AsyncStorage and NetInfo
- Report submission for text/form plus ImagePicker and audio recorder entry points
- Task list/detail with urgency scores and match explanation
- Notifications screen
- Volunteer profile, impact stats, badges, workload/fatigue summary

## Structure

```text
src/
  components/   Reusable UI primitives
  constants/    Theme and app constants
  hooks/        Async resources and offline sync
  navigation/   Auth/root/tab navigation
  screens/      App screens
  services/     Axios API layer and mock fallbacks
  store/        Zustand auth/offline stores
  types/        Shared API types
  utils/        Utility functions
```

## Notes

The app is wired to the NestJS API but uses realistic mock data if the backend is offline. Media upload endpoints are available in the service layer; the report screen currently captures media selection/recording entry points and can be extended to attach media after report creation.

For web, run:

```bash
npm run web
```

The browser build uses `MapScreen.web.tsx`, a map-ready card fallback, because `react-native-maps` is native-only and cannot bundle for web.
