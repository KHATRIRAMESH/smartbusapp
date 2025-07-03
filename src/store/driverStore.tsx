import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";

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
  setUser: (data: any) => void;
  setOnDuty: (data: boolean) => void;
  setLocation: (data: CustomLocation) => void;
  clearDriverData: () => void;
}

export const useDriverStore = create<DriverStoreProps>()(
  persist(
    (set) => ({
      user: null,
      location: null,
      outOfRange: false,
      setUser: (data) => set({ user: data }),
      setOnDuty: (data) => set({ outOfRange: data }),
      setLocation: (data) => set({ location: data }),
      clearDriverData: () =>
        set({ user: null, location: null, outOfRange: false }),
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
