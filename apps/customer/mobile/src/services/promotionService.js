/**
 * Promotion Service for Mobile
 * Uses shared endpoints and mobile API client
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';

export const promotionService = {
    async getAll() {
        try {
            return await apiClient.get(ENDPOINTS.PROMOTIONS.BASE);
        } catch (error) {
            throw error;
        }
    },

    async getByCode(code) {
        try {
            return await apiClient.get(ENDPOINTS.PROMOTIONS.BY_CODE(code));
        } catch (error) {
            throw error;
        }
    },

    async getActive() {
        try {
            return await apiClient.get(ENDPOINTS.PROMOTIONS.ACTIVE);
        } catch (error) {
            throw error;
        }
    },
};

export default promotionService;
