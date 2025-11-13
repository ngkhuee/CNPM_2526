/**
 * Mobile API Client - React Native AsyncStorage support
 * Mirrors shared-services but with AsyncStorage for mobile
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Endpoints (copied from shared-services for consistency)
export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/users',
    },
    RESTAURANTS: {
        BASE: '/restaurants',
        BY_ID: (id) => `/restaurants/${id}`,
        MENU: (id) => `/restaurants/${id}/menu`,
        ORDERS: (id) => `/orders?restaurant_id=${id}`,
    },
    MENUS: {
        BASE: '/menus',
        BY_ID: (id) => `/menu/${id}`,
        BY_RESTAURANT: (restaurantId) => `/menus?restaurant_id=${restaurantId}`,
        BY_CATEGORY: (categoryId) => `/menus?category=${categoryId}`,
        SEARCH: (query) => `/menus?q=${query}`,
    },
    FOODS: {
        BASE: '/menus',
        BY_ID: (id) => `/menu/${id}`,
        BY_RESTAURANT: (restaurantId) => `/menus?restaurant_id=${restaurantId}`,
        BY_CATEGORY: (categoryId) => `/menus?category=${categoryId}`,
        SEARCH: (query) => `/menus?q=${query}`,
    },
    CATEGORIES: {
        BASE: '/categories',
        BY_ID: (id) => `/categories/${id}`,
    },
    ORDERS: {
        BASE: '/orders',
        BY_ID: (id) => `/orders/${id}`,
        BY_USER: (userId) => `/orders?user_id=${userId}`,
        BY_RESTAURANT: (restaurantId) => `/orders?restaurant_id=${restaurantId}`,
    },
    CART: {
        BASE: '/carts',
        BY_USER: (userId) => `/carts?user_id=${userId}`,
        BY_ID: (id) => `/carts/${id}`,
    },
    PROMOTIONS: {
        BASE: '/promotions',
        BY_CODE: (code) => `/promotions?code=${code}`,
        ACTIVE: '/promotions?status=active',
    },
    REVIEWS: {
        BASE: '/reviews',
        BY_FOOD: (foodId) => `/reviews?food_id=${foodId}`,
        BY_USER: (userId) => `/reviews?user_id=${userId}`,
        BY_RESTAURANT: (restaurantId) => `/reviews?restaurant_id=${restaurantId}`,
    },
    PAYMENTS: {
        BASE: '/payments',
        BY_ID: (id) => `/payments/${id}`,
        BY_ORDER: (orderId) => `/payments?orderId=${orderId}`,
        PROCESS: '/payments/process',
        CALLBACK: '/payments/callback',
    },
    ADDRESSES: {
        BASE: '/addresses',
        BY_USER: (userId) => `/addresses?user_id=${userId}`,
        BY_ID: (id) => `/addresses/${id}`,
    },
};

// Support both development and production
const API_BASE_URL = (() => {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }
    // Default for development - adjust if needed
    return 'http://192.168.0.127:4000';
})();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - AsyncStorage compatible
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error reading token from AsyncStorage:', error);
        }
        console.log('[apiClient] REQUEST:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('[apiClient] REQUEST ERROR:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        console.log('[apiClient] RESPONSE SUCCESS:', response.config?.url, 'status:', response.status, 'data type:', Array.isArray(response.data) ? 'array' : typeof response.data);
        return response.data;
    },
    async (error) => {
        console.error('[apiClient] RESPONSE ERROR:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });

        if (error.response && error.response.status === 401) {
            // List of public endpoints that don't require auth
            const publicEndpoints = [
                '/auth/login',
                '/auth/register',
                '/menus',
                '/restaurants',
                '/categories',
                '/promotions',
            ];

            const requestUrl = (error.config && error.config.url) || '';
            const isPublicEndpoint = publicEndpoints.some((endpoint) =>
                requestUrl.indexOf(endpoint) !== -1
            );

            // Only clear auth data if NOT a public endpoint
            if (!isPublicEndpoint) {
                console.warn('Unauthorized - Clearing auth data');
                try {
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                } catch (err) {
                    console.error('Error clearing AsyncStorage:', err);
                }
            } else {
                console.warn('401 on public endpoint, ignoring:', requestUrl);
            }
        }

        const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || 'Something went wrong';
        return Promise.reject(new Error(errorMessage));
    }
);

export default apiClient;
