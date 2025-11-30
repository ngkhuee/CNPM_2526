/**
 * useCartOperations.js
 * Custom hook for cart CRUD operations and state management
 * Handles: remove item, update quantity, clear cart, cart sync
 */

import { useState, useEffect, useContext, useCallback } from 'react';
import { CartContext } from '../contexts/CartContext';
import { showToast } from '../utils/toastHelper';

export const useCartOperations = () => {
    const cartContext = useContext(CartContext);

    // Get global cart from CartContext
    const globalCart = cartContext?.cart || { items: [], total: 0 };
    const fetchCart = cartContext?.fetchCart;
    const saveLocalCart = cartContext?.saveLocalCart;

    // Local state for display (independent from global cart sync issues)
    const [localCart, setLocalCart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize local cart from global cart on mount
    useEffect(() => {
        if (fetchCart) {
            fetchCart();
            console.log('[useCartOperations] Fetched cart from AsyncStorage');
        }
    }, [fetchCart]);

    // Sync global cart to local state
    useEffect(() => {
        if (globalCart && globalCart.items && globalCart.items.length > 0) {
            setLocalCart(globalCart);
            console.log('[useCartOperations] Synced global cart to local state');
        } else if (!localCart) {
            setLocalCart({ items: [], total: 0, restaurant_id: null, restaurant_name: null });
        }
    }, [globalCart]);

    /**
     * Find item by any ID field (item_id, menu_id, food_id, id)
     */
    const findItemById = useCallback((itemMenuId) => {
        return globalCart.items?.find(
            i => i.item_id === itemMenuId || (i.menu_id || i.food_id || i.id) === itemMenuId
        );
    }, [globalCart.items]);

    /**
     * Remove item from cart
     */
    const handleRemoveItem = useCallback(async (itemMenuId) => {
        try {
            setIsLoading(true);

            const item = findItemById(itemMenuId);

            if (!item || !item.item_id) {
                showToast('error', 'Item not found');
                return false;
            }

            // Call API to remove item
            const updatedCart = await cartContext.removeItem(item.item_id);

            if (updatedCart) {
                setLocalCart(updatedCart);
                showToast('success', 'Đã xóa sản phẩm');
                console.log('[useCartOperations] Item removed:', itemMenuId);
                return true;
            }

            return false;
        } catch (error) {
            console.error('[useCartOperations] Error removing item:', error.message);
            showToast('error', 'Không thể xóa sản phẩm');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [cartContext, findItemById]);

    /**
     * Update item quantity
     */
    const handleUpdateQuantity = useCallback(async (itemMenuId, quantity) => {
        // If quantity is 0 or negative, remove the item
        if (quantity <= 0) {
            return await handleRemoveItem(itemMenuId);
        }

        try {
            setIsLoading(true);

            const item = findItemById(itemMenuId);

            if (!item || !item.item_id) {
                showToast('error', 'Item not found');
                return false;
            }

            // Call API to update item quantity
            const updatedCart = await cartContext.updateItem(item.item_id, quantity, '');

            if (updatedCart) {
                setLocalCart(updatedCart);
                console.log('[useCartOperations] Quantity updated:', { itemMenuId, quantity });
                return true;
            }

            return false;
        } catch (error) {
            console.error('[useCartOperations] Error updating quantity:', error.message);
            showToast('error', 'Không thể cập nhật sản phẩm');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [cartContext, findItemById, handleRemoveItem]);

    /**
     * Clear entire cart
     */
    const handleClearCart = useCallback(async () => {
        try {
            setIsLoading(true);

            const updatedCart = await cartContext.clearCart();

            if (updatedCart) {
                setLocalCart({ items: [], total: 0, restaurant_id: null, restaurant_name: null });
                showToast('success', 'Đã xóa giỏ hàng');
                console.log('[useCartOperations] Cart cleared');
                return true;
            }

            return false;
        } catch (error) {
            console.error('[useCartOperations] Error clearing cart:', error.message);
            showToast('error', 'Không thể xóa giỏ hàng');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [cartContext]);

    /**
     * Save cart before checkout
     */
    const saveCartBeforeCheckout = useCallback(() => {
        if (saveLocalCart && localCart?.restaurant_id) {
            saveLocalCart(localCart.restaurant_id, localCart);
            console.log('[useCartOperations] Cart saved before checkout');
            return true;
        }
        return false;
    }, [saveLocalCart, localCart]);

    /**
     * Calculate cart totals
     */
    const calculateTotals = useCallback(() => {
        const items = localCart?.items || [];
        const subtotal = items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            subtotal,
            totalItems,
            items
        };
    }, [localCart]);

    return {
        localCart,
        isLoading,
        handleRemoveItem,
        handleUpdateQuantity,
        handleClearCart,
        saveCartBeforeCheckout,
        calculateTotals,
        isEmpty: !localCart || localCart.items.length === 0
    };
};
