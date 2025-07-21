import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function ParentLayout() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    console.log('[ParentLayout] Loading auth data from storage...');
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
} 