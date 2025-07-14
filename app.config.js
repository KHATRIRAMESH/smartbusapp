import "dotenv/config";

export default {
  expo: {
    name: "SmartBus",
    slug: "smartbus",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/bus-location.png",
    scheme: "myapp",
    newArchEnabled: true,
    userInterfaceStyle: "automatic",
    splash: {
      image: "./src/assets/images/bus-location.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.khatri.smartbus",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
      },
      // Background location configuration for iOS
      infoPlist: {
        UIBackgroundModes: [
          "location",
          "background-fetch",
          "background-processing"
        ],
        NSLocationAlwaysAndWhenInUseUsageDescription: 
          "SmartBus needs location access to track your bus in real-time for student safety and route optimization.",
        NSLocationWhenInUseUsageDescription: 
          "SmartBus needs location access when you're using the app to show your current position.",
        NSLocationAlwaysUsageDescription: 
          "SmartBus needs background location access to continuously track your bus location for student and parent safety."
      }
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
        },
      },
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.khatri.smartbus",
      // Background location configuration for Android
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION", 
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION",
        "WAKE_LOCK"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "SmartBus needs location access to track your bus in real-time for student safety and route optimization.",
          locationWhenInUsePermission: 
            "SmartBus needs location access when you're using the app to show your current position.",
          locationAlwaysPermission: 
            "SmartBus needs background location access to continuously track your bus location for student and parent safety.",
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true
        },
      ],
      [
        "expo-task-manager"
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
