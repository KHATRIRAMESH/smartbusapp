import { Stack } from "expo-router";
import { useEffect } from "react";
import { useDriverStore } from "@/store/driverStore";

export default function DriverLayout() {
  const { loadFromStorage } = useDriverStore();

  useEffect(() => {
    // Load driver data from storage when the layout mounts
    loadFromStorage();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
} 