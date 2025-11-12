import React, { useState, useEffect } from "react";
import { ReviewCard } from "shared-ui";
import { reviewService } from "shared-services";
import "./ReviewSection.css";

/**
 * ReviewList Component - Hiển thị danh sách reviews cho 1 sản phẩm
 * 
 * Props:
 * - foodId: ID của sản phẩm (required)
 * - foodName: Tên sản phẩm (for display)
 * - maxReviews: Số reviews hiển thị (default: 5, 0 = all)
 */
const ReviewList = ({ foodId, foodName = "Product", maxReviews = 5 }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!foodId) {
            setError("Food ID is required");
            setLoading(false);
            return;
        }

        fetchReviews();
    }, [foodId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch reviews cho food_id này
            const data = await reviewService.getByFood(foodId);

            // Sort by created_at descending (newest first)
            let sorted = data.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );

            // Limit if maxReviews > 0
            if (maxReviews > 0) {
                sorted = sorted.slice(0, maxReviews);
            }

            setReviews(sorted);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="review-list-loading">Loading reviews...</div>;
    }

    if (error) {
        return <div className="review-list-error">{error}</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="review-list-empty">
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="review-list-container">
            <div className="review-list-header">
                <h3>Customer Reviews ({reviews.length})</h3>
                <div className="review-stats">
                    {reviews.length > 0 && (
                        <>
                            <span className="avg-rating">
                                ⭐ {(
                                    reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                                    reviews.length
                                ).toFixed(1)}/5
                            </span>
                            <span className="total-reviews">({reviews.length} reviews)</span>
                        </>
                    )}
                </div>
            </div>

            <div className="review-list">
                {reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        review={review}
                        foodName={foodName}
                        showReplyButton={false}
                    />
                ))}
            </div>

            {maxReviews > 0 && reviews.length >= maxReviews && (
                <div className="review-list-footer">
                    <p>Showing {reviews.length} most recent reviews</p>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
