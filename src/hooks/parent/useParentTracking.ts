import { useState, useEffect } from 'react';
import { socket } from '@/service/WSProvider';
import { useAuthStore } from '@/store/authStore';

interface BusLocation {
  coords: {
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
  };
  status: string;
  lastUpdated: Date;
}

interface UseParentTrackingReturn {
  busLocation: BusLocation | null;
  error: string | null;
  isTracking: boolean;
  startTracking: (busId: string) => void;
  stopTracking: () => void;
}

export const useParentTracking = (): UseParentTrackingReturn => {
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentBusId, setCurrentBusId] = useState<string | null>(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!socket.connected && accessToken) {
      socket.auth = { access_token: accessToken };
      socket.connect();
    }

    const handleBusLocation = (data: BusLocation) => {
      setBusLocation({
        ...data,
        lastUpdated: new Date()
      });
      setError(null);
    };

    const handleBusOffline = () => {
      setError('Bus is currently offline');
      setBusLocation(prev => prev ? { ...prev, status: 'offline' } : null);
    };

    const handleError = (err: Error) => {
      console.error('Socket error:', err);
      setError('Connection error: ' + err.message);
    };

    socket.on('busLocation', handleBusLocation);
    socket.on('busOffline', handleBusOffline);
    socket.on('error', handleError);

    return () => {
      socket.off('busLocation', handleBusLocation);
      socket.off('busOffline', handleBusOffline);
      socket.off('error', handleError);
      if (currentBusId) {
        socket.emit('unsubscribeFromBus', { busId: currentBusId });
      }
    };
  }, [accessToken, currentBusId]);

  const startTracking = (busId: string) => {
    setCurrentBusId(busId);
    socket.emit('subscribeToBus', { busId });
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (currentBusId) {
      socket.emit('unsubscribeFromBus', { busId: currentBusId });
    }
    setCurrentBusId(null);
    setIsTracking(false);
    setBusLocation(null);
  };

  return {
    busLocation,
    error,
    isTracking,
    startTracking,
    stopTracking
  };
}; 