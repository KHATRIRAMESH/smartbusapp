import { Platform } from "react-native";

// Get the server URL from environment variables or use defaults
const getServerUrl = () => {
  // First, try to get URL from environment variables
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback to development defaults if no env vars
  if (__DEV__) {
    // Use local IP for Android, localhost for iOS simulator
    return Platform.OS === "android" 
      ? "http://192.168.18.16:8000" 
      : "http://localhost:8000";
  }
  
  // Production URL (replace with your actual production server URL)
  return "https://your-production-server.com";
};

export const BASE_URL = getServerUrl();
// Socket.IO uses HTTP/HTTPS, not WebSocket protocol
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || BASE_URL;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
  DRIVER: {
    LOCATION: '/driver/location',
    STATUS: '/driver/status',
  },
  RIDE: {
    REQUEST: '/ride/request',
    STATUS: '/ride/status',
    HISTORY: '/ride/history',
  },
};

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  DRIVER_LOCATION_UPDATE: 'driver_location_update',
  RIDE_REQUEST: 'ride_request',
  RIDE_STATUS_UPDATE: 'ride_status_update',
  USER_LOCATION_UPDATE: 'user_location_update',
};
