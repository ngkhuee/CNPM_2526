/**
 * Store Context for Mobile (React Native)
 * Wrapper around shared StoreContext, compatible with React Native
 */
console.log('[StoreContext.js] Module file loading...');

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { foodService, restaurantService, categoryService } from '../services';

console.log('[StoreContext.js] Imports successful - services available');

export const StoreContext = createContext({
    food_list: [],
    restaurant_list: [],
    categories: [],
    loading: true,
    error: null,
    fetchFoods: async () => { },
    fetchRestaurants: async () => { },
});

export const StoreContextProvider = ({ children }) => {
    const [food_list, setFoodList] = useState([]);
    const [restaurant_list, setRestaurantList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true); // Start as true - we're loading data!
    const [error, setError] = useState(null);

    console.log('[StoreContextProvider] Component mounted - initializing state...');

    // Define fetchFoods BEFORE useEffect
    console.log('[StoreContextProvider] Defining fetchFoods callback...');
    const fetchFoods = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('[StoreContextProvider] Starting fetch...');

            // Fetch all data in parallel with individual try-catch for debugging
            console.log('[StoreContextProvider] Calling foodService.getAll()...');
            const foodsPromise = foodService.getAll().catch(err => {
                console.error('[StoreContextProvider] foodService.getAll() failed:', err.message);
                return [];
            });

            console.log('[StoreContextProvider] Calling restaurantService.getAll()...');
            const restaurantsPromise = restaurantService.getAll().catch(err => {
                console.error('[StoreContextProvider] restaurantService.getAll() failed:', err.message);
                return [];
            });

            console.log('[StoreContextProvider] Calling categoryService.getAll()...');
            const categoriesPromise = categoryService.getAll().catch(err => {
                console.error('[StoreContextProvider] categoryService.getAll() failed:', err.message);
                return [];
            });

            const results = await Promise.all([
                foodsPromise,
                restaurantsPromise,
                categoriesPromise,
            ]);

            const foods = results[0] || [];
            const allRestaurants = results[1] || [];
            const allCategories = results[2] || [];

            console.log('[StoreContextProvider] Fetched:', {
                foods: foods?.length || 0,
                restaurants: allRestaurants?.length || 0,
                categories: allCategories?.length || 0,
            });

            // Filter only ACTIVE restaurants
            const activeRestaurants = allRestaurants.filter(
                (r) => r.status === 'active'
            );

            console.log(
                `[StoreContextProvider] Active restaurants: ${activeRestaurants.length} / ${allRestaurants.length}`
            );

            setCategories(allCategories);
            setRestaurantList(activeRestaurants);

            // Enrich food data with restaurant name and category name
            const enrichedFoods = foods
                .filter((food) => {
                    const restaurant = activeRestaurants.find(
                        (r) => r.id === food.restaurantId
                    );
                    return restaurant !== undefined;
                })
                .map((food) => {
                    const restaurant = activeRestaurants.find(
                        (r) => r.id === food.restaurantId
                    );
                    const category = allCategories.find((c) => c.id === food.categoryId);

                    return {
                        ...food,
                        restaurant: restaurant?.name || 'Unknown Restaurant',
                        category: category?.name || 'Uncategorized',
                        categoryId: food.categoryId,
                    };
                });

            console.log('[StoreContextProvider] Enriched foods:', enrichedFoods.length);
            setFoodList(enrichedFoods);
        } catch (error) {
            console.error('[StoreContextProvider] Error fetching foods:', {
                message: error.message,
                stack: error.stack,
                error: error,
            });
            setError(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch restaurants separately if needed
    const fetchRestaurants = useCallback(async () => {
        try {
            const allRestaurants = await restaurantService.getAll();
            const activeRestaurants = allRestaurants.filter(
                (r) => r.status === 'active'
            );
            setRestaurantList(activeRestaurants);
        } catch (error) {
            console.error('[StoreContextProvider] Error fetching restaurants:', error);
        }
    }, []);

    // NOW call fetchFoods in useEffect
    useEffect(() => {
        console.log('[StoreContextProvider] USEEFFECT RUNNING!');

        // Test direct API call
        (async () => {
            console.log('[StoreContextProvider] Starting direct API test...');
            try {
                const response = await fetch('http://192.168.0.127:4000/menus');
                console.log('[StoreContextProvider] API response status:', response.status);
                const data = await response.json();
                console.log('[StoreContextProvider] API data received:', Array.isArray(data), data.length);
            } catch (err) {
                console.error('[StoreContextProvider] Direct API test failed:', err.message);
            }
        })();

        console.log('[StoreContextProvider] Calling fetchFoods()...');
        fetchFoods();
    }, []); // Empty array - run only once on mount

    const contextValue = {
        food_list,
        restaurant_list,
        categories,
        loading,
        error,
        fetchFoods,
        fetchRestaurants,
    };

    console.log('[StoreContextProvider] RENDERING - providing context value:', {
        foods: food_list.length,
        restaurants: restaurant_list.length,
        loading,
        error,
        hasChildren: !!children,
    });

    if (!children) {
        console.warn('[StoreContextProvider] No children provided!');
        return null;
    }

    console.log('[StoreContextProvider] ABOUT TO RETURN PROVIDER WITH CONTEXT');
    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
