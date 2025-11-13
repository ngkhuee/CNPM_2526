import { useState, useEffect } from "react";

/**
 * Hook để lấy rating của restaurant từ reviews
 * Tính trung bình rating từ tất cả reviews của restaurant
 */
export const useRestaurantRating = (restaurantId) => {
    const [rating, setRating] = useState(null);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    useEffect(() => {
        if (!restaurantId) {
            setLoading(false);
            return;
        }

        fetchRestaurantRating();
    }, [restaurantId]);

    const fetchRestaurantRating = async () => {
        setLoading(true);
        try {
            // Fetch all reviews for this restaurant
            const reviewsRes = await fetch(
                `${API_BASE_URL}/reviews?restaurant_id=${restaurantId}`
            );

            let reviews = await reviewsRes.ok ? await reviewsRes.json() : [];

            // Handle both array and object responses from json-server
            if (!Array.isArray(reviews)) {
                reviews = reviews.value || [];
            }

            setTotalReviews(reviews.length);

            if (reviews.length === 0) {
                // No reviews - use restaurant's default rating
                const restaurantRes = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);
                const restaurant = await restaurantRes.ok ? await restaurantRes.json() : null;
                setRating(restaurant?.rating || 0);
            } else {
                // Calculate average rating from reviews
                const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
                const averageRating = totalRating / reviews.length;
                setRating(Math.round(averageRating * 10) / 10); // Round to 1 decimal
            }

            setError(null);
        } catch (err) {
            console.error("Error fetching restaurant rating:", err);
            setError(err.message);
            setRating(null);
        } finally {
            setLoading(false);
        }
    };

    return { rating, totalReviews, loading, error, refetch: fetchRestaurantRating };
};

export default useRestaurantRating;
