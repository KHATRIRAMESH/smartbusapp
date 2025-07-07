import axios from "axios";
import { tokenStorage } from "@/store/storage";
import { BASE_URL } from "./config";
import { resetAndNavigate } from "@/utils/Helpers";

// Create a separate axios instance for token refresh
const refreshAxios = axios.create({
  baseURL: BASE_URL,
});

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

const handleLogout = async () => {
  await tokenStorage.clearAll();
  resetAndNavigate("/role");
};

export const refresh_tokens = async (): Promise<string | null> => {
  try {
    const refreshToken = await tokenStorage.get("refresh_token");
    if (!refreshToken) {
      await handleLogout();
      return null;
    }

    const response = await refreshAxios.post<RefreshResponse>("/auth/refresh-token", {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token } = response.data;

    if (access_token && refresh_token) {
      await tokenStorage.set("access_token", access_token);
      await tokenStorage.set("refresh_token", refresh_token);
      return access_token;
    }

    await handleLogout();
    return null;
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    await handleLogout();
    return null;
  }
};
