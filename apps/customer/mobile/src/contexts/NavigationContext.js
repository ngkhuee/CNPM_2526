import React, { createContext, useState, useCallback } from 'react';

/**
 * NavigationContext - Quản lý state navigation toàn app
 * Lưu trữ:
 * - activeRoute: Screen hiện tại ('home', 'restaurant', 'cart', 'checkout', 'orders', 'profile')
 * - navigate: Function để navigate đến screen khác
 * - targetRestaurantId: ID nhà hàng cần navigate đến
 * - highlightedFoodId: ID food cần highlight
 * - isNavigating: Flag để trigger navigation
 * - navigationData: Extra data nếu cần
    * - pendingLocalCart: Local cart từ RestaurantDetail/FoodDetailScreen
    * - selectedRestaurant: Restaurant object khi vào FoodDetailScreen (để check opening hours)
    * - orderId: Order ID cho Payment/Tracking/OrderDetail/Review screens
    */
export const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
    const [activeRoute, setActiveRouteInternal] = useState('home');
    const [navigationState, setNavigationStateInternal] = useState({
        targetRestaurantId: null,
        highlightedFoodId: null,
        isNavigating: false,
        navigationData: null,
        pendingLocalCart: null,
        selectedRestaurant: null,
        orderId: null,
    });    // Wrapper để có thể log hoặc validate trước khi set state
    const setNavigationState = useCallback((newState) => {
        console.log('[NavigationContext] Setting state:', newState);
        setNavigationStateInternal((prev) => ({
            ...prev,
            ...newState,
        }));
    }, []);

    // Reset state - dùng khi hết xong navigation
    const resetNavigationState = useCallback(() => {
        console.log('[NavigationContext] Resetting state');
        setNavigationStateInternal({
            targetRestaurantId: null,
            highlightedFoodId: null,
            isNavigating: false,
            navigationData: null,
            pendingLocalCart: null,
            selectedRestaurant: null,
            orderId: null,
        });
    }, []);

    /**
     * Navigate đến screen khác
     * @param {string} route - Tên route ('home', 'cart', 'checkout', etc)
     * @param {Object} params - Optional params (orderId, restaurantId, etc)
     */
    const navigate = useCallback((route, params = {}) => {
        console.log('[NavigationContext] Navigating to:', route, 'with params:', params);

        // Update state FIRST (synchronously in state batch)
        setNavigationStateInternal((prev) => {
            const newState = { ...prev };
            if (params.orderId !== undefined) newState.orderId = params.orderId;
            if (params.restaurantId !== undefined) newState.targetRestaurantId = params.restaurantId;
            if (params.foodId !== undefined) newState.highlightedFoodId = params.foodId;
            if (params.navigationData !== undefined) newState.navigationData = params.navigationData;
            console.log('[NavigationContext] Updated navigationState:', newState);
            return newState;
        });

        // Then set active route
        setActiveRouteInternal(route);
    }, []);

    /**
     * Go back to previous screen (will be used by AppNavigator's back handler)
     */
    const goBack = useCallback(() => {
        console.log('[NavigationContext] Going back from:', activeRoute);
        // This will be handled by AppNavigator's back handler
        // Just log here for debugging
    }, [activeRoute]);

    const value = {
        activeRoute,
        navigate,
        goBack,
        ...navigationState,
        setNavigationState,
        resetNavigationState,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};
