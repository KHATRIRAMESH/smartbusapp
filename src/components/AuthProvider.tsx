import React, { useEffect, useState } from "react";
import { tokenStorage } from "@/store/storage";
import { refresh_tokens } from "@/service/refreshService";
import { Slot, useRouter, useSegments } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/authStore";
import { ActivityIndicator, View } from "react-native";
import { initializeSocketAuth } from "@/service/WSProvider";

interface JWT {
  exp: number;
  role?: string;
  id?: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const { setUser, setTokens } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          tokenStorage.get("access_token"),
          tokenStorage.get("refresh_token")
        ]);

        let isAuthenticated = false;
        let userRole: string | null = null;
        let userId: string | null = null;

        const processToken = (token: string) => {
          const decoded = jwtDecode(token) as JWT;
          if (decoded.exp * 1000 > Date.now()) {
            userRole = decoded.role || null;
            userId = decoded.id || null;
            return true;
          }
          return false;
        };

        if (accessToken) {
          try {
            isAuthenticated = processToken(accessToken);
            if (isAuthenticated) {
              initializeSocketAuth(accessToken);
            }
          } catch (e) {
            console.log("Invalid access token:", e);
          }
        }

        if (!isAuthenticated && refreshToken) {
          try {
            const newAccessToken = await refresh_tokens();
            if (newAccessToken) {
              isAuthenticated = processToken(newAccessToken);
              if (isAuthenticated) {
                initializeSocketAuth(newAccessToken);
              }
            }
          } catch (e) {
            console.log("Error refreshing token:", e);
          }
        }

        // Update auth store
        if (isAuthenticated && userRole && userId) {
          await setTokens(accessToken, refreshToken);
          await setUser({ 
            id: userId, 
            role: userRole, 
            name: '', 
            email: '', 
            phone: '' 
          });
        } else {
          await setTokens(null, null);
          await setUser(null);
        }

        // Handle navigation
        const currentSegment = segments[0] || '';
        const isAuthScreen = currentSegment === 'role' || 
                           (segments[1] === 'auth' && (currentSegment === '(parent)' || currentSegment === '(driver)'));

        if (!isAuthenticated) {
          // If not authenticated, allow only auth screens
          if (!isAuthScreen) {
            router.replace("/role");
          }
        } else {
          // If authenticated, redirect from auth screens to appropriate home
          if (isAuthScreen) {
            router.replace(userRole === "parent" ? "/(parent)/home" : "/(driver)/home");
          }
        }
      } catch (error) {
        console.error("Error in auth check:", error);
      } finally {
        setInitialized(true);
      }
    };

    checkSession();
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <Slot />;
};
