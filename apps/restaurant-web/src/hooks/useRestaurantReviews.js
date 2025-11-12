import { useCallback, useState, useContext } from "react";
import { reviewService } from "shared-services";
import { RestaurantContext } from "../Context/RestaurantContext";

/**
 * Hook quản lý reviews cho restaurant
 * Lấy reviews, thêm reply, filter
 */
export const useRestaurantReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentRestaurant } = useContext(RestaurantContext);

    /**
     * Lấy tất cả reviews của restaurant, có thể filter
     */
    const fetchReviews = useCallback(
        async (filter = "all") => {
            if (!currentRestaurant?.id) {
                setError("No restaurant found");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Lấy tất cả reviews của restaurant
                const allReviews = await reviewService.getByRestaurant(
                    currentRestaurant.id
                );

                // Filter theo trạng thái reply
                let filtered = allReviews;

                if (filter === "pending") {
                    // Chưa có reply
                    filtered = allReviews.filter((r) => !r.restaurant_reply);
                } else if (filter === "replied") {
                    // Đã có reply
                    filtered = allReviews.filter((r) => r.restaurant_reply);
                }

                // Sắp xếp: Newest first
                filtered.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );

                setReviews(filtered);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError(err.message || "Failed to fetch reviews");
                setReviews([]);
            } finally {
                setLoading(false);
            }
        },
        [currentRestaurant?.id]
    );

    /**
     * Thêm reply cho review
     */
    const addReply = useCallback(async (reviewId, replyText) => {
        try {
            if (!replyText || replyText.trim().length === 0) {
                return {
                    success: false,
                    message: "Reply text cannot be empty",
                };
            }

            if (replyText.trim().length > 500) {
                return {
                    success: false,
                    message: "Reply text cannot exceed 500 characters",
                };
            }

            // Gọi API để thêm reply
            const updated = await reviewService.replyToReview(
                reviewId,
                replyText.trim()
            );

            // Cập nhật state
            setReviews((prev) =>
                prev.map((r) => (r.id === reviewId ? updated : r))
            );

            return {
                success: true,
                message: "Reply added successfully!",
                review: updated,
            };
        } catch (err) {
            console.error("Error adding reply:", err);
            return {
                success: false,
                message: err.message || "Failed to add reply",
            };
        }
    }, []);

    /**
     * Lấy reviews của một sản phẩm cụ thể
     */
    const getReviewsByFood = useCallback((foodId) => {
        return reviews.filter((r) => r.food_id === foodId);
    }, [reviews]);

    /**
     * Tính stats cho restaurant
     */
    const getStats = useCallback(() => {
        const total = reviews.length;
        const pending = reviews.filter((r) => !r.restaurant_reply).length;
        const replied = reviews.filter((r) => r.restaurant_reply).length;

        // Tính avg rating
        let avgRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            avgRating = (totalRating / reviews.length).toFixed(1);
        }

        return {
            total,
            pending,
            replied,
            avgRating,
        };
    }, [reviews]);

    return {
        reviews,
        loading,
        error,
        fetchReviews,
        addReply,
        getReviewsByFood,
        getStats,
    };
};
