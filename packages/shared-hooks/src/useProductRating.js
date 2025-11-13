import { useState, useEffect } from "react";

/**
 * Hook để lấy rating của product từ reviews
 * Tính trung bình rating từ tất cả reviews của product
 */
export const useProductRating = (productId) => {
    const [rating, setRating] = useState(null);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    useEffect(() => {
        if (!productId) {
            setLoading(false);
            return;
        }

        fetchProductRating();
    }, [productId]);

    const fetchProductRating = async () => {
        setLoading(true);
        try {
            // Fetch all reviews for this product
            const reviewsRes = await fetch(
                `${API_BASE_URL}/reviews?food_id=${productId}`
            );

            let reviewsData = await reviewsRes.ok ? await reviewsRes.json() : [];

            // Handle both array and object responses from json-server
            if (!Array.isArray(reviewsData)) {
                reviewsData = reviewsData.value || [];
            }

            setReviews(reviewsData);
            setTotalReviews(reviewsData.length);

            if (reviewsData.length === 0) {
                setRating(null);
            } else {
                // Calculate average rating from reviews
                const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
                const averageRating = totalRating / reviewsData.length;
                setRating(Math.round(averageRating * 10) / 10); // Round to 1 decimal
            }

            setError(null);
        } catch (err) {
            console.error("Error fetching product rating:", err);
            setError(err.message);
            setRating(null);
        } finally {
            setLoading(false);
        }
    };

    return { rating, totalReviews, reviews, loading, error, refetch: fetchProductRating };
};

export default useProductRating;
