// hooks/useRestaurantDetail.js - Quản lý data fetching
import { useState, useEffect } from 'react';
import { restaurantDetailService } from '../services/restaurantDetailService';
import { categoryService } from '../services/categoryService';
import { reviewService } from '../services/reviewService';

export const useRestaurantDetail = (restaurantId) => {
    const [restaurant, setRestaurant] = useState(null);
    const [allFoods, setAllFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRestaurantData = async () => {
        if (!restaurantId) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch restaurant & foods
            const { restaurant: restaurantData, foods: foodsData } =
                await restaurantDetailService.getRestaurantWithFoods(restaurantId);

            setRestaurant(restaurantData);
            setAllFoods(foodsData);

            // Fetch categories
            const categoriesData = await categoryService.getByRestaurant(restaurantId);
            setCategories(categoriesData);

            // Fetch reviews
            const reviewsData = await reviewService.getByRestaurant(restaurantId);
            if (reviewsData && reviewsData.length > 0) {
                const sorted = reviewsData.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                const avg = sorted.reduce((sum, r) => sum + (r.rating || 0), 0) / sorted.length;
                setAvgRating(Number(avg.toFixed(1)));
                setReviews(sorted);
            }

            console.log('[useRestaurantDetail] Data loaded:', {
                restaurant: restaurantData?.name,
                foods: foodsData?.length,
                categories: categoriesData?.length,
                reviews: reviewsData?.length,
            });
        } catch (err) {
            console.error('[useRestaurantDetail] Fetch error:', err);
            setError(err.message || 'Failed to load restaurant');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurantData();
    }, [restaurantId]);

    return {
        restaurant,
        allFoods,
        categories,
        reviews,
        avgRating,
        loading,
        error,
        refetch: fetchRestaurantData,
    };
};
