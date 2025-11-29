import React, { useState, useEffect } from "react";
import { ReviewCard } from "shared-ui";
import { reviewService, foodService } from "shared-services";
import { FaStar } from "react-icons/fa";
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
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avgRating, setAvgRating] = useState(0);
    const [foodNames, setFoodNames] = useState({});
    const [filterRating, setFilterRating] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");

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

            // Tính average rating
            if (data.length > 0) {
                const avg = data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length;
                setAvgRating(Number(avg.toFixed(1)));
            }

            // Fetch food names for all reviews
            const foodIds = [...new Set(data.map(r => r.food_id || r.foodId || r.product_id).filter(Boolean))];
            const namesMap = {};

            await Promise.all(
                foodIds.map(async (foodId) => {
                    try {
                        const food = await foodService.getById(foodId);
                        if (food) {
                            namesMap[foodId] = food.name;
                        }
                    } catch (err) {
                        console.error(`Error fetching food ${foodId}:`, err);
                        namesMap[foodId] = "Sản phẩm";
                    }
                })
            );

            setFoodNames(namesMap);
            setAllReviews(data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Không thể tải đánh giá");
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort reviews based on user selection
    useEffect(() => {
        if (allReviews.length === 0) return;

        let filtered = [...allReviews];

        // Filter by rating
        if (filterRating !== "all") {
            const targetRating = parseInt(filterRating);
            filtered = filtered.filter(r => r.rating === targetRating);
        }

        // Sort by date
        if (sortOrder === "newest") {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        // Limit if maxReviews > 0
        if (maxReviews > 0) {
            filtered = filtered.slice(0, maxReviews);
        }

        setReviews(filtered);
    }, [allReviews, filterRating, sortOrder, maxReviews]);

    if (loading) {
        return <div className="review-list-loading">Đang tải đánh giá...</div>;
    }

    if (error) {
        return <div className="review-list-error">{error}</div>;
    }

    if (allReviews.length === 0) {
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
                        <FaStar /> {avgRating}/5
                    </span>
                    <span className="total-reviews">({allReviews.length} đánh giá)</span>
                </div>
            </div>

            {/* Filters */}
            <div className="review-filters">
                <div className="filter-group">
                    <label htmlFor="rating-filter">Lọc theo:</label>
                    <select
                        id="rating-filter"
                        className="filter-select"
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                    >
                        <option value="all">Tất cả</option>
                        <option value="5">5 sao - Xuất sắc</option>
                        <option value="4">4 sao - Tốt</option>
                        <option value="3">3 sao - Trung bình</option>
                        <option value="2">2 sao - Tệ</option>
                        <option value="1">1 sao - Rất tệ</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="sort-filter">Sắp xếp:</label>
                    <select
                        id="sort-filter"
                        className="filter-select"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                    </select>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="review-list-empty">
                    <p>Không tìm thấy đánh giá phù hợp với bộ lọc.</p>
                </div>
            ) : (
                <div className="review-list">
                    {reviews.map((review) => {
                        const foodId = review.food_id || review.foodId || review.product_id;
                        const foodName = foodNames[foodId] || "Sản phẩm";

                        return (
                            <ReviewCard
                                key={review.id}
                                review={{
                                    ...review,
                                    food_id: foodId,
                                    user_id: review.user_id || review.userId
                                }}
                                foodName={foodName}
                                showReplyButton={false}
                            />
                        );
                    })}
                </div>
            )}

            {maxReviews > 0 && reviews.length >= maxReviews && (
                <div className="review-list-footer">
                    <p>Đang hiển thị {reviews.length} đánh giá mới nhất</p>
                </div>
            )}
        </div>
    );
};

export default RestaurantReviews;
