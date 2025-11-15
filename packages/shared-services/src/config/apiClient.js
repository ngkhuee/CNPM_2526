import axios from "axios";
import { storage } from "../utils/storage";

const API_BASE_URL = (() => {
  // Check for Node/React Native environment first (priority for mobile)
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // Check for Vite environment (web)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Default
  return "http://localhost:4000";
})();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // List of public endpoints that don't require auth
      const publicEndpoints = [
        "/auth/login",
        "/auth/register",
        "/foods",
        "/menus",
        "/restaurants",
        "/categories",
        "/promotions",
      ];

      const requestUrl = error.config?.url || "";
      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        requestUrl.includes(endpoint)
      );

      // Only clear auth data if NOT a public endpoint
      if (!isPublicEndpoint) {
        console.warn("Unauthorized - Clearing auth data");
        await storage.removeItem("token");
        await storage.removeItem("user");

        // Don't force redirect - let components handle it
        // This prevents infinite refresh loops
        console.warn("Unauthorized - Please login");
      } else {
        console.warn("401 on public endpoint, ignoring:", requestUrl);
      }
    }

    const errorMessage =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
