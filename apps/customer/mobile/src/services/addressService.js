/**
 * Address Service for Mobile
 * Uses shared endpoints and mobile API client
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';

export const addressService = {
    async create(addressData) {
        try {
            return await apiClient.post(ENDPOINTS.ADDRESSES.BASE, addressData);
        } catch (error) {
            throw error;
        }
    },

    async getByUser(userId) {
        try {
            return await apiClient.get(ENDPOINTS.ADDRESSES.BY_USER(userId));
        } catch (error) {
            throw error;
        }
    },

    async getById(id) {
        try {
            return await apiClient.get(ENDPOINTS.ADDRESSES.BY_ID(id));
        } catch (error) {
            throw error;
        }
    },

    async update(id, addressData) {
        try {
            return await apiClient.patch(ENDPOINTS.ADDRESSES.BY_ID(id), addressData);
        } catch (error) {
            throw error;
        }
    },

    async delete(id) {
        try {
            return await apiClient.delete(ENDPOINTS.ADDRESSES.BY_ID(id));
        } catch (error) {
            throw error;
        }
    },
};

export default addressService;
