import React, { createContext, useState, useCallback } from 'react';

/**
 * NavigationContext - Quản lý state navigation toàn app
 * Lưu trữ:
 * - targetRestaurantId: ID nhà hàng cần navigate đến
 * - highlightedFoodId: ID food cần highlight
 * - isNavigating: Flag để trigger navigation
 * - navigationData: Extra data nếu cần
 */
export const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
    const [navigationState, setNavigationStateInternal] = useState({
        targetRestaurantId: null,
        highlightedFoodId: null,
        isNavigating: false,
        navigationData: null,
    });

    // Wrapper để có thể log hoặc validate trước khi set state
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
        });
    }, []);

    const value = {
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
