/**
 * Cart Service for Mobile
 * Uses shared endpoints and mobile API client
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cartService = {
    async create(cartData) {
        try {
            return await apiClient.post(ENDPOINTS.CART.BASE, cartData);
        } catch (error) {
            throw error;
        }
    },

    async getByUser(userId) {
        try {
            return await apiClient.get(ENDPOINTS.CART.BY_USER(userId));
        } catch (error) {
            throw error;
        }
    },

    async getById(id) {
        try {
            return await apiClient.get(ENDPOINTS.CART.BY_ID(id));
        } catch (error) {
            throw error;
        }
    },

    async update(id, cartData) {
        try {
            return await apiClient.patch(ENDPOINTS.CART.BY_ID(id), cartData);
        } catch (error) {
            throw error;
        }
    },

    async delete(id) {
        try {
            return await apiClient.delete(ENDPOINTS.CART.BY_ID(id));
        } catch (error) {
            throw error;
        }
    },

    async getLocalCart() {
        try {
            const cartStr = await AsyncStorage.getItem('cartItems');
            return cartStr ? JSON.parse(cartStr) : [];
        } catch (error) {
            console.error('Error getting local cart:', error);
            return [];
        }
    },

    async saveLocalCart(cartItems) {
        try {
            return await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving local cart:', error);
            throw error;
        }
    },

    async clearLocalCart() {
        try {
            return await AsyncStorage.removeItem('cartItems');
        } catch (error) {
            console.error('Error clearing local cart:', error);
            throw error;
        }
    },
};

export default cartService;
