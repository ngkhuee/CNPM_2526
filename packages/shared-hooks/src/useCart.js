// useCart hook - Cart logic tách riêng để web và mobile dùng chung
// Manages Single Restaurant Cart with conflict detection
import { useState, useEffect, useCallback } from "react";
import { cartService } from "shared-services";

/**
 * useCart Hook - Manages cart state and logic
 * Handles:
 * - Loading cart from API
 * - Adding/removing/updating items
 * - Checking if can add from different restaurant (Single Restaurant Constraint)
 * - Clearing cart
 * 
 * Returns: {
 *   cart: Object|null,        // Full cart object with items
 *   loading: boolean,
 *   error: string|null,
 *   addItem: (restaurant_id, food_id, quantity, note) => Promise<Object>,
 *   removeItem: (item_id) => Promise<Object>,
 *   updateItem: (item_id, quantity, note) => Promise<Object>,
 *   clearCart: () => Promise<void>,
 *   canAddFromRestaurant: (restaurant_id) => boolean,
 *   getCurrentRestaurantId: () => string|null,
 *   fetchCart: () => Promise<void>
 * }
 */
export const useCart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load cart on mount
    useEffect(() => {
        fetchCart();
    }, []);

    /**
     * Fetch cart from API
     */
    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await cartService.getCart();
            setCart(data);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError(err.message);
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Add item to cart
     * @param {string} restaurant_id - Restaurant ID
     * @param {string} food_id - Food ID
     * @param {number} quantity - Quantity (default 1)
     * @param {string} note - Optional note
     * @returns {Object} Updated cart
     * @throws {Error} If different restaurant
     */
    const addItem = useCallback(
        async (restaurant_id, food_id, quantity = 1, note = "") => {
            try {
                setError(null);
                const updatedCart = await cartService.addItem({
                    restaurant_id,
                    food_id,
                    quantity,
                    note,
                });
                setCart(updatedCart);
                return updatedCart;
            } catch (err) {
                console.error("Error adding item:", err);
                setError(err.message);
                throw err;
            }
        },
        []
    );

    /**
     * Remove item from cart
     * @param {string} item_id - Cart item ID
     * @returns {Object} Updated cart
     */
    const removeItem = useCallback(async (item_id) => {
        try {
            setError(null);
            const updatedCart = await cartService.removeItem(item_id);
            setCart(updatedCart);
            return updatedCart;
        } catch (err) {
            console.error("Error removing item:", err);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Update item quantity and note
     * @param {string} item_id - Cart item ID
     * @param {number} quantity - New quantity
     * @param {string} note - Updated note
     * @returns {Object} Updated cart
     */
    const updateItem = useCallback(async (item_id, quantity, note = "") => {
        try {
            setError(null);
            const updatedCart = await cartService.updateItem({
                item_id,
                quantity,
                note,
            });
            setCart(updatedCart);
            return updatedCart;
        } catch (err) {
            console.error("Error updating item:", err);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Clear entire cart
     */
    const clearCart = useCallback(async () => {
        try {
            setError(null);
            await cartService.clearCart();
            setCart(null);
        } catch (err) {
            console.error("Error clearing cart:", err);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Check if can add item from specific restaurant
     * - True if cart is empty OR same restaurant
     * - False if different restaurant (need to switch)
     * @param {string} restaurant_id - Restaurant ID to check
     * @returns {boolean}
     */
    const canAddFromRestaurant = useCallback((restaurant_id) => {
        if (!cart) return true; // Empty cart, can add
        return cart.restaurant_id === restaurant_id; // Same restaurant, can add
    }, [cart]);

    /**
     * Get current restaurant ID from cart
     * @returns {string|null}
     */
    const getCurrentRestaurantId = useCallback(() => {
        return cart?.restaurant_id || null;
    }, [cart]);

    return {
        cart,
        loading,
        error,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        canAddFromRestaurant,
        getCurrentRestaurantId,
        fetchCart,
    };
};

export default useCart;
