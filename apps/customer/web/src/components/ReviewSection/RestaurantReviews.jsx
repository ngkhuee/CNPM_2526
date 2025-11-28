import React, { useState, useEffect } from "react";
import { ReviewCard } from "shared-ui";
import { reviewService } from "shared-services";
import "./ReviewSection.css";

/**
 * RestaurantReviews Component - Hiển thị danh sách reviews cho 1 nhà hàng
 * 
 * Props:
 * - restaurantId: ID của nhà hàng (required)
 * - maxReviews: Số reviews hiển thị (default: 5, 0 = all)
 */
const RestaurantReviews = ({ restaurantId, maxReviews = 5 }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        if (!restaurantId) {
            setError("ID nhà hàng là bắt buộc");
            setLoading(false);
            return;
        }

        fetchReviews();
    }, [restaurantId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch reviews cho restaurant_id này
            const data = await reviewService.getByRestaurant(restaurantId);

            // Sort by created_at descending (newest first)
            let sorted = data.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );

            // Tính average rating
            if (sorted.length > 0) {
                const avg = sorted.reduce((sum, r) => sum + (r.rating || 0), 0) / sorted.length;
                setAvgRating(Number(avg.toFixed(1)));
            }

            // Limit if maxReviews > 0
            if (maxReviews > 0) {
                sorted = sorted.slice(0, maxReviews);
            }

            setReviews(sorted);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Không thể tải đánh giá");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="review-list-loading">Đang tải đánh giá...</div>;
    }

    if (error) {
        return <div className="review-list-error">{error}</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="review-list-empty">
                <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá nhà hàng này!</p>
            </div>
        );
    }

    return (
        <div className="review-list-container">
            <div className="review-list-header">
                <h3>Đánh giá của khách hàng</h3>
                <div className="review-stats">
                    <span className="avg-rating">
                        ⭐ {avgRating}/5
                    </span>
                    <span className="total-reviews">({reviews.length} đánh giá)</span>
                </div>
            </div>

            <div className="review-list">
                {reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        review={{
                            ...review,
                            food_id: review.food_id || review.foodId || review.product_id,
                            user_id: review.user_id || review.userId
                        }}
                        foodName={review.food_name || review.foodName || "Sản phẩm"}
                        showReplyButton={false}
                    />
                ))}
            </div>

            {maxReviews > 0 && reviews.length >= maxReviews && (
                <div className="review-list-footer">
                    <p>Đang hiển thị {reviews.length} đánh giá mới nhất</p>
                </div>
            )}
        </div>
    );
};

export default RestaurantReviews;
