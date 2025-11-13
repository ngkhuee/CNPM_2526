/**
 * Review Service for Mobile
 * Uses shared endpoints and mobile API client
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';

export const reviewService = {
    async create(reviewData) {
        try {
            return await apiClient.post(ENDPOINTS.REVIEWS.BASE, reviewData);
        } catch (error) {
            throw error;
        }
    },

    async getByFood(foodId) {
        try {
            return await apiClient.get(ENDPOINTS.REVIEWS.BY_FOOD(foodId));
        } catch (error) {
            throw error;
        }
    },

    async getByUser(userId) {
        try {
            return await apiClient.get(ENDPOINTS.REVIEWS.BY_USER(userId));
        } catch (error) {
            throw error;
        }
    },

    async getByRestaurant(restaurantId) {
        try {
            return await apiClient.get(ENDPOINTS.REVIEWS.BY_RESTAURANT(restaurantId));
        } catch (error) {
            throw error;
        }
    },

    async update(id, reviewData) {
        try {
            return await apiClient.patch(`${ENDPOINTS.REVIEWS.BASE}/${id}`, reviewData);
        } catch (error) {
            throw error;
        }
    },

    async delete(id) {
        try {
            return await apiClient.delete(`${ENDPOINTS.REVIEWS.BASE}/${id}`);
        } catch (error) {
            throw error;
        }
    },
};

export default reviewService;
