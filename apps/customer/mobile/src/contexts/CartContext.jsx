/**
 * CartContext.jsx - Global context quản lý giỏ hàng
 * Cung cấp cart state và methods cho toàn app
 * 
 * Features:
 * - Global cart management (single restaurant at a time)
 * - Multi-restaurant cart persistence (via useMultiRestaurantCart)
 * - LocalCart ↔ GlobalCart sync
 */

import React, { createContext, useMemo } from 'react';
import { useCart } from '../hooks/useCart';
import { useMultiRestaurantCart } from '../hooks/useMultiRestaurantCart';

export const CartContext = createContext();

/**
 * CartProvider - Component wrapper cung cấp cart context
 * 
 * Sử dụng ở App.js:
 * <CartProvider>
 *   <AppNavigator />
 * </CartProvider>
 */
export const CartProvider = ({ children }) => {
    // Global cart management (API-based)
    const cartMethods = useCart();

    // Multi-restaurant local carts (AsyncStorage-based)
    const multiCartMethods = useMultiRestaurantCart();

    // Memoize value để tránh re-render không cần thiết
    const value = useMemo(
        () => ({
            // === Global Cart (single active restaurant) ===
            cart: cartMethods.cart,
            loading: cartMethods.loading,
            error: cartMethods.error,
            addItem: cartMethods.addItem,
            removeItem: cartMethods.removeItem,
            updateItem: cartMethods.updateItem,
            clearCart: cartMethods.clearCart,
            clearCurrentRestaurantCart: cartMethods.clearCurrentRestaurantCart,
            syncLocalCartToGlobal: cartMethods.syncLocalCartToGlobal,
            fetchCart: cartMethods.fetchCart,
            canAddFromRestaurant: cartMethods.canAddFromRestaurant,
            getTotalItems: cartMethods.getTotalItems,
            getTotalPrice: cartMethods.getTotalPrice,
            getCurrentRestaurantId: cartMethods.getCurrentRestaurantId,
            getCurrentRestaurantName: cartMethods.getCurrentRestaurantName,

            // === Multi-Restaurant Local Carts (AsyncStorage) ===
            localCarts: multiCartMethods.localCarts,
            lastActiveRestaurantId: multiCartMethods.lastActiveRestaurantId,
            multiCartLoading: multiCartMethods.loading,
            multiCartError: multiCartMethods.error,

            // Methods
            saveLocalCart: multiCartMethods.saveLocalCart,
            loadLocalCart: multiCartMethods.loadLocalCart,
            loadLastActiveCart: multiCartMethods.loadLastActiveCart,
            deleteLocalCart: multiCartMethods.deleteLocalCart,
            switchRestaurant: multiCartMethods.switchRestaurant,
            setLastActive: multiCartMethods.setLastActive,
            clearAllCarts: multiCartMethods.clearAllCarts,

            // Helpers
            getAllRestaurantIds: multiCartMethods.getAllRestaurantIds,
            getAnotherRestaurantId: multiCartMethods.getAnotherRestaurantId,
        }),
        [cartMethods, multiCartMethods]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
