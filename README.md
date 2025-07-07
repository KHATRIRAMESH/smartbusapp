# SmartBus Mobile App

A React Native mobile application for real-time school bus tracking, built with Expo.

## Features

- Real-time bus location tracking
- Parent dashboard for child tracking
- Driver interface for route navigation
- Push notifications for bus updates
- Offline support
- Multi-language support
- Dark mode support

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- Zustand for state management
- Socket.IO for real-time communication
- React Native Maps
- Expo Location
- Expo Notifications
- React Native Paper for UI components
- i18next for internationalization

## Project Structure

```
SmartbusApp/
├── src/
│   ├── app/              # App screens and navigation
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── service/         # API and socket services
│   ├── store/           # Global state management
│   ├── styles/          # Global styles and themes
│   ├── utils/           # Utility functions
│   └── assets/          # Images, fonts, etc.
├── android/             # Android specific files
└── ios/                 # iOS specific files
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp env.example .env
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Run on iOS:
   ```bash
   npm run ios
   ```
6. Run on Android:
   ```bash
   npm run android
   ```

## Environment Variables

```env
# API Configuration
API_URL=https://api.smartbus.com
SOCKET_URL=wss://api.smartbus.com

# Maps Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Push Notifications
EXPO_PROJECT_ID=your_expo_project_id
EXPO_CLIENT_ID=your_expo_client_id

# App Configuration
APP_ENV=development
ENABLE_ANALYTICS=false
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run build:android` - Build Android APK
- `npm run build:ios` - Build iOS IPA

## Features in Detail

### Parent Features
- Real-time bus location tracking
- Child attendance notifications
- Route and stop information
- Driver contact details
- Historical trip data
- Multiple children support

### Driver Features
- Real-time navigation
- Student attendance management
- Route optimization
- Status updates
- Emergency alerts
- Offline support

### Common Features
- User profile management
- Push notifications
- Dark mode
- Multi-language support
- Offline data sync
- Auto-updates

## Folder Structure Details

### `/src/app`
- Screen components
- Navigation configuration
- Route definitions

### `/src/components`
- Reusable UI components
- Screen-specific components
- Layout components

### `/src/hooks`
- Location tracking hooks
- Authentication hooks
- Data fetching hooks
- UI utility hooks

### `/src/service`
- API service
- Socket service
- Location service
- Notification service

### `/src/store`
- Global state management
- User store
- Location store
- Settings store

### `/src/utils`
- Helper functions
- Constants
- Type definitions
- Validation functions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Building for Production

### Android

1. Update `app.json` with your configuration
2. Generate a keystore file
3. Configure gradle with your keystore
4. Build the app:
   ```bash
   npm run build:android
   ```

### iOS

1. Update `app.json` with your configuration
2. Configure certificates in Apple Developer Portal
3. Build the app:
   ```bash
   npm run build:ios
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
