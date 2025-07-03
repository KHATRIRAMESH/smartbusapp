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
            "Allow $(SmartBus) to use your location.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
