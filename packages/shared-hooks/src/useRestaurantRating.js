import { useState, useEffect } from "react";

// Calculate API_BASE_URL at file level to avoid recalculation
const getAPIBaseURL = () => {
    // Check for Node/React Native environment first (priority for mobile)
    if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }
    // Check for Vite environment (web)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // Default
    return "http://localhost:4000";
};

const API_BASE_URL = getAPIBaseURL();

/**
 * Hook để lấy rating của restaurant từ reviews
 * Tính trung bình rating từ tất cả reviews của restaurant
 */
export const useRestaurantRating = (restaurantId) => {
    const [rating, setRating] = useState(null);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
