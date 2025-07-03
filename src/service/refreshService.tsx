import { tokenStorage } from "@/store/storage";
import { appAxios } from "./apiInterceptors";
import { logout } from "./authService";

export const refresh_tokens = async () => {
  try {
    const refreshToken = tokenStorage.getString("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    const response = await appAxios.post(`/auth/refresh-token`, {
      refresh_token: refreshToken,
    });
    const data = response.data as { access_token: string; refresh_token: string };
    const new_access_token = data.access_token;
    const new_refresh_token = data.refresh_token;

    tokenStorage.set("access_token", new_access_token);
    tokenStorage.set("refresh_token", new_refresh_token);

    return new_access_token;
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    tokenStorage.clearAll?.(); // optional chaining in case not available
    logout(); // redirect to login or clear state
    return null;
  }
};
