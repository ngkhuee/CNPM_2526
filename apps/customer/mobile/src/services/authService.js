// authService.js - Mobile specific authentication service
// Copy of shared logic but optimized for React Native (no import.meta)

import apiClient from './apiClient';
import { storage } from '../utils/storage';

export const authService = {
    async login(email, password) {
        try {
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            if (response.success && response.token) {
                const user = response.user;

                // Map snake_case to camelCase
                if (user.restaurant_id) {
                    user.restaurantId = user.restaurant_id;
                    delete user.restaurant_id;
                }
                if (user.full_name) {
                    user.fullName = user.full_name;
                    delete user.full_name;
                }

                // Map roles array to role string
                if (user.roles && Array.isArray(user.roles)) {
                    if (user.roles.includes('restaurant_owner')) {
                        user.role = 'restaurant';
                    } else if (user.roles.includes('admin')) {
                        user.role = 'admin';
                    } else if (user.roles.includes('customer')) {
                        user.role = 'customer';
                    } else {
                        user.role = user.roles[0];
                    }
                }

                await storage.setItem('token', response.token);
                await storage.setItem('user', JSON.stringify(user));
                await storage.setItem('lastProfileSync', Date.now().toString());

                response.user = user;
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await apiClient.post('/auth/register', userData);

            if (response.success && response.token) {
                const user = response.user;

                // Map snake_case to camelCase
                if (user.restaurant_id) {
                    user.restaurantId = user.restaurant_id;
                    delete user.restaurant_id;
                }
                if (user.full_name) {
                    user.fullName = user.full_name;
                    delete user.full_name;
                }

                // Map roles array to role string
                if (user.roles && Array.isArray(user.roles)) {
                    if (user.roles.includes('restaurant_owner')) {
                        user.role = 'restaurant';
                    } else if (user.roles.includes('admin')) {
                        user.role = 'admin';
                    } else if (user.roles.includes('customer')) {
                        user.role = 'customer';
                    } else {
                        user.role = user.roles[0];
                    }
                }

                await storage.setItem('token', response.token);
                await storage.setItem('user', JSON.stringify(user));

                response.user = user;
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        await storage.removeItem('token');
        await storage.removeItem('user');
        await storage.removeItem('cartItems');
    },

    async getCurrentUser() {
        const userStr = await storage.getItem('user');
        if (!userStr) return null;

        const user = JSON.parse(userStr);

        // Ensure mappings are applied
        if (user.restaurant_id && !user.restaurantId) {
            user.restaurantId = user.restaurant_id;
        }
        if (user.full_name && !user.fullName) {
            user.fullName = user.full_name;
        }

        return user;
    },

    async isAuthenticated() {
        const token = await storage.getItem('token');
        return !!token;
    },

    async updateProfile(userId, profileData) {
        try {
            const response = await apiClient.put(`/users/${userId}`, profileData);
            if (response.success && response.user) {
                // Apply field mappings and save to storage
                const user = response.user;
                if (user.restaurant_id && !user.restaurantId) {
                    user.restaurantId = user.restaurant_id;
                    delete user.restaurant_id;
                }
                if (user.full_name && !user.fullName) {
                    user.fullName = user.full_name;
                    delete user.full_name;
                }

                // Ensure role mapping
                if (user.roles && Array.isArray(user.roles) && !user.role) {
                    if (user.roles.includes('restaurant_owner')) {
                        user.role = 'restaurant';
                    } else if (user.roles.includes('admin')) {
                        user.role = 'admin';
                    } else if (user.roles.includes('customer')) {
                        user.role = 'customer';
                    } else {
                        user.role = user.roles[0];
                    }
                }

                await storage.setItem('user', JSON.stringify(user));
                await storage.setItem('lastProfileSync', Date.now().toString());
                response.user = user;
            }
            return response;
        } catch (error) {
            console.error("[authService.updateProfile] Error:", error);
            throw error;
        }
    },

    async refreshProfile(userId) {
        try {
            const response = await apiClient.get(`/users/${userId}`);
            if (response) {
                const user = response;
                if (user.restaurant_id && !user.restaurantId) {
                    user.restaurantId = user.restaurant_id;
                    delete user.restaurant_id;
                }
                if (user.full_name && !user.fullName) {
                    user.fullName = user.full_name;
                    delete user.full_name;
                }

                // Ensure role mapping
                if (user.roles && Array.isArray(user.roles) && !user.role) {
                    if (user.roles.includes('restaurant_owner')) {
                        user.role = 'restaurant';
                    } else if (user.roles.includes('admin')) {
                        user.role = 'admin';
                    } else if (user.roles.includes('customer')) {
                        user.role = 'customer';
                    } else {
                        user.role = user.roles[0];
                    }
                }

                await storage.setItem('user', JSON.stringify(user));
                await storage.setItem('lastProfileSync', Date.now().toString());
                return { success: true, user };
            }
            return { success: false, message: "User not found" };
        } catch (error) {
            console.error("[authService.refreshProfile] Error:", error);
            throw error;
        }
    },
};

export default authService;
