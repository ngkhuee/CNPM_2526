/**
 * Constants for Mobile App
 */

// API Configuration
export const BACKEND_URL = 'http://192.168.0.127:4000'; // Change for production
export const API_TIMEOUT = 30000;

// Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    CART: 'cartItems',
    RECENT_SEARCHES: 'recentSearches',
};

// App Configuration
export const APP_CONFIG = {
    DEFAULT_DELIVERY_FEE: 2.0,
    DEFAULT_RADIUS: 5000, // meters
    MAX_CART_ITEMS: 50,
    ORDER_REFRESH_INTERVAL: 10000, // 10 seconds
};

export default {
    BACKEND_URL,
    API_TIMEOUT,
    STORAGE_KEYS,
    APP_CONFIG,
};
