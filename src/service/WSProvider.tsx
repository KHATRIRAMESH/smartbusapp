import { tokenStorage } from "@/store/storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";
import { refresh_tokens } from "./refreshService";

interface WSService {
  initializeSocket: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  removeListeners: (event: string) => void;
  updateAccessToken: () => void;
  disconnect: () => void;
}

const WSContext = createContext<WSService | undefined>(undefined);

export const WSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socketAccessToken, setSocketAccessToken] = useState<string | null>(
    null
  );
  const socket = useRef<Socket | null>(null);

  const createSocketConnection = (token: string) => {
    if (socket.current) {
      socket.current.disconnect();
    }

    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      extraHeaders: {
        access_token: token || "",
      },
    });

    socket.current.on("connect_error", (error: any) => {
      if (error.message === "Authentication error") {
        console.error(
          "Socket connection error: Authentication failed. Please check your access token."
        );
        refresh_tokens();
      }
    });
  };

  const initializeSocket = () => {
    const token = tokenStorage.getString("access_token");
    if (token) {
      setSocketAccessToken(token);
      createSocketConnection(token);
    }
  };

  useEffect(() => {
    const token = tokenStorage.getString("access_token");
    if (token) {
      setSocketAccessToken(token);
      createSocketConnection(token);
    }

    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, []);

  const emit = (event: string, data: any = {}) => {
    socket.current?.emit(event, data);
  };

  const on = (event: string, callback: (data: any) => void) => {
    socket.current?.on(event, callback);
  };

  const off = (event: string, callback: (data: any) => void) => {
    socket.current?.off(event, callback);
  };

  const removeListeners = (event: string) => {
    socket.current?.removeAllListeners(event);
  };

  const disconnect = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
  };

  const updateAccessToken = () => {
    const newToken = tokenStorage.getString("access_token");
    if (newToken) {
      setSocketAccessToken(newToken);
      createSocketConnection(newToken);
    }
  };

  const socketService: WSService = {
    initializeSocket,
    emit,
    on,
    off,
    removeListeners,
    updateAccessToken,
    disconnect,
  };

  return (
    <WSContext.Provider value={socketService}>{children}</WSContext.Provider>
  );
};

export const useWS = (): WSService => {
  const socketService = useContext(WSContext);
  if (!socketService) {
    throw new Error("useWS must be used within a WSProvider");
  }
  return socketService;
};
