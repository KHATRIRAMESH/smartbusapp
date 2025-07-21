import axios from "axios";
import { tokenStorage } from "@/store/storage";
import { BASE_URL } from "./config";
import { refresh_tokens } from "./refreshService";

// Create axios instance with base URL
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: any) => {
    try {
      const accessToken = await tokenStorage.get("access_token");
      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Token available: ${accessToken ? 'YES' : 'NO'}`);
      } else {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - No token available`);
      }
      return config;
    } catch (error) {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, 
                response.status, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newAccessToken = await refresh_tokens();
        
        if (newAccessToken) {
          // Update the authorization header
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // Retry the original request
          console.log('[API] Retrying request with new token');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[Token Refresh Error]', refreshError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
