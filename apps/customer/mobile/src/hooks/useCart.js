/**
 * useCart.js - Custom hook for cart management
 * Handles: add/remove/update items, check different restaurant, clear cart
 * Uses cartService for API calls
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { cartService } from '../services/cartService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
     * Fetch cart from API backend (single restaurant cart)
     * This ensures cart is synced across all devices via db.json
     * 404 is normal when cart doesn't exist yet (first time user)
     */
    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch from API backend
            const data = await cartService.getCart();

            if (data) {
                console.log('[useCart.fetchCart] Loaded cart from API:', data);
                setCart(data);

                // Also sync to AsyncStorage as backup
                try {
                    await AsyncStorage.setItem(`cart_restaurant_${data.restaurant_id}`, JSON.stringify(data));
                    if (data.restaurant_id) {
                        await AsyncStorage.setItem('lastActiveRestaurantId', data.restaurant_id);
                    }
                } catch (storageErr) {
                    console.warn('[useCart.fetchCart] Error saving cart to AsyncStorage:', storageErr.message);
                }
            } else {
                // Cart doesn't exist yet - this is normal on first app load
                console.log('[useCart.fetchCart] Cart is empty (first load or cleared)');
                setCart(null);
            }
        } catch (err) {
            console.error('[useCart.fetchCart] Error:', err.message);
            setError(err.message);
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, []);    /**
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

                // Validate inputs
                if (!restaurant_id || !food_id) {
                    throw new Error('restaurant_id and food_id are required');
                }

                const updatedCart = await cartService.addItem({
                    restaurant_id,
                    food_id: parseInt(food_id) || food_id, // Ensure food_id is number
                    quantity,
                    note,
                });

                setCart(updatedCart);

                // Sync to AsyncStorage as backup
                if (updatedCart) {
                    try {
                        await AsyncStorage.setItem(`cart_restaurant_${updatedCart.restaurant_id}`, JSON.stringify(updatedCart));
                        await AsyncStorage.setItem('lastActiveRestaurantId', updatedCart.restaurant_id);
                    } catch (storageErr) {
                        console.warn('[useCart.addItem] Error saving to AsyncStorage:', storageErr.message);
                    }
                }

                console.log('[useCart.addItem] Success, cart:', updatedCart);
                return updatedCart;
            } catch (err) {
                console.error('[useCart.addItem] Error:', err.message);
                // Log backend error details if available
                if (err.response?.data) {
                    console.error('[useCart.addItem] Backend error:', err.response.data);
                }
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

            // Sync to AsyncStorage as backup
            if (updatedCart) {
                try {
                    if (updatedCart.items.length > 0) {
                        await AsyncStorage.setItem(`cart_restaurant_${updatedCart.restaurant_id}`, JSON.stringify(updatedCart));
                    } else {
                        await AsyncStorage.removeItem(`cart_restaurant_${updatedCart.restaurant_id}`);
                    }
                } catch (storageErr) {
                    console.warn('[useCart.removeItem] Error updating AsyncStorage:', storageErr.message);
                }
            }

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

            // Sync to AsyncStorage as backup
            if (updatedCart) {
                try {
                    await AsyncStorage.setItem(`cart_restaurant_${updatedCart.restaurant_id}`, JSON.stringify(updatedCart));
                } catch (storageErr) {
                    console.warn('[useCart.updateItem] Error updating AsyncStorage:', storageErr.message);
                }
            }

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
            const emptyCart = {
                items: [],
                restaurant_id: null,
                restaurant_name: null,
                total: 0,
            };
            setCart(emptyCart);

            // Clear from AsyncStorage
            try {
                const keys = await AsyncStorage.getAllKeys();
                const cartKeys = keys.filter(k => k.startsWith('cart_restaurant_'));
                if (cartKeys.length > 0) {
                    await AsyncStorage.multiRemove(cartKeys);
                }
                await AsyncStorage.removeItem('lastActiveRestaurantId');
            } catch (storageErr) {
                console.warn('[useCart.clearCart] Error clearing AsyncStorage:', storageErr.message);
            }

            console.log('[useCart.clearCart] Success, cart cleared');
            return clearedCart;
        } catch (err) {
            console.error('[useCart.clearCart] Error:', err.message);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Xóa CHỈ items của restaurant hiện tại
     * Nếu có items từ restaurant khác, switch sang nó
     * 
     * Use case: Sau khi thanh toán giỏ B, auto-switch sang giỏ A (nếu có)
     */
    const clearCurrentRestaurantCart = useCallback(async () => {
        try {
            setError(null);
            console.log('[useCart.clearCurrentRestaurantCart] Clearing current restaurant cart');

            if (!cart || !cart.restaurant_id) {
                console.log('[useCart.clearCurrentRestaurantCart] Cart empty, nothing to clear');
                return;
            }

            const currentRestaurantId = cart.restaurant_id;

            // Call API to clear backend cart
            try {
                await cartService.clearCart();
                console.log('[useCart.clearCurrentRestaurantCart] Backend cart cleared via API');
            } catch (apiErr) {
                console.error('[useCart.clearCurrentRestaurantCart] Error clearing backend cart:', apiErr.message);
            }

            // Remove from AsyncStorage
            try {
                await AsyncStorage.removeItem(`cart_restaurant_${currentRestaurantId}`);
                console.log(`[useCart.clearCurrentRestaurantCart] Removed from AsyncStorage: ${currentRestaurantId}`);
            } catch (storageErr) {
                console.error(`[useCart.clearCurrentRestaurantCart] Error removing from storage:`, storageErr.message);
            }

            const remainingItems = cart.items.filter(
                item => item.restaurant_id && item.restaurant_id !== currentRestaurantId
            );

            console.log(`[useCart.clearCurrentRestaurantCart] Current restaurant: ${currentRestaurantId}, remaining items: ${remainingItems.length}`);

            if (remainingItems.length > 0) {
                // Có items từ restaurant khác, switch sang nó
                const newRestaurantId = remainingItems[0].restaurant_id;
                const newRestaurantName = remainingItems[0].restaurant_name;

                setCart({
                    items: remainingItems,
                    restaurant_id: newRestaurantId,
                    restaurant_name: newRestaurantName,
                    total: remainingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                });

                // Update lastActiveRestaurantId in AsyncStorage
                try {
                    await AsyncStorage.setItem('lastActiveRestaurantId', newRestaurantId);
                    console.log(`[useCart.clearCurrentRestaurantCart] Updated lastActiveRestaurantId to ${newRestaurantId}`);
                } catch (storageErr) {
                    console.error('[useCart.clearCurrentRestaurantCart] Error updating lastActive:', storageErr.message);
                }

                console.log(`[useCart.clearCurrentRestaurantCart] Switched to restaurant ${newRestaurantId}`);
            } else {
                // Không còn items nào, xóa sạch
                setCart({
                    items: [],
                    restaurant_id: null,
                    restaurant_name: null,
                    total: 0,
                });

                // Clear lastActiveRestaurantId
                try {
                    await AsyncStorage.removeItem('lastActiveRestaurantId');
                    console.log('[useCart.clearCurrentRestaurantCart] Cleared lastActiveRestaurantId');
                } catch (storageErr) {
                    console.error('[useCart.clearCurrentRestaurantCart] Error clearing lastActive:', storageErr.message);
                }

                console.log('[useCart.clearCurrentRestaurantCart] No remaining items, cleared cart');
            }
        } catch (err) {
            console.error('[useCart.clearCurrentRestaurantCart] Error:', err.message);
            setError(err.message);
            throw err;
        }
    }, [cart]);

    /**
     * Sync local cart (from screen) → global cart
     * 
     * @param {Object} localCart - Local cart data (from RestaurantDetail, FoodDetailScreen)
     * @param {boolean} merge - Merge với global cart (default: true cho same restaurant, false cho khác restaurant)
     */
    const syncLocalCartToGlobal = useCallback(async (localCart, merge = true) => {
        try {
            setError(null);
            console.log('[useCart.syncLocalCartToGlobal] Syncing local cart:', localCart);

            if (!localCart || !localCart.items || localCart.items.length === 0) {
                console.log('[useCart.syncLocalCartToGlobal] Local cart empty, skipping sync');
                return;
            }

            const localRestaurantId = localCart.restaurant_id;

            // Nếu global cart khác restaurant, clear nó trước
            if (cart && cart.restaurant_id && cart.restaurant_id !== localRestaurantId) {
                console.log('[useCart.syncLocalCartToGlobal] Different restaurant, clearing global cart');
                merge = false;
            }

            if (merge && cart && cart.restaurant_id === localRestaurantId) {
                // Merge: Thêm items từ local vào global
                const mergedItems = [...(cart.items || [])];

                for (const localItem of localCart.items) {
                    const existingIndex = mergedItems.findIndex(
                        item => (item.id || item.menu_id) === (localItem.id || localItem.menu_id)
                    );

                    if (existingIndex >= 0) {
                        mergedItems[existingIndex].quantity += localItem.quantity;
                    } else {
                        mergedItems.push(localItem);
                    }
                }

                const newTotal = mergedItems.reduce(
                    (sum, item) => sum + (item.price * item.quantity),
                    0
                );

                setCart({
                    items: mergedItems,
                    restaurant_id: localRestaurantId,
                    restaurant_name: localCart.restaurant_name || cart.restaurant_name,
                    total: newTotal,
                });

                console.log('[useCart.syncLocalCartToGlobal] Merged, global cart now has', mergedItems.length, 'items');
            } else {
                // Replace: Thay toàn bộ global cart bằng local cart
                const newTotal = localCart.items.reduce(
                    (sum, item) => sum + (item.price * item.quantity),
                    0
                );

                setCart({
                    items: localCart.items,
                    restaurant_id: localRestaurantId,
                    restaurant_name: localCart.restaurant_name,
                    total: newTotal,
                });

                console.log('[useCart.syncLocalCartToGlobal] Replaced, global cart now has', localCart.items.length, 'items');
            }
        } catch (err) {
            console.error('[useCart.syncLocalCartToGlobal] Error:', err.message);
            setError(err.message);
            throw err;
        }
    }, [cart]);

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
        clearCurrentRestaurantCart,
        syncLocalCartToGlobal,
        fetchCart,

        // Helpers
        canAddFromRestaurant,
        getTotalItems,
        getTotalPrice,
        getCurrentRestaurantId,
        getCurrentRestaurantName,
    };
};
