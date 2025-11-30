/**
 * useReview.js - Mobile specific hook
 * Handles food reviews for individual items in orders
 * Uses local reviewService instead of shared-services
 */

import { useCallback } from 'react';
import { reviewService } from '../services/reviewService';

export const useReview = () => {
    /**
     * Submit review for a food item
     */
    const submitReview = useCallback(
        async (reviewData) => {
            const { foodId, userId, restaurantId, orderId, rating, comment, userName } =
                reviewData;

            // Strict validation
            if (!foodId || !userId || !orderId) {
                return {
                    success: false,
                    message: 'Missing required fields: foodId, userId, orderId',
                };
            }

            if (rating < 1 || rating > 5) {
                return {
                    success: false,
                    message: 'Rating must be between 1 and 5',
                };
            }

            if (!comment || comment.trim().length === 0) {
                return {
                    success: false,
                    message: 'Comment cannot be empty',
                };
            }

            try {
                const review = await reviewService.create({
                    food_id: foodId,
                    user_id: userId,
                    user_name: userName || 'Người dùng',
                    restaurant_id: restaurantId,
                    order_id: orderId,
                    rating,
                    comment: comment.trim(),
                });

                console.log('[useReview] Review submitted successfully:', review);
                return {
                    success: true,
                    review: review,
                    message: 'Thank you for your review!',
                };
            } catch (error) {
                console.error('[useReview] Error submitting review:', error);
                return {
                    success: false,
                    message: error.message || 'Error submitting review',
                };
            }
        },
        []
    );

    /**
     * Get reviews by user
     */
    const getUserReviews = useCallback(async (userId) => {
        try {
            const reviews = await reviewService.getByUser(userId);
            return {
                success: true,
                reviews: reviews,
            };
        } catch (error) {
            console.error('[useReview] Error fetching user reviews:', error);
            return {
                success: false,
                reviews: [],
                message: error.message,
            };
        }
    }, []);

    /**
     * Check which foods have been reviewed by user in a specific order
     * Returns object where key is "foodId_orderId" to allow same food in different orders
     */
    const getReviewedFoodIds = useCallback(async (userId) => {
        try {
            const allReviews = await reviewService.getByUser(userId);
            const reviewed = {};

            allReviews.forEach((review) => {
                if (review.food_id && review.order_id) {
                    // Use "foodId_orderId" as key to prevent re-review within same order
                    // but allow review of same food in different orders
                    const key = `${review.food_id}_${review.order_id}`;
                    reviewed[key] = true;
                }
            });

            return reviewed;
        } catch (error) {
            console.error('[useReview] Error checking reviewed foods:', error);
            return {};
        }
    }, []);

    return {
        submitReview,
        getUserReviews,
        getReviewedFoodIds,
    };
};
