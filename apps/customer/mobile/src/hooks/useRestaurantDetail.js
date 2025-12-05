// hooks/useRestaurantDetail.js - Quản lý data fetching
import { useState, useEffect } from 'react';
import { restaurantDetailService } from '../services/restaurantDetailService';
import { categoryService } from '../services/categoryService';
import { reviewService } from '../services/reviewService';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} location1 - {lat, lng}
 * @param {Object} location2 - {latitude, longitude}
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (location1, location2) => {
    if (!location1 || !location2) return 0;

    const userLat = location1.lat || location1.latitude;
    const userLon = location1.lng || location1.longitude;
    const restLat = location2.latitude;
    const restLon = location2.longitude;

    if (!userLat || !userLon || !restLat || !restLon) return 0;

    const R = 6371; // Earth's radius in km
    const dLat = (restLat - userLat) * (Math.PI / 180);
    const dLon = (restLon - userLon) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLat * (Math.PI / 180)) *
        Math.cos(restLat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

export const useRestaurantDetail = (restaurantId, userLocation = null) => {
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

            // Calculate distance if user location is available
            let restaurantWithDistance = restaurantData;
            if (userLocation && restaurantData.latitude && restaurantData.longitude) {
                const distance = calculateDistance(userLocation, restaurantData);
                restaurantWithDistance = { ...restaurantData, distance };
                console.log('[useRestaurantDetail] Calculated distance:', distance.toFixed(2), 'km');
            } else {
                restaurantWithDistance = { ...restaurantData, distance: 0 };
                console.log('[useRestaurantDetail] No user location or restaurant coordinates - distance set to 0');
            }

            setRestaurant(restaurantWithDistance);
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
                restaurant: restaurantWithDistance?.name,
                distance: restaurantWithDistance?.distance?.toFixed(2) + ' km',
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

    // Fetch data when restaurantId changes
    useEffect(() => {
        fetchRestaurantData();
    }, [restaurantId]);

    // Update distance when userLocation changes
    useEffect(() => {
        if (restaurant && userLocation && restaurant.latitude && restaurant.longitude) {
            const distance = calculateDistance(userLocation, restaurant);
            setRestaurant(prev => ({ ...prev, distance }));
            console.log('[useRestaurantDetail] Updated distance:', distance.toFixed(2), 'km');
        }
    }, [userLocation?.lat, userLocation?.lng]);

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
