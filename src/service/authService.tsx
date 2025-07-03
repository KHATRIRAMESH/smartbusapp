import { useDriverStore } from "@/store/driverStore";
import { tokenStorage } from "@/store/storage";
import { resetAndNavigate } from "@/utils/Helpers";
import { appAxios } from "./apiInterceptors";
import { Alert } from "react-native";
import { BASE_URL } from "./config";
import { useAuthStore } from "@/store/authStore";

export const signin = async (
  payload: {
    role: "driver";
    phone: string;
  },
  updateAccessToken: () => void
) => {
  const { setUser: setDriverUser } = useDriverStore.getState();

  try {
    const res = await appAxios.post(`/auth/signin`, payload);
    console.log("res", res);
    const data = res.data as { user: any; access_token: string; refresh_token: string };

    tokenStorage.set("user_role", payload.role);

    setDriverUser(data.user);
    tokenStorage.set("access_token", data.access_token);
    tokenStorage.set("refresh_token", data.refresh_token);

    resetAndNavigate("/driver/home");
    updateAccessToken();
  } catch (error: any) {
    Alert.alert(
      "Error",
      "An error occurred while signing in. Please try again."
    );
    console.error("Signin error:", error || "Error signin");
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
    const res = await appAxios.post(`/parent/login`, payload);
    const data = res.data as { access_token: string; refresh_token: string; user: any };
    tokenStorage.set("user_role", "parent");
    tokenStorage.set("access_token", data.access_token);
    tokenStorage.set("refresh_token", data.refresh_token);
    tokenStorage.set("user", JSON.stringify(data.user));
    setUser(data.user, "parent");
    resetAndNavigate("/parent/home");
    updateAccessToken();
  } catch (error: any) {
    Alert.alert(
      "Error",
      "An error occurred while signing in. Please try again."
    );
    console.error("Parent signin error:", error || "Error signin");
  }
};

export const logout = async (disconnect?: () => void) => {
  const { clearDriverData } = useDriverStore.getState();
  const { clearAuth } = useAuthStore.getState();
  tokenStorage.clearAll();
  clearDriverData();
  clearAuth();
  resetAndNavigate("/role");
};
