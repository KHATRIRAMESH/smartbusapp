import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { useDriverStore } from '../store/driverStore';
import { useAuthStore } from '../store/authStore';
import { socket } from '../service/WSProvider';
import { updateBusLocation } from '../service/driver';
import { BackgroundLocationService } from '../service/backgroundLocationTask';

interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
  };
  timestamp: number;
}

interface UseDriverLocationReturn {
  location: LocationState | null;
  error: string | null;
  isTracking: boolean;
  isBackgroundTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  updateBusStatus: (status: 'online' | 'offline' | 'on_trip') => void;
  syncStatus: { pendingCount: number; lastSyncTime: number } | null;
}

// Optimization: Adaptive update intervals based on bus status
const UPDATE_INTERVALS = {
  parked: 300000,    // 5 minutes when parked/offline
  moving: 15000,     // 15 seconds when moving
  on_trip: 10000,    // 10 seconds when on trip
  slow: 30000,       // 30 seconds when moving slowly
};

// Optimization: Only send updates if location change is significant
const SIGNIFICANT_DISTANCE_THRESHOLD = 10; // meters
const SIGNIFICANT_SPEED_CHANGE = 5; // km/h

export const useDriverLocation = (): UseDriverLocationReturn => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isBackgroundTracking, setIsBackgroundTracking] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ pendingCount: number; lastSyncTime: number } | null>(null);
  
  const locationSubscription = useRef<any>(null);
  const lastSentLocation = useRef<LocationState | null>(null);
  const lastApiSync = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  
  const { user, busId, status: busStatus = 'offline', setStatus } = useDriverStore();
  const { accessToken } = useAuthStore();

  // Optimization: Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  };

  // Optimization: Determine if location update is significant
  const isLocationUpdateSignificant = (newLocation: LocationState): boolean => {
    if (!lastSentLocation.current) return true;

    const distance = calculateDistance(
      lastSentLocation.current.coords.latitude,
      lastSentLocation.current.coords.longitude,
      newLocation.coords.latitude,
      newLocation.coords.longitude
    );

    const speedChange = Math.abs(
      (newLocation.coords.speed || 0) - (lastSentLocation.current.coords.speed || 0)
    );

    // Send update if significant movement or speed change
    return distance > SIGNIFICANT_DISTANCE_THRESHOLD || speedChange > SIGNIFICANT_SPEED_CHANGE;
  };

  // Background/Foreground: App state change handler
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    console.log(`📱 App state changing from ${appStateRef.current} to ${nextAppState}`);
    
    if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/) && isTracking) {
      // App going to background - switch to background location tracking
      console.log('🔄 Switching to background location tracking');
      await switchToBackgroundTracking();
    } else if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active' && isTracking) {
      // App coming to foreground - switch back to foreground tracking and sync
      console.log('🔄 Switching back to foreground tracking');
      await switchToForegroundTracking();
    }
    
    appStateRef.current = nextAppState;
  };

  // Switch to background tracking
  const switchToBackgroundTracking = async () => {
    try {
      if (!busId || !accessToken) return;

      // Stop foreground tracking
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      // Start background tracking
      const { status: currentBusStatus } = useDriverStore.getState();
      const success = await BackgroundLocationService.startBackgroundLocationUpdates(
        busId, 
        accessToken, 
        currentBusStatus
      );

      if (success) {
        setIsBackgroundTracking(true);
        console.log('✅ Background location tracking started');
      } else {
        setError('Failed to start background location tracking');
      }
    } catch (error) {
      console.error('❌ Error switching to background tracking:', error);
      setError('Failed to switch to background tracking');
    }
  };

  // Switch to foreground tracking
  const switchToForegroundTracking = async () => {
    try {
      // Stop background tracking
      await BackgroundLocationService.stopBackgroundLocationUpdates();
      setIsBackgroundTracking(false);

      // Sync any pending locations from background
      const syncedCount = await BackgroundLocationService.syncPendingLocations();
      if (syncedCount > 0) {
        console.log(`✅ Synced ${syncedCount} pending locations from background`);
      }

      // Restart foreground tracking
      await startForegroundTracking();
      
      // Update sync status
      updateSyncStatus();
    } catch (error) {
      console.error('❌ Error switching to foreground tracking:', error);
      setError('Failed to switch to foreground tracking');
    }
  };

  // Start foreground location tracking
  const startForegroundTracking = async () => {
    if (!busId) return;

    // Start foreground location updates
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: UPDATE_INTERVALS.moving,
        distanceInterval: 5,
      },
      async (newLocation) => {
        setLocation(newLocation);
        setError(null);

        if (!busId) return;

        // Optimization: Only send significant updates
        if (!isLocationUpdateSignificant(newLocation)) {
          console.log('📍 Location change not significant, skipping update');
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
          lastSentLocation.current = newLocation;
          console.log('✅ Foreground: Location sent via WebSocket');
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
            console.log('✅ Foreground: Periodic API sync completed');
          } catch (err) {
            console.error('❌ Foreground: API sync failed:', err);
          }
        }
      }
    );
  };

  // Update sync status
  const updateSyncStatus = async () => {
    try {
      const status = await BackgroundLocationService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('❌ Error updating sync status:', error);
    }
  };

  // Cleanup function
  const cleanup = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    // Stop background tracking
    await BackgroundLocationService.stopBackgroundLocationUpdates();
    
    setIsTracking(false);
    setIsBackgroundTracking(false);
    setStatus('offline');
    
    if (busId) {
      socket.emit('updateBusStatus', { busId, status: 'offline' });
    }
  };

  // App state change listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Initial sync status update
    updateSyncStatus();
    
    return () => {
      subscription?.remove();
      cleanup();
    };
  }, []);

  // Periodic sync status update
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(updateSyncStatus, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const startTracking = async () => {
    try {
      if (!busId) {
        setError('No bus assigned to driver');
        return;
      }

      console.log('🚌 Starting enhanced location tracking for bus:', busId);

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
        console.log('✅ Background location permission granted');
      }

      setStatus('online');
      await Location.enableNetworkProviderAsync();

      // Ensure socket connection
      if (!socket.connected) {
        socket.auth = { token: accessToken };
        socket.connect();
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
          socket.once('connect', () => {
            clearTimeout(timeout);
            resolve(undefined);
          });
          socket.once('connect_error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      }

      // Start foreground tracking
      await startForegroundTracking();

      // Notify server that bus service is starting
      if (socket.connected) {
        socket.emit('startBusService', {
          busId,
          coords: location?.coords,
          status: 'online',
        });
      }

      setIsTracking(true);
      console.log('🎉 Enhanced location tracking started');

      // If app is already in background, switch to background tracking
      if (AppState.currentState !== 'active') {
        await switchToBackgroundTracking();
      }
      
    } catch (err: any) {
      console.error('❌ Error starting location tracking:', err);
      setError(err.message);
      cleanup();
    }
  };

  const stopTracking = async () => {
    console.log('🛑 Stopping all location tracking');
    await cleanup();
  };

  const updateBusStatus = async (newStatus: 'online' | 'offline' | 'on_trip') => {
    console.log('🔄 Updating bus status to:', newStatus);
    setStatus(newStatus);
    
    // Update status in both foreground and background
    if (socket.connected && busId) {
      socket.emit('updateBusStatus', { busId, status: newStatus });
    }
    
    // Update background service status
    await BackgroundLocationService.updateDriverStatus(newStatus);
    
    console.log(`✅ Bus status updated to: ${newStatus}`);
  };

  // Handle connection events
  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected');
      setError(null);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setError('Connection lost. Attempting to reconnect...');
    };

    const handleError = (err: Error) => {
      console.error('Socket error:', err);
      setError('Connection error: ' + err.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    isBackgroundTracking,
    startTracking,
    stopTracking,
    updateBusStatus,
    syncStatus,
  };
};
