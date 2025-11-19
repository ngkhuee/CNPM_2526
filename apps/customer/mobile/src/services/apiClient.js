/**
 * apiClient.js - Mobile specific API client
 * Used exclusively for React Native (not using shared-services)
 * Avoids `import.meta` error in Hermes (React Native runtime)
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from '../config/api.config';

// Get base URL from centralized config
const API_BASE_URL = apiConfig.api.baseURL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: apiConfig.api.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token from AsyncStorage
apiClient.interceptors.request.use(
    async (config) => {
        console.log('[API Request]', config.method?.toUpperCase(), config.url);

        // Get token from AsyncStorage and attach to header
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('[API Request] Token attached');
            }
        } catch (error) {
            console.error('[API Request] Error getting token:', error);
        }

        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor - log responses and handle errors
apiClient.interceptors.response.use(
    (response) => {
        console.log('[API Response]', response.status, response.config.url);
        return response.data;
    },
    async (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        console.error('[API Response Error]', status, message);

        // Log full error data for debugging
        if (error.response?.data) {
            console.error('[API Response] Backend error data:', error.response.data);
        }

        // Handle 401 - token expired or invalid credentials
        if (status === 401) {
            // Don't auto-logout for /auth/* endpoints (401 is normal for invalid credentials)
            const isAuthEndpoint = error.config?.url?.includes('/auth/');

            if (!isAuthEndpoint) {
                console.warn('[API Response] 401 Unauthorized - token may be expired');
                try {
                    // Clear token and user from storage
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    await AsyncStorage.removeItem('cartItems');

                    // Trigger auth context logout (if needed)
                    // This would normally navigate back to login screen
                } catch (clearError) {
                    console.error('[API Response] Error clearing storage:', clearError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

