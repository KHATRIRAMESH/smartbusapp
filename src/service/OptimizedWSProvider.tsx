import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';
import { tokenStorage } from '@/store/storage';

interface ConnectionConfig {
  maxRetries: number;
  retryDelay: number;
  heartbeatInterval: number;
  reconnectionDelay: number;
}

class OptimizedSocketManager {
  private socket: Socket | null = null;
  private connectionConfig: ConnectionConfig = {
    maxRetries: 5,
    retryDelay: 1000,
    heartbeatInterval: 30000,
    reconnectionDelay: 5000,
  };
  
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private isConnecting = false;
  private messageQueue: Array<{ event: string; data: any }> = [];
  private subscribers = new Map<string, Set<(data: any) => void>>();

  // Optimization: Singleton pattern for connection management
  private static instance: OptimizedSocketManager;
  
  static getInstance(): OptimizedSocketManager {
    if (!OptimizedSocketManager.instance) {
      OptimizedSocketManager.instance = new OptimizedSocketManager();
    }
    return OptimizedSocketManager.instance;
  }

  // Optimization: Smart connection with retry logic
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await tokenStorage.get('access_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Optimization: Configure socket with optimized settings
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'], // Prefer WebSocket over polling
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: false, // Reuse existing connection
        
        // Optimization: Efficient reconnection settings
        reconnection: true,
        reconnectionDelay: this.connectionConfig.reconnectionDelay,
        reconnectionDelayMax: 30000,
        reconnectionAttempts: this.connectionConfig.maxRetries,
      });

      this.setupEventHandlers();
      this.startHeartbeat();
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.flushMessageQueue();
          resolve();
        });

        this.socket!.once('connect_error', (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          reject(error);
        });
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  // Optimization: Event handler setup
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected optimally');
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.stopHeartbeat();
      
      // Optimization: Intelligent reconnection based on reason
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect automatically
        return;
      }
      
      this.scheduleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.scheduleReconnection();
    });

    // Optimization: Heartbeat response
    this.socket.on('pong', () => {
      // Connection is alive
    });

    // Optimization: Handle server-sent events efficiently
    this.socket.on('busLocationUpdate', (data) => {
      this.notifySubscribers('busLocationUpdate', data);
    });

    this.socket.on('busStatusUpdate', (data) => {
      this.notifySubscribers('busStatusUpdate', data);
    });
  }

  // Optimization: Heartbeat to maintain connection
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, this.connectionConfig.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Optimization: Smart reconnection with exponential backoff
  private scheduleReconnection(): void {
    if (this.reconnectAttempts >= this.connectionConfig.maxRetries) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(
      this.connectionConfig.retryDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );

    console.log(`🔄 Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error('❌ Reconnection failed:', error);
      });
    }, delay);
  }

  // Optimization: Message queuing for offline scenarios
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      // Queue message for later delivery
      this.messageQueue.push({ event, data });
      
      // Attempt to reconnect
      this.connect().catch(error => {
        console.error('❌ Failed to connect for message emission:', error);
      });
    }
  }

  // Optimization: Flush queued messages
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.socket?.connected) {
        this.socket.emit(message.event, message.data);
      }
    }
  }

  // Optimization: Subscriber pattern for efficient event handling
  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    
    this.subscribers.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  // Optimization: Notify subscribers
  private notifySubscribers(event: string, data: any): void {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => callback(data));
    }
  }

  // Optimization: Get connection status
  get connected(): boolean {
    return this.socket?.connected || false;
  }

  // Optimization: Clean disconnect
  disconnect(): void {
    this.stopHeartbeat();
    this.messageQueue = [];
    this.subscribers.clear();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export optimized socket instance
export const optimizedSocket = OptimizedSocketManager.getInstance();

// Optimization: React hook for socket connection
export const useOptimizedSocket = () => {
  return {
    socket: optimizedSocket,
    connected: optimizedSocket.connected,
    emit: optimizedSocket.emit.bind(optimizedSocket),
    subscribe: optimizedSocket.subscribe.bind(optimizedSocket),
  };
}; 