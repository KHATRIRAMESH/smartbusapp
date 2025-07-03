import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";
import { MMKV } from 'react-native-mmkv';

type CustomLocation = {
  latitude: number;
  longitude: number;
  address: string;
  heading: number;
} | null;

interface DriverStoreProps {
  user: any;
  location: CustomLocation;
  outOfRange: boolean;
  busId: string | null;
  status: string;
  setUser: (data: any) => void;
  setOnDuty: (data: boolean) => void;
  setLocation: (data: CustomLocation) => void;
  clearDriverData: () => void;
  setBusId: (id: string | null) => void;
  setBusStatus: (status: string) => void;
  clearDriverStore: () => void;
}

const storage = new MMKV();

export const useDriverStore = create<DriverStoreProps>()(
  persist(
    (set) => ({
      user: null,
      location: null,
      outOfRange: false,
      busId: storage.getString('busId') || null,
      status: storage.getString('busStatus') || 'offline',
      setUser: (data) => set({ user: data }),
      setOnDuty: (data) => set({ outOfRange: data }),
      setLocation: (data) => set({ location: data }),
      clearDriverData: () =>
        set({ user: null, location: null, outOfRange: false }),
      setBusId: (id) => {
        if (id) {
          storage.set('busId', id);
        } else {
          storage.delete('busId');
        }
        set({ busId: id });
      },
      setBusStatus: (status) => {
        storage.set('busStatus', status);
        set({ status });
      },
      clearDriverStore: () => {
        storage.delete('busId');
        storage.delete('busStatus');
        set({ busId: null, status: 'offline' });
      },
    }),
    {
      name: "driver-storage",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
