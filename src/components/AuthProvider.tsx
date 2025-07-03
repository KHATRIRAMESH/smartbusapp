import React, { useEffect, useState } from "react";
import { tokenStorage } from "@/store/storage";
import { refresh_tokens } from "@/service/refreshService";
import { useRouter, useSegments } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/authStore";
import { ActivityIndicator, View } from "react-native";
import { initializeSocketAuth } from "@/service/WSProvider";

interface JWT {
  exp: number;
  role: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { setUser, loadFromStorage } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      // Try to load user from MMKV first
      loadFromStorage();
      const accessToken = tokenStorage.getString("access_token");
      const refreshToken = tokenStorage.getString("refresh_token");
      let isAuthenticated = false;
      let userRole: string | null = null;

      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken) as JWT;
          userRole = decoded.role;
          if (decoded.exp * 1000 > Date.now()) {
            isAuthenticated = true;
            // Initialize socket connection with the access token
            initializeSocketAuth(accessToken);
          }
        } catch (e) {
          // Invalid token, try refresh
        }
      }
      if (!isAuthenticated && refreshToken) {
        const newAccessToken = await refresh_tokens();
        if (newAccessToken) {
          try {
            const decoded = jwtDecode(newAccessToken) as JWT;
            userRole = decoded.role;
            if (decoded.exp * 1000 > Date.now()) {
              isAuthenticated = true;
              // Initialize socket connection with the new access token
              initializeSocketAuth(newAccessToken);
            }
          } catch (e) {}
        }
      }
      if (!isAuthenticated) {
        setLoading(false);
        router.replace("/role"); // Show role selection/login
        return;
      }
      // If already on login/role, redirect to home
      const segArr = segments as string[];
      const seg1 = segArr[1] || "";
      const seg2 = segArr[2] || "";
      if (
        seg1 === "role" ||
        (seg1 === "parent" && seg2 === "auth") ||
        (seg1 === "driver" && seg2 === "auth")
      ) {
        if (userRole === "parent") router.replace("/parent/home" as any);
        else if (userRole === "driver") router.replace("/screens/driver/HomeScreen" as any);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};
