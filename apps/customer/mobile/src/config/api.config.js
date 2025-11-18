/**
 * API Configuration - Centralized API URLs
 * Support for local development, staging, and production
 */

import Constants from 'expo-constants';

// Get environment - default to development
const ENV = process.env.EXPO_PUBLIC_ENV || 'development';

// API Configurations based on environment
const API_CONFIGS = {
    development: {
        baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000',
        timeout: 10000,
    },
    staging: {
        baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api-staging.yummy.com',
        timeout: 10000,
    },
    production: {
        baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.yummy.com',
        timeout: 10000,
    },
};

// Get current config
const API_CONFIG = API_CONFIGS[ENV] || API_CONFIGS.development;

export default {
    env: ENV,
    api: {
        baseURL: API_CONFIG.baseURL,
        timeout: API_CONFIG.timeout,
        endpoints: {
            // Auth
            login: '/auth/login',
            register: '/auth/register',

            // Users
            users: '/users',
            profile: '/users/:id',

            // Restaurants
            restaurants: '/restaurants',
            restaurantDetail: '/restaurants/:id',
            restaurantMenu: '/restaurants/:id/menu',

            // Menus/Foods
            menus: '/menus',
            menuDetail: '/menus/:id',

            // Orders
            orders: '/orders',
            orderDetail: '/orders/:id',
            createOrder: '/orders',
            cancelOrder: '/orders/:id/cancel',
            checkPendingExpiry: '/orders/check-pending-expiry',

            // Cart
            cart: '/carts',
            addToCart: '/carts/add',
            updateCartItem: '/carts/item/:id',
            removeFromCart: '/carts/item/:id',
            clearCart: '/carts/clear',

            // Categories
            categories: '/categories',

            // Reviews
            reviews: '/reviews',
            createReview: '/reviews',

            // Addresses
            addresses: '/addresses',

            // Payments
            payments: '/payments',

            // Upload
            upload: '/upload',

            // Promotions
            promotions: '/promotions',
        },
    },
};
