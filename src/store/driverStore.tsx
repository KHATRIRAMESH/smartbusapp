import { create } from "zustand";
import { tokenStorage } from "./storage";
import { Driver } from "@/utils/types/types";
import { getDriverBus } from "@/service/driver";

interface DriverState {
  user: Driver | null;
  busId: string | null;
  busInfo: any | null;
  status: 'online' | 'offline' | 'on_trip';
  isLoading: boolean;
  error: string | null;
  setUser: (user: Driver | null) => void;
  setBusId: (busId: string) => void;
  setBusInfo: (busInfo: any) => void;
  setStatus: (status: 'online' | 'offline' | 'on_trip') => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearDriverData: () => void;
  loadFromStorage: () => Promise<void>;
  loadDriverBus: () => Promise<void>;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  user: null,
  busId: null,
  busInfo: null,
  status: 'offline',
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user });
    if (user) {
      tokenStorage.set('driver_user', JSON.stringify(user));
    } else {
      tokenStorage.delete('driver_user');
    }
  },

  setBusId: async (busId) => {
    await tokenStorage.set('busId', busId);
    set({ busId });
  },

  setBusInfo: (busInfo) => {
    set({ busInfo });
    if (busInfo) {
      get().setBusId(busInfo.id);
    }
  },

  setStatus: async (status) => {
    console.log('DriverStore: Setting status to:', status);
    await tokenStorage.set('busStatus', status);
    set({ status });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearDriverData: async () => {
    await Promise.all([
      tokenStorage.delete('busId'),
      tokenStorage.delete('busStatus'),
      tokenStorage.delete('driver_user'),
    ]);
    
    set({
      user: null,
      busId: null,
      busInfo: null,
      status: 'offline',
      error: null,
    });
  },

  loadFromStorage: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const [busId, status, userStr] = await Promise.all([
        tokenStorage.get('busId'),
        tokenStorage.get('busStatus'),
        tokenStorage.get('driver_user'),
      ]);

      const user = userStr ? JSON.parse(userStr) as Driver : null;

      set({
        busId: busId || null,
        status: (status as 'online' | 'offline' | 'on_trip') || 'offline',
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading driver data from storage:', error);
      set({ 
        error: 'Failed to load driver data',
        isLoading: false,
      });
    }
  },

  loadDriverBus: async () => {
    try {
      set({ isLoading: true, error: null });
      const busInfo = await getDriverBus();
      set({ busInfo, busId: busInfo.id, isLoading: false });
    } catch (error) {
      console.error('Error loading driver bus:', error);
      set({ 
        error: 'Failed to load bus information',
        isLoading: false,
      });
    }
  },
}));
