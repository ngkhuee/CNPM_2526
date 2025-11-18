/**
 * categoryService.js - Mobile specific category service
 * Fetch categories from API (db.json)
 */

import apiClient from './apiClient';

export const categoryService = {
    /**
     * Get all categories
     */
    async getAll(params = {}) {
        try {
            const response = await apiClient.get('/categories', { params });
            return (Array.isArray(response) ? response : []).map((category) => ({
                id: category.id,
                restaurantId: category.restaurant_id,
                name: category.name,
                description: category.description,
                displayOrder: category.display_order || 0,
                status: category.status,
                createdAt: category.created_at,
                updatedAt: category.updated_at,
            }));
        } catch (error) {
            console.error('[categoryService.getAll] Error:', error);
            throw error;
        }
    },

    /**
     * Get categories by restaurant ID
     */
    async getByRestaurant(restaurantId) {
        try {
            const response = await apiClient.get('/categories', {
                params: { restaurant_id: restaurantId },
            });
            return (Array.isArray(response) ? response : [])
                .map((category) => ({
                    id: category.id,
                    restaurantId: category.restaurant_id,
                    name: category.name,
                    description: category.description,
                    displayOrder: category.display_order || 0,
                    status: category.status,
                    createdAt: category.created_at,
                    updatedAt: category.updated_at,
                }))
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        } catch (error) {
            console.error('[categoryService.getByRestaurant] Error:', error);
            throw error;
        }
    },
};
