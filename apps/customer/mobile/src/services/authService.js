// Mobile version of authService - using mobile-specific API client
import apiClient, { ENDPOINTS } from '../config/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    async login(email, password) {
        try {
            const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
                email,
                password,
            });
            if (response.success && response.token) {
                // Map snake_case fields to camelCase for frontend
                const user = response.user;

                // Map restaurant_id → restaurantId
                if (user.restaurant_id) {
                    user.restaurantId = user.restaurant_id;
                    delete user.restaurant_id;
                }

                // Map full_name → fullName
                if (user.full_name) {
                    user.fullName = user.full_name;
                    delete user.full_name;
                }

                // Map roles array → role string for compatibility
                if (user.roles && Array.isArray(user.roles)) {
                    // Convert roles array to single role string
                    if (user.roles.indexOf('restaurant_owner') !== -1) {
                        user.role = 'restaurant';
                    } else if (user.roles.indexOf('admin') !== -1) {
                        user.role = 'admin';
                    } else if (user.roles.indexOf('customer') !== -1) {
                        user.role = 'customer';
                    } else {
                        user.role = user.roles[0]; // fallback to first role
                    }
                }

                // Save to AsyncStorage instead of localStorage
                await AsyncStorage.setItem('token', response.token);
                await AsyncStorage.setItem('user', JSON.stringify(user));
                response.user = user;
                return response;
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
            if (response.success && response.token) {
                // Map snake_case fields to camelCase for frontend
                const user = response.user;

                // Map restaurant_id → restaurantId
                if (user.restaurant_id) {
                    user.restaurantId = user.restaurant_id;
                    delete user.restaurant_id;
                }

                // Map full_name → fullName
                if (user.full_name) {
                    user.fullName = user.full_name;
                    delete user.full_name;
                }

                // Map roles array → role string for compatibility
                if (user.roles && Array.isArray(user.roles)) {
                    // Convert roles array to single role string
                    if (user.roles.indexOf('restaurant_owner') !== -1) {
                        user.role = 'restaurant';
                    } else if (user.roles.indexOf('admin') !== -1) {
                        user.role = 'admin';
                    } else if (user.roles.indexOf('customer') !== -1) {
                        user.role = 'customer';
                    } else {
                        user.role = user.roles[0]; // fallback to first role
                    }
                }

                // Save to AsyncStorage instead of localStorage
                await AsyncStorage.setItem('token', response.token);
                await AsyncStorage.setItem('user', JSON.stringify(user));
                response.user = user;
                return response;
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        // Clear from AsyncStorage
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('cartItems');
        } catch (error) {
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            const userStr = await AsyncStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    async isAuthenticated() {
        try {
            const token = await AsyncStorage.getItem('token');
            return !!token;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    },

    // Admin: Get all users
    async getAllUsers() {
        try {
            return await apiClient.get(`/users?_t=${Date.now()}`);
        } catch (error) {
            throw error;
        }
    },

    // Admin: Update user status
    async updateUserStatus(userId, status) {
        try {
            return await apiClient.patch(`/users/${userId}`, { status });
        } catch (error) {
            throw error;
        }
    },

    // Admin: Delete user
    async deleteUser(userId) {
        try {
            return await apiClient.delete(`/users/${userId}`);
        } catch (error) {
            throw error;
        }
    },
};

export default authService;
