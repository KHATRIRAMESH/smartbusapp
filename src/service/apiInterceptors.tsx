// @ts-ignore
import axios from "axios";
// @ts-ignore
import type { AxiosRequestConfig } from "axios";
import { BASE_URL } from "./config";
import { tokenStorage } from "@/store/storage";
import { refresh_tokens } from "./refreshService";

export const appAxios = axios.create({
  baseURL: BASE_URL,
});

appAxios.interceptors.request.use((config: AxiosRequestConfig) => {
  const accessToken = tokenStorage.getString("access_token");
  if (!config.headers) config.headers = {};
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

appAxios.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refresh_tokens();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest); // Retry the failed request
      }
    }

    return Promise.reject(error);
  }
);
