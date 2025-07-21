import React, { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { AppState, AppStateStatus } from 'react-native';
import { useDriverStore } from '../store/driverStore';
import { useAuthStore } from '../store/authStore';
import { socket } from '../service/WSProvider';
import { updateBusLocation } from '../service/driver';
import { BackgroundLocationService } from '../service/backgroundLocationTask';
import { tokenStorage } from '../store/storage';

interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    altitude?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

interface UseDriverLocationReturn {
  location: LocationState | null;
  error: string | null;
  isTracking: boolean;
  isBackgroundTracking: boolean;
  syncStatus: { pendingCount: number; lastSyncTime: number } | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  updateStatus: (status: 'online' | 'offline' | 'on_trip') => Promise<void>;
}

// Optimization: Adaptive update intervals based on bus status and movement
const UPDATE_INTERVALS = {
  parked: 300000,    // 5 minutes when parked/offline
  idle: 120000,      // 2 minutes when idle
  moving_slow: 30000, // 30 seconds when moving slowly
  moving: 15000,     // 15 seconds when moving normally
  on_trip: 10000,    // 10 seconds when on trip
  emergency: 5000,   // 5 seconds in emergency mode
};

// Optimization: Smart filtering thresholds
const FILTERING_CONFIG = {
  SIGNIFICANT_DISTANCE_THRESHOLD: 10, // meters
  SIGNIFICANT_SPEED_CHANGE: 2, // km/h  
  MIN_ACCURACY_THRESHOLD: 50, // meters
  MAX_AGE_THRESHOLD: 60000, // 1 minute
};

export const useDriverLocation = (): UseDriverLocationReturn => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isBackgroundTracking, setIsBackgroundTracking] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ pendingCount: number; lastSyncTime: number } | null>(null);
  
  // Optimization: Use refs to prevent stale closures
  const locationSubscription = useRef<any>(null);
  const lastSentLocation = useRef<LocationState | null>(null);
  const lastApiSync = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  
  const { user, busId, status: busStatus = 'offline', setStatus } = useDriverStore();
  const { accessToken } = useAuthStore();

  // Optimization: Memoized distance calculation using Haversine formula
  const calculateDistance = React.useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // Optimization: Intelligent location filtering
  const isLocationUpdateSignificant = React.useCallback((newLocation: LocationState): boolean => {
    // Always send first location
    if (!lastSentLocation.current) return true;

    const lastLoc = lastSentLocation.current;
    
    // Check location quality
    if ((newLocation.coords.accuracy || 999) > FILTERING_CONFIG.MIN_ACCURACY_THRESHOLD) {
      if (__DEV__) {
        console.log('📍 Location accuracy too low:', newLocation.coords.accuracy);
      }
      return false;
    }

    // Check age of location data
    const locationAge = Date.now() - newLocation.timestamp;
    if (locationAge > FILTERING_CONFIG.MAX_AGE_THRESHOLD) {
      if (__DEV__) {
        console.log('📍 Location data too old:', locationAge);
      }
      return false;
    }

    // Calculate distance moved
    const distance = calculateDistance(
      lastLoc.coords.latitude,
      lastLoc.coords.longitude,
      newLocation.coords.latitude,
      newLocation.coords.longitude
    );

    // Calculate speed change
    const speedChange = Math.abs(
      (newLocation.coords.speed || 0) - (lastLoc.coords.speed || 0)
    ) * 3.6; // Convert to km/h

    // Check if movement is significant
    const isSignificantDistance = distance > FILTERING_CONFIG.SIGNIFICANT_DISTANCE_THRESHOLD;
    const isSignificantSpeedChange = speedChange > FILTERING_CONFIG.SIGNIFICANT_SPEED_CHANGE;
    
    // Force update every 5 minutes regardless of movement (heartbeat)
    const timeSinceLastUpdate = Date.now() - (lastSentLocation.current?.timestamp || 0);
    const isHeartbeatUpdate = timeSinceLastUpdate > 300000; // 5 minutes

    return isSignificantDistance || isSignificantSpeedChange || isHeartbeatUpdate;
  }, [calculateDistance]);

  // Start foreground location tracking with optimization
  const startForegroundTracking = React.useCallback(async () => {
    if (!busId) return;

    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: UPDATE_INTERVALS.moving,
          distanceInterval: 5, // Minimum 5 meters between updates
          mayShowUserSettingsDialog: false,
        },
        async (newLocation) => {
          const locationState: LocationState = {
            coords: newLocation.coords,
            timestamp: newLocation.timestamp,
          };
          
          setLocation(locationState);
          setError(null);

          if (!busId) return;

          // Optimization: Only process significant updates
          if (!isLocationUpdateSignificant(locationState)) {
            if (__DEV__) {
              console.log('📍 Location change not significant, skipping update');
            }
            return;
          }

          const { status: currentBusStatus } = useDriverStore.getState();
          const locationData = {
            busId,
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            speed: newLocation.coords.speed,
            heading: newLocation.coords.heading,
            status: currentBusStatus,
            timestamp: Date.now(),
          };

          // Primary update via WebSocket
          if (socket.connected) {
            socket.emit('updateBusLocation', locationData);
            lastSentLocation.current = locationState;
            if (__DEV__) {
              console.log('✅ Foreground: Location sent via WebSocket');
            }
          } else {
            console.warn('⚠️ Socket not connected, skipping WebSocket update');
          }

          // Periodic API sync for persistence
          const now = Date.now();
          if (now - lastApiSync.current > 300000) { // 5 minutes
            try {
              await updateBusLocation(busId, {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                speed: newLocation.coords.speed,
                heading: newLocation.coords.heading,
                status: currentBusStatus,
              });
              lastApiSync.current = now;
              if (__DEV__) {
                console.log('✅ Foreground: Periodic API sync completed');
              }
            } catch (err) {
              if (__DEV__) {
                console.error('❌ Foreground: API sync failed:', err);
              }
            }
          }
        }
      );
    } catch (error) {
      console.error('❌ Error starting foreground tracking:', error);
      setError('Failed to start location tracking: ' + (error as Error).message);
    }
  }, [busId, isLocationUpdateSignificant]);

  // Start enhanced location tracking
  const startTracking = React.useCallback(async (): Promise<void> => {
    if (!user || !busId) {
      setError('Driver or bus information not available');
      return;
    }

    if (isTracking) {
      if (__DEV__) {
        console.log('📍 Location tracking already active');
      }
      return;
    }

    try {
      setError(null);
      setIsTracking(true);

      if (!busId) {
        setError('No bus assigned to driver');
        return;
      }

      if (__DEV__) {
        console.log('🚌 Starting enhanced location tracking for bus:', busId);
      }

      // Request permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setError('Foreground location permission was denied');
        return;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('⚠️ Background location permission denied - background tracking disabled');
        setError('Background location permission denied. App may not track location when minimized.');
      } else {
        if (__DEV__) {
          console.log('✅ Background location permission granted');
        }
      }

      setStatus('online');
      await Location.enableNetworkProviderAsync();

      // Get access token directly from storage (more reliable for drivers)
      const currentAccessToken = await tokenStorage.get('access_token');
      if (__DEV__) {
        console.log('🔑 Access token available:', !!currentAccessToken);
      }
      
      if (!currentAccessToken) {
        setError('No access token available for authentication');
        return;
      }

      // Ensure socket connection with proper authentication
      if (!socket.connected) {
        if (__DEV__) {
          console.log('🔌 Connecting socket with authentication...');
        }
        socket.auth = { token: currentAccessToken };
        socket.connect();
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.error('❌ Socket connection timeout');
            reject(new Error('Authentication error: Socket connection timeout'));
          }, 10000);
          
          socket.once('connect', () => {
            if (__DEV__) {
              console.log('✅ Socket connected successfully');
            }
            clearTimeout(timeout);
            resolve(undefined);
          });
          
          socket.once('connect_error', (err) => {
            console.error('❌ Socket connection error:', err);
            clearTimeout(timeout);
            reject(new Error('Authentication error: ' + err.message));
          });
        });
      } else {
        if (__DEV__) {
          console.log('✅ Socket already connected');
        }
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        coords: location.coords,
        timestamp: location.timestamp,
      });

      // Notify server that bus service is starting
      if (socket.connected) {
        socket.emit('startBusService', {
          busId,
          coords: location?.coords,
          status: 'online',
        });
        if (__DEV__) {
          console.log('✅ Bus service start notification sent');
        }
      } else {
        console.warn('⚠️ Socket not connected, cannot send bus service start notification');
      }

      // Start foreground tracking
      await startForegroundTracking();

      // Start background tracking if permission granted
      if (backgroundStatus === 'granted') {
        const bgStarted = await BackgroundLocationService.startBackgroundLocationUpdates(
          busId,
          currentAccessToken,
          'online'
        );
        setIsBackgroundTracking(bgStarted);
      }

      // Set up sync status monitoring
      const syncInterval = setInterval(async () => {
        const syncStatus = await BackgroundLocationService.getSyncStatus();
        setSyncStatus(syncStatus);
      }, 30000); // Check every 30 seconds

      // Store interval for cleanup
      const cleanupInterval = () => clearInterval(syncInterval);

    } catch (error) {
      console.error('❌ Error starting location tracking:', error);
      setError('Failed to start location tracking: ' + (error as Error).message);
      setIsTracking(false);
    }
  }, [user, busId, isTracking, setStatus, startForegroundTracking]);

  // Stop location tracking
  const stopTracking = React.useCallback(() => {
    if (__DEV__) {
      console.log('🛑 Stopping location tracking');
    }

    // Stop foreground tracking
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    // Stop background tracking
    BackgroundLocationService.stopBackgroundLocationUpdates();

    // Reset state
    setLocation(null);
    setIsTracking(false);
    setIsBackgroundTracking(false);
    setSyncStatus(null);
    setError(null);
    lastSentLocation.current = null;

    // Notify server
    if (socket.connected && busId) {
      socket.emit('stopBusService', { busId });
    }
  }, [busId]);

  // Update bus status
  const updateStatus = React.useCallback(async (newStatus: 'online' | 'offline' | 'on_trip'): Promise<void> => {
    setStatus(newStatus);
    
    // Update status in both foreground and background
    if (socket.connected && busId) {
      socket.emit('updateBusStatus', { busId, status: newStatus });
      if (__DEV__) {
        console.log(`✅ Bus status sent via WebSocket: ${newStatus}`);
      }
    } else {
      console.warn('⚠️ Socket not connected, cannot update bus status via WebSocket');
    }
    
    // Update background service status
    await BackgroundLocationService.updateDriverStatus(newStatus);
  }, [busId, setStatus]);

  // Optimization: Handle app state changes for battery optimization
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - sync pending locations
        if (isTracking) {
          BackgroundLocationService.syncPendingLocations().then(syncedCount => {
            if (__DEV__ && syncedCount > 0) {
              console.log(`✅ Synced ${syncedCount} pending locations on app resume`);
            }
          });
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    location,
    error,
    isTracking,
    isBackgroundTracking,
    syncStatus,
    startTracking,
    stopTracking,
    updateStatus,
  };
};
