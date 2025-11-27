import { useCallback, useState, useContext } from "react";
import { reviewService } from "shared-services";
import { RestaurantContext } from "../Context/RestaurantContext";

/**
 * Hook quản lý reviews cho restaurant
 * Lấy reviews, thêm reply, filter
 */
export const useRestaurantReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [allReviews, setAllReviews] = useState([]); // Store all unfiltered reviews
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentRestaurant } = useContext(RestaurantContext);

    /**
     * Lấy tất cả reviews của restaurant, có thể filter
     */
    const fetchReviews = useCallback(
        async (filter = "all") => {
            if (!currentRestaurant?.id) {
                setError("Không tìm thấy nhà hàng");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Lấy tất cả reviews của restaurant
                const allReviews = await reviewService.getByRestaurant(
                    currentRestaurant.id
                );

                // Store all reviews for stats calculation
                setAllReviews(allReviews);

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
                console.error("Lỗi khi tải đánh giá:", err);
                setError(err.message || "Không thể tải đánh giá");
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
                    message: "Nội dung phản hồi không được để trống",
                };
            }

            if (replyText.trim().length > 500) {
                return {
                    success: false,
                    message: "Nội dung phản hồi không được vượt quá 500 ký tự",
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
     * Tính stats cho restaurant (từ tất cả reviews, không filter)
     */
    const getStats = useCallback(() => {
        const total = allReviews.length;
        const pending = allReviews.filter((r) => !r.restaurant_reply).length;
        const replied = allReviews.filter((r) => r.restaurant_reply).length;

        // Tính avg rating
        let avgRating = 0;
        if (allReviews.length > 0) {
            const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            avgRating = (totalRating / allReviews.length).toFixed(1);
        }

        return {
            total,
            pending,
            replied,
            avgRating,
        };
    }, [allReviews]);

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
