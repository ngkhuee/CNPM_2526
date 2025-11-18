/**
 * reviewService.js - Mobile specific review service
 * Lấy và tạo reviews cho foods, restaurants, và orders
 */

import apiClient from './apiClient';

export const reviewService = {
    /**
     * Lấy tất cả reviews
     */
    async getAll(params = {}) {
        try {
            const response = await apiClient.get('/reviews', { params });
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('[reviewService.getAll] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy reviews theo food ID
     */
    async getByFood(foodId) {
        try {
            const response = await apiClient.get('/reviews', {
                params: { food_id: foodId },
            });
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('[reviewService.getByFood] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy reviews theo user ID
     */
    async getByUser(userId) {
        try {
            const response = await apiClient.get('/reviews', {
                params: { user_id: userId },
            });
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('[reviewService.getByUser] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy reviews theo restaurant ID (tất cả reviews từ tất cả foods)
     */
    async getByRestaurant(restaurantId) {
        try {
            const response = await apiClient.get('/reviews', {
                params: { restaurant_id: restaurantId },
            });
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('[reviewService.getByRestaurant] Error:', error);
            throw error;
        }
    },

    /**
     * Tạo review mới
     */
    async create(reviewData) {
        try {
            // Validate required fields
            if (!reviewData.food_id || !reviewData.user_id || !reviewData.order_id) {
                throw new Error('Missing required fields: food_id, user_id, order_id');
            }

            const newReview = {
                ...reviewData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                images: reviewData.images || [],
                restaurant_reply: null, // Start with null
            };

            const response = await apiClient.post('/reviews', newReview);
            return response;
        } catch (error) {
            console.error('[reviewService.create] Error:', error);
            throw error;
        }
    },

    /**
     * Update review
     */
    async update(id, reviewData) {
        try {
            const updateData = {
                ...reviewData,
                updated_at: new Date().toISOString(),
            };

            const response = await apiClient.patch(`/reviews/${id}`, updateData);
            return response;
        } catch (error) {
            console.error('[reviewService.update] Error:', error);
            throw error;
        }
    },

    /**
     * Add restaurant reply to a review
     */
    async replyToReview(reviewId, replyText) {
        try {
            if (!replyText || replyText.trim().length === 0) {
                throw new Error('Reply text cannot be empty');
            }

            const response = await apiClient.patch(`/reviews/${reviewId}`, {
                restaurant_reply: replyText,
                updated_at: new Date().toISOString(),
            });
            return response;
        } catch (error) {
            console.error('[reviewService.replyToReview] Error:', error);
            throw error;
        }
    },

    /**
     * Delete review
     */
    async delete(id) {
        try {
            const response = await apiClient.delete(`/reviews/${id}`);
            return response;
        } catch (error) {
            console.error('[reviewService.delete] Error:', error);
            throw error;
        }
    },
};
