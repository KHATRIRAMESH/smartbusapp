import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { useDriverStore } from '../store/driverStore';
import { useAuthStore } from '../store/authStore';
import { socket } from '../service/WSProvider';
import { updateBusLocation } from '../service/driver';

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
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  updateBusStatus: (status: 'online' | 'offline' | 'on_trip') => void;
}

export const useDriverLocation = (): UseDriverLocationReturn => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const locationSubscription = useRef<any>(null);
  const { user, busId, status: busStatus = 'offline', setStatus } = useDriverStore();
  const { accessToken } = useAuthStore();

  // Cleanup function
  const cleanup = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
    // Set status to offline when stopping
    setStatus('offline');
    if (busId) {
      socket.emit('updateBusStatus', { busId, status: 'offline' });
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => cleanup();
  }, []);

  const startTracking = async () => {
    try {
      if (!busId) {
        setError('No bus assigned to driver');
        return;
      }

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      // Set status to online when starting tracking
      setStatus('online');
      const currentStatus = 'online';

      // Enable high accuracy and real-time updates
      await Location.enableNetworkProviderAsync();
      
      // Start location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 1, // or if moved 1 meter
        },
        async (newLocation) => {
          setLocation(newLocation);
          setError(null);

          if (!busId) {
            console.error('No bus ID available for location update');
            return;
          }

          // Get current status from store
          const { status: currentBusStatus } = useDriverStore.getState();
          console.log('Sending location update with status:', currentBusStatus);

          // Send location update via WebSocket
          socket.emit('updateBusLocation', {
            busId,
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            speed: newLocation.coords.speed,
            heading: newLocation.coords.heading,
            status: currentBusStatus,
          });

          // Also update via REST API for persistence
          try {
            await updateBusLocation(busId, {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              speed: newLocation.coords.speed,
              heading: newLocation.coords.heading,
              status: currentBusStatus,
            });
          } catch (err) {
            console.error('Failed to update location via API:', err);
          }
        }
      );

      // Notify server that bus service is starting
      socket.emit('startBusService', {
        busId,
        coords: location?.coords,
        status: currentStatus,
      });

      setIsTracking(true);
      console.log('Started tracking with status:', currentStatus);
    } catch (err: any) {
      setError(err.message);
      cleanup();
    }
  };

  const stopTracking = () => {
    console.log('Stopping tracking and setting status to offline');
    cleanup();
  };

  const updateBusStatus = (newStatus: 'online' | 'offline' | 'on_trip') => {
    console.log('Updating bus status to:', newStatus);
    setStatus(newStatus);
    if (socket.connected && busId) {
      socket.emit('updateBusStatus', { busId, status: newStatus });
    }
  };

  // Handle socket connection/disconnection
  useEffect(() => {
    if (!socket.connected && accessToken) {
      socket.auth = { token: accessToken };
      socket.connect();
    }

    const handleConnect = () => {
      console.log('Socket connected');
      if (isTracking && busId) {
        const { status: currentBusStatus } = useDriverStore.getState();
        console.log('Reconnected - sending current status:', currentBusStatus);
        socket.emit('startBusService', {
          busId,
          coords: location?.coords,
          status: currentBusStatus,
        });
      }
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
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
  }, [accessToken, isTracking, location, busId]);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
    updateBusStatus,
  };
};
