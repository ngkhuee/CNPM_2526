/**
 * CartContext.jsx - Global context quản lý giỏ hàng
 * Cung cấp cart state và methods cho toàn app
 */

import React, { createContext, useMemo } from 'react';
import { useCart } from '../hooks/useCart';

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
    // Sử dụng hook tùy chỉnh để quản lý logic cart
    const cartMethods = useCart();

    // Memoize value để tránh re-render không cần thiết
    const value = useMemo(
        () => ({
            cart: cartMethods.cart,
            loading: cartMethods.loading,
            error: cartMethods.error,
            addItem: cartMethods.addItem,
            removeItem: cartMethods.removeItem,
            updateItem: cartMethods.updateItem,
            clearCart: cartMethods.clearCart,
            fetchCart: cartMethods.fetchCart,
            canAddFromRestaurant: cartMethods.canAddFromRestaurant,
            getTotalItems: cartMethods.getTotalItems,
            getTotalPrice: cartMethods.getTotalPrice,
            getCurrentRestaurantId: cartMethods.getCurrentRestaurantId,
            getCurrentRestaurantName: cartMethods.getCurrentRestaurantName,
        }),
        [cartMethods]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
