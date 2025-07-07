import axios from 'axios';
import { useDriverStore } from "@/store/driverStore";
import { tokenStorage } from "@/store/storage";
import { resetAndNavigate } from "@/utils/Helpers";
import { Alert } from "react-native";
import { BASE_URL } from "./config";
import { useAuthStore } from "@/store/authStore";
import { ParentProfile } from '@/utils/types/types';

// Create a separate axios instance for auth
export const authAxios = axios.create({
  baseURL: BASE_URL,
});

export const signin = async (
  payload: {
    role: "driver";
    email: string;
    password: string;
  },
  updateAccessToken: () => void
) => {
  const { setUser: setDriverUser } = useDriverStore.getState();

  try {
    const res = await authAxios.post(`/driver/login`, payload);
    const data = res.data as { user: any; access_token: string; refresh_token: string };

    // First store the tokens
    await tokenStorage.set("access_token", data.access_token);
    await tokenStorage.set("refresh_token", data.refresh_token);
    await tokenStorage.set("user_role", payload.role);

    // Then set the user data
    setDriverUser(data.user);

    // Update token and navigate
    updateAccessToken();
    resetAndNavigate("/(driver)/home" as any);
  } catch (error: any) {
    Alert.alert(
      "Error",
      error.response?.data?.message || "An error occurred while signing in. Please try again."
    );
    console.error("Signin error:", error || "Error signin");
    throw error; // Re-throw to handle in the UI
  }
};

export const parentSignin = async (
  payload: {
    email: string;
    password: string;
  },
  updateAccessToken: () => void
) => {
  const { setUser } = useAuthStore.getState();
  try {
    const res = await authAxios.post(`/parent/login`, payload);
    const data = res.data as { access_token: string; refresh_token: string; user: ParentProfile };
    const userWithRole = {
      ...data.user,
      role: 'parent'
    };

    // First store the tokens
    await tokenStorage.set("access_token", data.access_token);
    await tokenStorage.set("refresh_token", data.refresh_token);
    await tokenStorage.set("user_role", "parent");
    await tokenStorage.set("user", JSON.stringify(userWithRole));

    // Then set the user data
    setUser(userWithRole);

    // Update token and navigate
    updateAccessToken();
    resetAndNavigate("/(parent)/home" as any);
  } catch (error: any) {
    Alert.alert(
      "Error",
      error.response?.data?.message || "An error occurred while signing in. Please try again."
    );
    console.error("Parent signin error:", error || "Error signin");
    throw error; // Re-throw to handle in the UI
  }
};

export const logout = async () => {
  const { clearDriverData } = useDriverStore.getState();
  const { logout: clearAuth } = useAuthStore.getState();
  
  // Clear store data
  clearDriverData();
  clearAuth();
  
  // Clear storage and navigate
  await tokenStorage.clearAll();
  resetAndNavigate("/role");
};
