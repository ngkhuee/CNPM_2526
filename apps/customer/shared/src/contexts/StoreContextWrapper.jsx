import React, { useContext, useMemo } from 'react';
import { StoreContext } from './StoreContext';
import { RestaurantContext } from './RestaurantContext';
import { AuthContext } from './AuthContext';

/**
 * StoreContextWrapper - Combines RestaurantContext + AuthContext for StoreContext
 * This allows web to use StoreContext while mobile uses individual contexts
 * 
 * Data flow:
 * RestaurantContext (restaurants) → StoreContextWrapper → StoreContext (restaurant_list, food_list)
 * AuthContext (user) → StoreContextWrapper → StoreContext (user)
 */
export const StoreContextWrapper = ({ children }) => {
    const restaurantContextValue = useContext(RestaurantContext);
    const authContextValue = useContext(AuthContext);

    // Extract data from RestaurantContext
    const restaurants = restaurantContextValue?.restaurants || [];
    const restaurantLoading = restaurantContextValue?.loading || restaurantContextValue?.loadingRestaurants || false;

    // Extract data from AuthContext
    const user = authContextValue?.user || null;

    // Memoize the data to avoid unnecessary re-renders
    const storeContextValue = useMemo(() => ({
        food_list: restaurants.flatMap(r => (r.foods || []).map(f => ({
            ...f,
            restaurantId: r.id,
            restaurant: r.name,
        }))),
        restaurant_list: restaurants,
        loading: restaurantLoading,
        user,
        url: import.meta.env.VITE_API_URL || "http://localhost:8000",
    }), [restaurants, restaurantLoading, user]);

    return (
        <StoreContext.Provider value={storeContextValue}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContextWrapper;
