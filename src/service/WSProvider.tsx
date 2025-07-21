import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

// Create socket instance without any dependencies
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

// Add event listeners for debugging
if (__DEV__) {
  socket.on('connect', () => {
    console.log('🔌 Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('🔌 Socket error:', error);
  });

  socket.on('reconnect', (attempt) => {
    console.log(`🔌 Socket reconnected after ${attempt} attempts`);
  });

  socket.on('reconnect_error', (error) => {
    console.error('🔌 Socket reconnection error:', error);
  });
}

// Export a function to initialize socket auth
export const initializeSocketAuth = (accessToken: string) => {
  console.log('🔑 Initializing socket auth with token:', !!accessToken);
  socket.auth = { token: accessToken };
  if (!socket.connected) {
    console.log('🔌 Connecting socket with new auth...');
    socket.connect();
  }
};

// Export a function to disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
  }
};

// Export a function to check connection status
export const isSocketConnected = () => {
  return socket.connected;
};

export default socket;
