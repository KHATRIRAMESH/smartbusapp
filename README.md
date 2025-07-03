# SmartBus Mobile App

Independent React Native mobile application for the SmartBus school bus management system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- API server running and accessible

### Installation
```bash
npm install
```

### Development
```bash
npm start
```

### Platform Specific
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
# API Server Configuration
EXPO_PUBLIC_API_URL=https://your-api-server.com
EXPO_PUBLIC_SOCKET_URL=wss://your-api-server.com

# Google Maps API
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# App Configuration
EXPO_PUBLIC_APP_NAME=SmartBus
EXPO_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=production
```

## 🏗️ Project Structure

```
SmartbusApp/
├── src/
│   ├── app/                 # Expo Router screens
│   │   ├── driver/         # Driver screens
│   │   ├── user/           # User screens
│   │   └── _layout.tsx     # Root layout
│   ├── components/         # Reusable components
│   │   ├── driver/         # Driver-specific components
│   │   ├── user/           # User-specific components
│   │   └── shared/         # Shared components
│   ├── service/            # API services
│   ├── store/              # State management (Zustand)
│   ├── styles/             # Style definitions
│   ├── utils/              # Utility functions
│   └── hooks/              # Custom hooks
├── assets/                 # Static assets
│   ├── fonts/             # Custom fonts
│   ├── icons/             # App icons
│   └── images/            # Images
└── app.config.js          # Expo configuration
```

## 📱 Features

### User App
- Real-time bus tracking
- Child management
- Ride history
- Notifications
- Location services

### Driver App
- Route navigation
- Student pickup/dropoff
- Real-time location sharing
- Ride management
- Emergency contacts

## 🔧 Development

### Code Quality
```bash
npm run lint
npm run lint:fix
```

### Type Checking
```bash
npm run type-check
```

### Testing
```bash
npm test
```

## 📦 Build & Deployment

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for platforms
npm run build:android
npm run build:ios
npm run build:all
```

### App Store Submission
```bash
# Android (Google Play Store)
npm run submit:android

# iOS (App Store)
npm run submit:ios
```

### Manual Build
```bash
# Android APK
expo build:android

# iOS IPA
expo build:ios
```

## 🎨 UI/UX

Built with:
- **React Native** - Cross-platform mobile development
- **Expo Router** - File-based routing
- **React Native Maps** - Map integration
- **Socket.IO** - Real-time communication
- **Zustand** - State management

## 🔗 API Integration

The mobile app communicates with the SmartBus API server:

- **Authentication**: JWT-based auth with refresh tokens
- **Real-time**: WebSocket connections for live updates
- **REST API**: CRUD operations for data management
- **Push Notifications**: Expo notifications for alerts

## 📊 Performance

- **Expo SDK 52** with latest features
- **React Native 0.76** with performance optimizations
- **TypeScript** for type safety
- **Optimized images** and assets
- **Lazy loading** for better performance

## 🔒 Security

- Environment-based configuration
- Secure token storage
- API key protection
- Input validation
- HTTPS only in production

## 📱 Platform Support

- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 13.0+
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (recommended: Detox)
npm install --save-dev detox
```

## 📊 Analytics

Recommended integrations:
- **Expo Analytics** - Built-in analytics
- **Firebase Analytics** - Google Analytics
- **Sentry** - Error tracking
- **Mixpanel** - User behavior

## 🚀 Publishing

### Google Play Store
1. Build APK/AAB: `npm run build:android`
2. Submit to Play Console: `npm run submit:android`
3. Configure store listing
4. Release to production

### Apple App Store
1. Build IPA: `npm run build:ios`
2. Submit to App Store Connect: `npm run submit:ios`
3. Configure app metadata
4. Submit for review

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests and linting
5. Submit pull request

## 📄 License

MIT License
