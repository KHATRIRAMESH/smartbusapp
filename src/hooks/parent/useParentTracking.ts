import { useState, useEffect, useRef } from 'react';
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
  isStale: boolean;
  startTracking: (busId: string) => void;
  stopTracking: () => void;
  reconnect: () => void;
}

const STALE_THRESHOLD = 30000; // 30 seconds

export const useParentTracking = (): UseParentTrackingReturn => {
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [currentBusId, setCurrentBusId] = useState<string | null>(null);
  const { accessToken } = useAuthStore();
  const staleCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for stale data
  useEffect(() => {
    if (isTracking && busLocation) {
      staleCheckInterval.current = setInterval(() => {
        const now = new Date().getTime();
        const lastUpdate = new Date(busLocation.lastUpdated).getTime();
        setIsStale(now - lastUpdate > STALE_THRESHOLD);
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (staleCheckInterval.current) {
        clearInterval(staleCheckInterval.current);
      }
    };
  }, [isTracking, busLocation]);

  useEffect(() => {
    if (!socket.connected && accessToken) {
      console.log('Setting up socket auth and connecting...');
      socket.auth = { token: accessToken };
      socket.connect();
    }

    const handleConnect = () => {
      console.log('Socket connected in parent tracking');
      console.log('Socket ID:', socket.id);
      // If we were trying to track a bus, resubscribe
      if (currentBusId) {
        console.log('Resubscribing to bus after reconnection:', currentBusId);
        socket.emit('subscribeToBus', { busId: currentBusId });
      }
    };

    const handleBusLocation = (data: any) => {
      console.log('🚌 Received bus location update:', data);
      console.log('🚌 Data type:', typeof data);
      console.log('🚌 Data coords:', data.coords);
      
      if (data && data.coords) {
        const locationData = {
          coords: data.coords,
          status: data.status,
          lastUpdated: new Date()
        };
        console.log('🚌 Setting bus location:', locationData);
        setBusLocation(locationData);
        setError(null);
        setIsStale(false);
      } else {
        console.log('🚌 Invalid data structure received:', data);
      }
    };

    const handleBusOffline = (data: { busId: string }) => {
      console.log('Bus went offline:', data);
      if (data.busId === currentBusId) {
        setError('Bus is currently offline');
        setBusLocation(prev => prev ? { ...prev, status: 'offline' } : null);
      }
    };

    const handleBusStatusUpdate = (data: any) => {
      console.log('🚌 Received bus status update:', data);
      
      if (data && data.busId === currentBusId) {
        setBusLocation(prev => prev ? { 
          ...prev, 
          status: data.status,
          lastUpdated: new Date(data.lastUpdated || Date.now())
        } : {
          coords: { latitude: 0, longitude: 0, speed: null, heading: null },
          status: data.status,
          lastUpdated: new Date(data.lastUpdated || Date.now())
        });
        
        if (data.status === 'offline') {
          setError('Bus is currently offline');
        } else {
          setError(null);
        }
        
        setIsStale(false);
      }
    };

    const handleError = (err: Error) => {
      console.error('Socket error:', err);
      setError('Connection error: ' + err.message);
      
      // Attempt to reconnect after 5 seconds
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      reconnectTimeout.current = setTimeout(() => {
        if (isTracking && currentBusId) {
          reconnect();
        }
      }, 5000);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setError('Connection lost. Attempting to reconnect...');
      
      // Attempt to reconnect after 3 seconds
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      reconnectTimeout.current = setTimeout(() => {
        if (isTracking && currentBusId) {
          reconnect();
        }
      }, 3000);
    };

    // Add debugging for all socket events
    socket.onAny((eventName, ...args) => {
      console.log(`🔌 Socket event received: ${eventName}`, args);
    });

    // Handle pong response
    socket.on('pong', (data) => {
      console.log('🏓 Received pong:', data);
    });

    socket.on('connect', handleConnect);
    socket.on('busLocationUpdate', handleBusLocation);
    socket.on('busOffline', handleBusOffline);
    socket.on('busStatusUpdate', handleBusStatusUpdate);
    socket.on('error', handleError);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('busLocationUpdate', handleBusLocation);
      socket.off('busOffline', handleBusOffline);
      socket.off('busStatusUpdate', handleBusStatusUpdate);
      socket.off('error', handleError);
      socket.off('disconnect', handleDisconnect);
      socket.off('pong');
      socket.offAny();
      
      if (currentBusId) {
        socket.emit('unsubscribeFromBus', { busId: currentBusId });
      }
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      
      if (staleCheckInterval.current) {
        clearInterval(staleCheckInterval.current);
      }
    };
  }, [accessToken, currentBusId, isTracking]);

  const startTracking = (busId: string) => {
    console.log('🚌 Parent: Starting to track bus:', busId);
    console.log('🔌 Socket connected:', socket.connected);
    console.log('🔌 Socket ID:', socket.id);
    console.log('🔌 Socket auth:', socket.auth);
    
    setCurrentBusId(busId);
    
    // Test socket communication first
    socket.emit('ping', { busId, action: 'startTracking', timestamp: new Date() });
    
    if (socket.connected) {
      console.log('📡 Emitting subscribeToBus event with busId:', busId);
      socket.emit('subscribeToBus', { busId });
      console.log('✅ Emitted subscribeToBus event');
    } else {
      console.log('🔌 Socket not connected, attempting to connect...');
      socket.auth = { token: accessToken };
      socket.connect();
      
      const handleConnect = () => {
        console.log('✅ Socket connected after manual connection');
        console.log('📡 Emitting subscribeToBus event after connection with busId:', busId);
        socket.emit('subscribeToBus', { busId });
        console.log('✅ Emitted subscribeToBus event after connection');
        socket.removeListener('connect', handleConnect);
        socket.removeListener('connect_error', handleConnectError);
      };
      
      const handleConnectError = (err: Error) => {
        console.error('❌ Socket connection error:', err);
        setError('Failed to connect to tracking service: ' + err.message);
        socket.removeListener('connect', handleConnect);
        socket.removeListener('connect_error', handleConnectError);
      };
      
      socket.on('connect', handleConnect);
      socket.on('connect_error', handleConnectError);
    }
    
    setIsTracking(true);
    setError(null);
    setIsStale(false);
  };

  const stopTracking = () => {
    if (currentBusId) {
      socket.emit('unsubscribeFromBus', { busId: currentBusId });
    }
    setCurrentBusId(null);
    setIsTracking(false);
    setBusLocation(null);
    setError(null);
    setIsStale(false);
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    if (staleCheckInterval.current) {
      clearInterval(staleCheckInterval.current);
    }
  };

  const reconnect = () => {
    if (!socket.connected) {
      socket.connect();
    }
    if (currentBusId) {
      socket.emit('subscribeToBus', { busId: currentBusId });
    }
  };

  return {
    busLocation,
    error,
    isTracking,
    isStale,
    startTracking,
    stopTracking,
    reconnect
  };
}; 