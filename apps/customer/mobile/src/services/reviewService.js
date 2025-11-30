/**
 * reviewService.js - Mobile specific review service
 * Lấy và tạo reviews cho foods, restaurants, và orders
 */

import apiClient from './apiClient';

export const reviewService = {
    /**
     * Lấy tất cả reviews
     * Tự động fetch thông tin user nếu chưa có user_name
     */
    async getAll(params = {}) {
        try {
            const response = await apiClient.get('/reviews', { params });
            const reviews = Array.isArray(response) ? response : [];

            // Fetch user info for reviews that don't have user_name
            const reviewsWithUser = await Promise.all(
                reviews.map(async (review) => {
                    // If user_name already exists, use it
                    if (review.user_name) {
                        return review;
                    }

                    // Otherwise try to fetch user info
                    let userName = null;
                    if (review.user_id) {
                        try {
                            const user = await apiClient.get(`/users/${review.user_id}`);
                            console.log('[reviewService] Fetched user:', review.user_id, user);
                            userName = user?.name || user?.full_name;
                            console.log('[reviewService] Extracted userName:', userName);
                        } catch (err) {
                            console.error('[reviewService] Failed to fetch user:', err.message);
                        }
                    }

                    return { ...review, user_name: userName || review.user_name };
                })
            );

            return reviewsWithUser;
        } catch (error) {
            console.error('[reviewService.getAll] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy reviews theo food ID
     * Tự động fetch thông tin user nếu chưa có user_name
     */
    async getByFood(foodId) {
        try {
            const response = await apiClient.get('/reviews', {
                params: { food_id: foodId },
            });

            const reviews = Array.isArray(response) ? response : [];

            // Fetch user info for reviews that don't have user_name
            const reviewsWithUser = await Promise.all(
                reviews.map(async (review) => {
                    if (review.user_name) {
                        return review;
                    }

                    let userName = null;
                    if (review.user_id) {
                        try {
                            const user = await apiClient.get(`/users/${review.user_id}`);
                            userName = user?.name || user?.full_name;
                        } catch (err) {
                            // Silently fail
                        }
                    }

                    return { ...review, user_name: userName || review.user_name };
                })
            );

            return reviewsWithUser;
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
     * Fetch user info và food names
     */
    async getByRestaurant(restaurantId) {
        try {
            const response = await apiClient.get('/reviews', {
                params: { restaurant_id: restaurantId },
            });

            const reviews = Array.isArray(response) ? response : [];

            // Fetch user info and food info for each review
            const reviewsWithDetails = await Promise.all(
                reviews.map(async (review) => {
                    try {
                        // Fetch user info if not present
                        let userName = review.user_name;
                        if (!userName && review.user_id) {
                            try {
                                const user = await apiClient.get(`/users/${review.user_id}`);
                                console.log('[reviewService.getByRestaurant] Fetched user:', review.user_id, user);
                                userName = user?.name || user?.full_name;
                                console.log('[reviewService.getByRestaurant] Extracted userName:', userName);
                            } catch (err) {
                                console.error('[reviewService.getByRestaurant] Failed to fetch user:', err.message);
                            }
                        }

                        // Fetch food info
                        let food = null;
                        if (review.food_id) {
                            try {
                                food = await apiClient.get(`/menus/${review.food_id}`);
                            } catch (err) {
                                // Silently fail
                            }
                        }

                        return {
                            ...review,
                            user_name: userName || review.user_name,
                            food_name: food?.name || review.food_name || null,
                        };
                    } catch (err) {
                        return review;
                    }
                })
            );

            return reviewsWithDetails;
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
