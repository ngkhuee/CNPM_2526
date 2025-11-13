/**
 * Category Service for Mobile
 * Uses shared endpoints and mobile API client
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';

export const categoryService = {
    async getAll() {
        try {
            console.log('[categoryService] getAll() called');
            const response = await apiClient.get(ENDPOINTS.CATEGORIES.BASE);
            console.log('[categoryService] getAll() response:', response);

            if (!Array.isArray(response)) {
                console.warn('[categoryService] Response is not array:', typeof response);
                return [];
            }

            return response;
        } catch (error) {
            console.error('[categoryService] getAll() error:', error.message, error);
            throw error;
        }
    },

    async getById(id) {
        try {
            return await apiClient.get(ENDPOINTS.CATEGORIES.BY_ID(id));
        } catch (error) {
            throw error;
        }
    },
};

export default categoryService;
