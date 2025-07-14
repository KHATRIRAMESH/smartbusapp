import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

interface BackgroundLocationData {
  locations: Location.LocationObject[];
  error?: any;
}

interface StoredLocationData {
  busId: string;
  accessToken: string;
  status: string;
  lastSyncTime: number;
}

// Background location task definition
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: { data: any; error: any }) => {
  if (error) {
    console.error('❌ Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as BackgroundLocationData;
    
    try {
      // Get stored driver data
      const storedData = await getStoredLocationData();
      if (!storedData) {
        console.log('❌ No stored driver data, skipping background location update');
        return;
      }

      const { busId, accessToken, status } = storedData;
      
      // Process each location update
      for (const location of locations) {
        await processBackgroundLocation(location, busId, accessToken, status);
      }
      
    } catch (error) {
      console.error('❌ Error processing background location:', error);
    }
  }
});

// Get stored driver data for background processing
const getStoredLocationData = async (): Promise<StoredLocationData | null> => {
  try {
    const busId = await AsyncStorage.getItem('driver_bus_id');
    const accessToken = await AsyncStorage.getItem('access_token');
    const status = await AsyncStorage.getItem('driver_status');
    const lastSyncTime = await AsyncStorage.getItem('last_sync_time');

    if (!busId || !accessToken) {
      return null;
    }

    return {
      busId,
      accessToken,
      status: status || 'online',
      lastSyncTime: lastSyncTime ? parseInt(lastSyncTime) : 0,
    };
  } catch (error) {
    console.error('❌ Error getting stored location data:', error);
    return null;
  }
};

// Process location update in background
const processBackgroundLocation = async (
  location: Location.LocationObject,
  busId: string,
  accessToken: string,
  status: string
) => {
  try {
    const locationData = {
      busId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      speed: location.coords.speed,
      heading: location.coords.heading,
      status,
      timestamp: location.timestamp,
    };

    // Check if location change is significant (same logic as foreground)
    const isSignificant = await isLocationUpdateSignificant(location);
    if (!isSignificant) {
      console.log('📍 Background: Location change not significant, skipping update');
      return;
    }

    // Store location for later sync if needed
    await storeLocationForSync(locationData);

    // Try to send via WebSocket if possible
    let socketSent = false;
    try {
      socketSent = await sendViaSocket(locationData, accessToken);
    } catch (error) {
      console.log('📡 Background: Socket send failed, will sync later');
    }

    // If socket failed, increment pending sync counter
    if (!socketSent) {
      await incrementPendingSyncCounter();
    }

    console.log(`✅ Background location processed: ${location.coords.latitude}, ${location.coords.longitude}`);
    
  } catch (error) {
    console.error('❌ Error processing background location:', error);
  }
};

// Check if location update is significant (background version)
const isLocationUpdateSignificant = async (newLocation: Location.LocationObject): Promise<boolean> => {
  try {
    const lastLocationStr = await AsyncStorage.getItem('last_sent_location');
    if (!lastLocationStr) return true;

    const lastLocation = JSON.parse(lastLocationStr);
    const distance = calculateDistance(
      lastLocation.latitude,
      lastLocation.longitude,
      newLocation.coords.latitude,
      newLocation.coords.longitude
    );

    const speedChange = Math.abs(
      (newLocation.coords.speed || 0) - (lastLocation.speed || 0)
    );

    const SIGNIFICANT_DISTANCE_THRESHOLD = 10; // meters
    const SIGNIFICANT_SPEED_CHANGE = 5; // km/h

    const isSignificant = distance > SIGNIFICANT_DISTANCE_THRESHOLD || speedChange > SIGNIFICANT_SPEED_CHANGE;
    
    if (isSignificant) {
      // Store this location as the last sent location
      await AsyncStorage.setItem('last_sent_location', JSON.stringify({
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
        speed: newLocation.coords.speed,
        timestamp: newLocation.timestamp
      }));
    }

    return isSignificant;
  } catch (error) {
    console.error('❌ Error checking location significance:', error);
    return true; // Default to sending if there's an error
  }
};

// Calculate distance between two points
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

// Store location data for later synchronization
const storeLocationForSync = async (locationData: any) => {
  try {
    const pendingLocationsStr = await AsyncStorage.getItem('pending_locations');
    const pendingLocations = pendingLocationsStr ? JSON.parse(pendingLocationsStr) : [];
    
    pendingLocations.push({
      ...locationData,
      storedAt: Date.now()
    });

    // Keep only last 50 locations to prevent storage overflow
    const recentLocations = pendingLocations.slice(-50);
    
    await AsyncStorage.setItem('pending_locations', JSON.stringify(recentLocations));
  } catch (error) {
    console.error('❌ Error storing location for sync:', error);
  }
};

// Send location via WebSocket in background
const sendViaSocket = async (locationData: any, accessToken: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const socket = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ['websocket'],
        timeout: 5000,
        forceNew: true
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        resolve(false);
      }, 5000);

      socket.once('connect', () => {
        clearTimeout(timeout);
        socket.emit('updateBusLocation', locationData);
        console.log('✅ Background: Location sent via WebSocket');
        socket.disconnect();
        resolve(true);
      });

      socket.once('connect_error', () => {
        clearTimeout(timeout);
        socket.disconnect();
        resolve(false);
      });

    } catch (error) {
      console.error('❌ Background socket error:', error);
      resolve(false);
    }
  });
};

// Increment pending sync counter
const incrementPendingSyncCounter = async () => {
  try {
    const counterStr = await AsyncStorage.getItem('pending_sync_count');
    const counter = counterStr ? parseInt(counterStr) : 0;
    await AsyncStorage.setItem('pending_sync_count', (counter + 1).toString());
  } catch (error) {
    console.error('❌ Error incrementing sync counter:', error);
  }
};

// Background location service management
export const BackgroundLocationService = {
  // Start background location tracking
  async startBackgroundLocationUpdates(busId: string, accessToken: string, status: string = 'online'): Promise<boolean> {
    try {
      // Store driver data for background task
      await AsyncStorage.setItem('driver_bus_id', busId);
      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('driver_status', status);
      await AsyncStorage.setItem('last_sync_time', Date.now().toString());

      // Check if task is already registered
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }

      // Start background location updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 30 seconds
        distanceInterval: 10, // 10 meters
        deferredUpdatesInterval: 60000, // Batch updates every minute
        foregroundService: {
          notificationTitle: 'SmartBus Driver Active',
          notificationBody: 'Your location is being shared for student safety',
          notificationColor: '#4CAF50'
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true
      });

      console.log('✅ Background location updates started');
      return true;
    } catch (error) {
      console.error('❌ Error starting background location updates:', error);
      return false;
    }
  },

  // Stop background location tracking
  async stopBackgroundLocationUpdates(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log('✅ Background location updates stopped');
      }

      // Clean up stored data
      await AsyncStorage.removeItem('driver_bus_id');
      await AsyncStorage.removeItem('driver_status');
      
    } catch (error) {
      console.error('❌ Error stopping background location updates:', error);
    }
  },

  // Sync pending locations when app comes to foreground
  async syncPendingLocations(): Promise<number> {
    try {
      const pendingLocationsStr = await AsyncStorage.getItem('pending_locations');
      if (!pendingLocationsStr) return 0;

      const pendingLocations = JSON.parse(pendingLocationsStr);
      if (pendingLocations.length === 0) return 0;

      // Get current access token
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) return 0;

      let syncedCount = 0;
      for (const locationData of pendingLocations) {
        try {
          const sent = await sendViaSocket(locationData, accessToken);
          if (sent) {
            syncedCount++;
          }
        } catch (error) {
          console.error('❌ Error syncing location:', error);
        }
      }

      // Clear synced locations
      if (syncedCount > 0) {
        const remainingLocations = pendingLocations.slice(syncedCount);
        await AsyncStorage.setItem('pending_locations', JSON.stringify(remainingLocations));
        console.log(`✅ Synced ${syncedCount} pending locations`);
      }

      return syncedCount;
    } catch (error) {
      console.error('❌ Error syncing pending locations:', error);
      return 0;
    }
  },

  // Get sync status
  async getSyncStatus(): Promise<{ pendingCount: number; lastSyncTime: number }> {
    try {
      const pendingLocationsStr = await AsyncStorage.getItem('pending_locations');
      const lastSyncTimeStr = await AsyncStorage.getItem('last_sync_time');
      
      const pendingLocations = pendingLocationsStr ? JSON.parse(pendingLocationsStr) : [];
      const lastSyncTime = lastSyncTimeStr ? parseInt(lastSyncTimeStr) : 0;

      return {
        pendingCount: pendingLocations.length,
        lastSyncTime
      };
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return { pendingCount: 0, lastSyncTime: 0 };
    }
  },

  // Update driver status in background
  async updateDriverStatus(status: string): Promise<void> {
    try {
      await AsyncStorage.setItem('driver_status', status);
      console.log(`✅ Driver status updated to: ${status}`);
    } catch (error) {
      console.error('❌ Error updating driver status:', error);
    }
  }
};

export { BACKGROUND_LOCATION_TASK }; 