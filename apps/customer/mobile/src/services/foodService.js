/**
 * foodService.js - Mobile specific food service
 * Lấy dữ liệu thực ăn từ API (db.json)
 */

import apiClient from './apiClient';

export const foodService = {
    /**
     * Lấy tất cả foods/menus
     */
    async getAll(params = {}) {
        try {
            const response = await apiClient.get('/menus', { params });
            // Map backend (snake_case) to frontend (camelCase)
            return (Array.isArray(response) ? response : []).map((menu) => ({
                id: menu.id,
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
            console.error('[foodService.getAll] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy food theo ID
     */
    async getById(id) {
        try {
            const response = await apiClient.get(`/menus/${id}`);
            if (!response) return null;

            return {
                id: response.id,
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
            console.error('[foodService.getById] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy foods theo restaurant ID
     */
    async getByRestaurant(restaurantId) {
        try {
            const response = await apiClient.get(`/restaurants/${restaurantId}/menu`);
            return (Array.isArray(response) ? response : []).map((menu) => ({
                id: menu.id,
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
            console.error('[foodService.getByRestaurant] Error:', error);
            throw error;
        }
    },
};
