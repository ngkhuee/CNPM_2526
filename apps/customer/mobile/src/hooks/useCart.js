/**
 * useCart.js - Custom hook for cart management
 * Handles: add/remove/update items, check different restaurant, clear cart
 * Uses cartService for API calls
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { cartService } from '../services/cartService';

export const useCart = () => {
    const { isAuthenticated } = useContext(AuthContext);

    // State for cart management
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cart only if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated]);

    /**
     * Fetch cart from API
     */
    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await cartService.getCart();
            setCart(data);
            console.log('[useCart] Fetched cart:', data);
        } catch (err) {
            console.error('[useCart.fetchCart] Error:', err.message);
            setError(err.message);
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Thêm item vào giỏ hàng
     * 
     * @param {string} restaurant_id - ID nhà hàng
     * @param {string} food_id - ID thực ăn
     * @param {number} quantity - Số lượng (default 1)
     * @param {string} note - Ghi chú (default "")
     * @returns {Object} Giỏ hàng đã cập nhật
     * @throws {Error} Nếu khác restaurant hoặc lỗi khác
     */
    const addItem = useCallback(
        async (restaurant_id, food_id, quantity = 1, note = '') => {
            try {
                setError(null);
                console.log('[useCart.addItem] Adding:', { restaurant_id, food_id, quantity, note });

                const updatedCart = await cartService.addItem({
                    restaurant_id,
                    food_id,
                    quantity,
                    note,
                });

                setCart(updatedCart);
                console.log('[useCart.addItem] Success, cart:', updatedCart);
                return updatedCart;
            } catch (err) {
                console.error('[useCart.addItem] Error:', err.message);
                setError(err.message);
                throw err;
            }
        },
        []
    );

    /**
     * Xóa item khỏi giỏ hàng
     * 
     * @param {string} item_id - ID item cần xóa
     * @returns {Object} Giỏ hàng đã cập nhật
     */
    const removeItem = useCallback(async (item_id) => {
        try {
            setError(null);
            console.log('[useCart.removeItem] Removing item:', item_id);

            const updatedCart = await cartService.removeItem(item_id);
            setCart(updatedCart);
            console.log('[useCart.removeItem] Success, cart:', updatedCart);
            return updatedCart;
        } catch (err) {
            console.error('[useCart.removeItem] Error:', err.message);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Cập nhật số lượng hoặc ghi chú của item
     * 
     * @param {string} item_id - ID item
     * @param {number} quantity - Số lượng mới
     * @param {string} note - Ghi chú mới
     * @returns {Object} Giỏ hàng đã cập nhật
     */
    const updateItem = useCallback(async (item_id, quantity, note = '') => {
        try {
            setError(null);
            console.log('[useCart.updateItem] Updating:', { item_id, quantity, note });

            const updatedCart = await cartService.updateItem({
                item_id,
                quantity,
                note,
            });

            setCart(updatedCart);
            console.log('[useCart.updateItem] Success, cart:', updatedCart);
            return updatedCart;
        } catch (err) {
            console.error('[useCart.updateItem] Error:', err.message);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Xóa toàn bộ giỏ hàng (khi user chuyển restaurant)
     */
    const clearCart = useCallback(async () => {
        try {
            setError(null);
            console.log('[useCart.clearCart] Clearing cart');

            const clearedCart = await cartService.clearCart();

            // Set giỏ trống
            setCart({
                items: [],
                restaurant_id: null,
                restaurant_name: null,
                total: 0,
            });

            console.log('[useCart.clearCart] Success, cart cleared');
            return clearedCart;
        } catch (err) {
            console.error('[useCart.clearCart] Error:', err.message);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Kiểm tra có thể thêm item từ restaurant này không
     * - True nếu giỏ trống HOẶC cùng restaurant
     * - False nếu khác restaurant (cần hỏi user)
     * 
     * @param {string} restaurant_id - ID nhà hàng
     * @returns {boolean}
     */
    const canAddFromRestaurant = useCallback((restaurant_id) => {
        // Nếu giỏ rỗng hoặc chưa có restaurant → có thể thêm
        if (!cart || !cart.items || cart.items.length === 0) {
            console.log('[useCart.canAddFromRestaurant] Cart empty, can add');
            return true;
        }

        // Nếu cùng restaurant → có thể thêm
        if (cart.restaurant_id === restaurant_id) {
            console.log('[useCart.canAddFromRestaurant] Same restaurant, can add');
            return true;
        }

        // Khác restaurant → không thể thêm
        console.log('[useCart.canAddFromRestaurant] Different restaurant, cannot add');
        return false;
    }, [cart]);

    /**
     * Lấy tổng số item trong giỏ
     * 
     * @returns {number}
     */
    const getTotalItems = useCallback(() => {
        if (!cart || !cart.items || cart.items.length === 0) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    /**
     * Lấy tổng tiền trong giỏ
     * 
     * @returns {number}
     */
    const getTotalPrice = useCallback(() => {
        if (!cart || !cart.items || cart.items.length === 0) return 0;
        return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    /**
     * Lấy restaurant ID hiện tại
     * 
     * @returns {string|null}
     */
    const getCurrentRestaurantId = useCallback(() => {
        return cart?.restaurant_id || null;
    }, [cart]);

    /**
     * Lấy restaurant name hiện tại
     * 
     * @returns {string|null}
     */
    const getCurrentRestaurantName = useCallback(() => {
        return cart?.restaurant_name || null;
    }, [cart]);

    return {
        // State
        cart,
        loading,
        error,

        // Actions
        addItem,
        removeItem,
        updateItem,
        clearCart,
        fetchCart,

        // Helpers
        canAddFromRestaurant,
        getTotalItems,
        getTotalPrice,
        getCurrentRestaurantId,
        getCurrentRestaurantName,
    };
};
