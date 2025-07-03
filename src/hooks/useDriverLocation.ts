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
  updateBusStatus: (status: string) => void;
}

export const useDriverLocation = (): UseDriverLocationReturn => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const locationSubscription = useRef<any>(null);
  const { busId, status: busStatus, setBusStatus } = useDriverStore();
  const { accessToken } = useAuthStore();

  // Cleanup function
  const cleanup = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
    socket.emit('updateBusStatus', { status: 'offline' });
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => cleanup();
  }, []);

  const startTracking = async () => {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      // Enable high accuracy and real-time updates
      await Location.enableNetworkProviderAsync();
      
      // Start location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // or if moved 10 meters
        },
        async (newLocation) => {
          setLocation(newLocation);
          setError(null);

          // Send location update via WebSocket
          socket.emit('updateBusLocation', {
            coords: {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              speed: newLocation.coords.speed,
              heading: newLocation.coords.heading,
            },
            status: busStatus,
          });

          // Also update via REST API for persistence
          try {
            await updateBusLocation(busId, {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              speed: newLocation.coords.speed,
              heading: newLocation.coords.heading,
              status: busStatus,
            });
          } catch (err) {
            console.error('Failed to update location via API:', err);
          }
        }
      );

      // Notify server that bus service is starting
      socket.emit('startBusService', {
        coords: location?.coords,
        status: busStatus || 'in_service',
      });

      setIsTracking(true);
    } catch (err: any) {
      setError(err.message);
      cleanup();
    }
  };

  const stopTracking = () => {
    cleanup();
  };

  const updateBusStatus = (status: string) => {
    setBusStatus(status);
    if (socket.connected) {
      socket.emit('updateBusStatus', { status });
    }
  };

  // Handle socket connection/disconnection
  useEffect(() => {
    if (!socket.connected && accessToken) {
      socket.auth = { access_token: accessToken };
      socket.connect();
    }

    const handleConnect = () => {
      console.log('Socket connected');
      if (isTracking) {
        socket.emit('startBusService', {
          coords: location?.coords,
          status: busStatus || 'in_service',
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
  }, [accessToken, isTracking, location, busStatus]);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
    updateBusStatus,
  };
};
