/**
 * apiClient.js - Mobile specific API client
 * Dùng riêng cho React Native (không dùng shared-services)
 * Tránh `import.meta` error trong Hermes (React Native runtime)
 */

import axios from 'axios';
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

// Interceptor để log requests (debug)
apiClient.interceptors.request.use(
    (config) => {
        console.log('[API Request]', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Interceptor để log responses
apiClient.interceptors.response.use(
    (response) => {
        console.log('[API Response]', response.status, response.config.url);
        return response.data;
    },
    (error) => {
        console.error('[API Response Error]', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
