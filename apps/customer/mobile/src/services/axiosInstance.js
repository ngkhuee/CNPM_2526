import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.0.127:4000';

const axiosInstance = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
});

// Add token to requests
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('[Axios] Error getting token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token expiration & 401/403
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            // Token expired or invalid
            try {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                // Note: App will auto logout when AuthContext detects missing token
            } catch (e) {
                console.error('[Axios] Logout error:', e);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
