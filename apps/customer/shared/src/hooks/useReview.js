import { useCallback } from "react";
import { reviewService } from "shared-services";

/**
 * Custom hook for managing food reviews
 * Handles review submission and rating management
 * Shared between web and mobile customer apps
 */
export const useReview = () => {
    /**
     * Submit review for a food item
     */
    const submitReview = useCallback(
        async (reviewData) => {
            const { foodId, userId, restaurantId, orderId, rating, comment } =
                reviewData;

            // Strict validation
            if (!foodId || !userId || !orderId) {
                return {
                    success: false,
                    message: "Missing required fields: foodId, userId, orderId",
                };
            }

            if (rating < 1 || rating > 5) {
                return {
                    success: false,
                    message: "Rating must be between 1 and 5",
                };
            }

            if (!comment || comment.trim().length === 0) {
                return {
                    success: false,
                    message: "Comment cannot be empty",
                };
            }

            try {
                const review = await reviewService.create({
                    food_id: foodId,
                    user_id: userId,
                    restaurant_id: restaurantId,
                    order_id: orderId,
                    rating,
                    comment: comment.trim(),
                });

                console.log("✅ Review submitted successfully:", review);
                return {
                    success: true,
                    review: review,
                    message: "Thank you for your review!",
                };
            } catch (error) {
                console.error("Error submitting review:", error);
                return {
                    success: false,
                    message: error.message || "Error submitting review",
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
            console.error("Error fetching user reviews:", error);
            return {
                success: false,
                reviews: [],
                message: error.message,
            };
        }
    }, []);

    /**
     * Check which foods have been reviewed by user
     */
    const getReviewedFoodIds = useCallback(async (userId) => {
        try {
            const allReviews = await reviewService.getByUser(userId);
            const reviewed = {};

            allReviews.forEach((review) => {
                if (review.food_id) {
                    reviewed[review.food_id] = true;
                }
            });

            return reviewed;
        } catch (error) {
            console.error("Error checking reviewed foods:", error);
            return {};
        }
    }, []);

    return {
        submitReview,
        getUserReviews,
        getReviewedFoodIds,
    };
};
