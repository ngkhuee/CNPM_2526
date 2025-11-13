/**
 * Menu/Food Service for Mobile
 * Data mapping layer - converts backend (snake_case) to frontend (camelCase)
 * Mirrors shared-services logic but works with mobile API client
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';

export const foodService = {
    async getAll(params = {}) {
        try {
            console.log('[foodService] getAll() called');
            const response = await apiClient.get(ENDPOINTS.MENUS.BASE, { params });
            console.log('[foodService] getAll() response:', response);

            if (!Array.isArray(response)) {
                console.warn('[foodService] Response is not array:', typeof response);
                return [];
            }

            // Map backend (snake_case) to frontend (camelCase)
            return response.map((menu) => ({
                id: menu.id,
                _id: menu.id,
                name: menu.name,
                restaurantId: menu.restaurant_id,
                categoryId: menu.category_id,
                price: menu.price,
                description: menu.description,
                image: menu.image,
                isAvailable: menu.is_available,
                preparationTime: menu.preparation_time_minutes,
                rating: menu.rating || 0,
                sold: menu.sold || 0,
                createdAt: menu.created_at,
                updatedAt: menu.updated_at,
            }));
        } catch (error) {
            console.error('[foodService] getAll() error:', error.message, error);
            throw error;
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(ENDPOINTS.MENUS.BY_ID(id));
            return {
                id: response.id,
                _id: response.id,
                name: response.name,
                restaurantId: response.restaurant_id,
                categoryId: response.category_id,
                price: response.price,
                description: response.description,
                image: response.image,
                isAvailable: response.is_available,
                preparationTime: response.preparation_time_minutes,
                rating: response.rating || 0,
                sold: response.sold || 0,
                createdAt: response.created_at,
                updatedAt: response.updated_at,
            };
        } catch (error) {
            throw error;
        }
    },

    async getByRestaurant(restaurantId) {
        try {
            const response = await apiClient.get(`/restaurants/${restaurantId}/menu`);
            return response.map((menu) => ({
                id: menu.id,
                _id: menu.id,
                name: menu.name,
                restaurantId: menu.restaurant_id,
                categoryId: menu.category_id,
                price: menu.price,
                description: menu.description,
                image: menu.image,
                isAvailable: menu.is_available,
                preparationTime: menu.preparation_time_minutes,
                rating: menu.rating || 0,
                sold: menu.sold || 0,
                createdAt: menu.created_at,
                updatedAt: menu.updated_at,
            }));
        } catch (error) {
            throw error;
        }
    },

    async getByCategory(categoryId) {
        try {
            const response = await apiClient.get(ENDPOINTS.MENUS.BY_CATEGORY(categoryId));
            return response.map((menu) => ({
                id: menu.id,
                _id: menu.id,
                name: menu.name,
                restaurantId: menu.restaurant_id,
                categoryId: menu.category_id,
                price: menu.price,
                description: menu.description,
                image: menu.image,
                isAvailable: menu.is_available,
                preparationTime: menu.preparation_time_minutes,
                rating: menu.rating || 0,
                sold: menu.sold || 0,
                createdAt: menu.created_at,
                updatedAt: menu.updated_at,
            }));
        } catch (error) {
            throw error;
        }
    },

    async search(query) {
        try {
            const response = await apiClient.get(ENDPOINTS.MENUS.SEARCH(query));
            return response.map((menu) => ({
                id: menu.id,
                _id: menu.id,
                name: menu.name,
                restaurantId: menu.restaurant_id,
                categoryId: menu.category_id,
                price: menu.price,
                description: menu.description,
                image: menu.image,
                isAvailable: menu.is_available,
                preparationTime: menu.preparation_time_minutes,
                rating: menu.rating || 0,
                sold: menu.sold || 0,
                createdAt: menu.created_at,
                updatedAt: menu.updated_at,
            }));
        } catch (error) {
            throw error;
        }
    },
};

export default foodService;
