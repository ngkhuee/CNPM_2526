import { useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../config/api.config';
import { transformFoods, transformRestaurants } from '../utils/dataTransformers';

const API_BASE = apiConfig.api.baseURL;

/**
 * useFoodsAndRestaurants - Shared hook for fetching foods and restaurants
 * Eliminates duplicate API calls across HomeScreen, ExploreScreen, SearchResultsScreen
 * 
 * @returns {Object} { foodList, restaurantList, loading, error, refetch }
 */
export const useFoodsAndRestaurants = () => {
    const [foodList, setFoodList] = useState([]);
    const [restaurantList, setRestaurantList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [foodRes, restaurantRes] = await Promise.all([
                axios.get(`${API_BASE}/menus`),
                axios.get(`${API_BASE}/restaurants`),
            ]);

            setFoodList(transformFoods(foodRes.data || []));
            setRestaurantList(transformRestaurants(restaurantRes.data || []));
        } catch (err) {
            console.error('[useFoodsAndRestaurants] Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () => {
        fetchData();
    };

    return {
        foodList,
        restaurantList,
        loading,
        error,
        refetch,
    };
};
