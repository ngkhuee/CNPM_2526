/**
 * useMultiRestaurantCart.js
 * Quản lý multiple carts (một cho mỗi restaurant) với AsyncStorage persistence
 * 
 * Features:
 * - Lưu/tải từng cart của restaurant vào AsyncStorage (cart_restaurant_${id})
 * - Tracking restaurant active cuối cùng (lastActiveRestaurantId)
 * - Auto-restore carts khi app restart
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'cart_restaurant_';
const LAST_ACTIVE_KEY = 'lastActiveRestaurantId';

export const useMultiRestaurantCart = () => {
    const [localCarts, setLocalCarts] = useState({}); // { [restaurantId]: cartData }
    const [lastActiveRestaurantId, setLastActiveRestaurantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Khởi tạo: Tải tất cả carts từ AsyncStorage
     */
    useEffect(() => {
        initializeCartsFromStorage();
    }, []);

    /**
     * Load tất cả carts từ AsyncStorage
     */
    const initializeCartsFromStorage = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Tải lastActiveRestaurantId
            const lastActive = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
            if (lastActive) {
                setLastActiveRestaurantId(lastActive);
            }

            // Tải tất cả cart keys
            const allKeys = await AsyncStorage.getAllKeys();
            const cartKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));

            // Tải từng cart
            const cartsData = {};
            for (const key of cartKeys) {
                try {
                    const cartJson = await AsyncStorage.getItem(key);
                    if (cartJson) {
                        const restaurantId = key.replace(STORAGE_PREFIX, '');
                        cartsData[restaurantId] = JSON.parse(cartJson);
                    }
                } catch (err) {
                    console.error(`[useMultiRestaurantCart] Error loading cart ${key}:`, err.message);
                }
            }

            setLocalCarts(cartsData);
            console.log('[useMultiRestaurantCart] Initialized carts:', cartsData);
        } catch (err) {
            console.error('[useMultiRestaurantCart] Initialization error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lưu cart của một restaurant vào AsyncStorage
     * @param {string} restaurantId - ID nhà hàng
     * @param {Object} cartData - Dữ liệu giỏ hàng
     */
    const saveLocalCart = useCallback(async (restaurantId, cartData) => {
        if (!restaurantId) return;

        try {
            const key = `${STORAGE_PREFIX}${restaurantId}`;
            await AsyncStorage.setItem(key, JSON.stringify(cartData));

            // Update state
            setLocalCarts(prev => ({
                ...prev,
                [restaurantId]: cartData,
            }));

            console.log(`[useMultiRestaurantCart] Saved cart for restaurant ${restaurantId}`);
        } catch (err) {
            console.error(`[useMultiRestaurantCart] Error saving cart ${restaurantId}:`, err.message);
            setError(err.message);
        }
    }, []);

    /**
     * Tải cart của một restaurant từ AsyncStorage
     * @param {string} restaurantId - ID nhà hàng
     * @returns {Object|null} Cart data hoặc null nếu không tồn tại
     */
    const loadLocalCart = useCallback(async (restaurantId) => {
        if (!restaurantId) return null;

        try {
            // Kiểm tra state trước
            if (localCarts[restaurantId]) {
                console.log(`[useMultiRestaurantCart] Loaded cart for restaurant ${restaurantId} from state`);
                return localCarts[restaurantId];
            }

            // Tải từ AsyncStorage
            const key = `${STORAGE_PREFIX}${restaurantId}`;
            const cartJson = await AsyncStorage.getItem(key);

            if (cartJson) {
                const cartData = JSON.parse(cartJson);
                setLocalCarts(prev => ({
                    ...prev,
                    [restaurantId]: cartData,
                }));
                console.log(`[useMultiRestaurantCart] Loaded cart for restaurant ${restaurantId} from storage`);
                return cartData;
            }

            console.log(`[useMultiRestaurantCart] No cart found for restaurant ${restaurantId}`);
            return null;
        } catch (err) {
            console.error(`[useMultiRestaurantCart] Error loading cart ${restaurantId}:`, err.message);
            setError(err.message);
            return null;
        }
    }, [localCarts]);

    /**
     * Tải cart của restaurant active cuối cùng
     * @returns {Object} { restaurantId, cartData } hoặc { restaurantId: null, cartData: null }
     */
    const loadLastActiveCart = useCallback(async () => {
        if (!lastActiveRestaurantId) {
            console.log('[useMultiRestaurantCart] No last active restaurant');
            return { restaurantId: null, cartData: null };
        }

        try {
            const cartData = await loadLocalCart(lastActiveRestaurantId);
            if (cartData) {
                return {
                    restaurantId: lastActiveRestaurantId,
                    cartData,
                };
            }

            console.log('[useMultiRestaurantCart] Last active cart not found, clearing last active');
            await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
            setLastActiveRestaurantId(null);
            return { restaurantId: null, cartData: null };
        } catch (err) {
            console.error('[useMultiRestaurantCart] Error loading last active cart:', err.message);
            setError(err.message);
            return { restaurantId: null, cartData: null };
        }
    }, [lastActiveRestaurantId, loadLocalCart]);

    /**
     * Xóa cart của một restaurant khỏi AsyncStorage
     * @param {string} restaurantId - ID nhà hàng
     */
    const deleteLocalCart = useCallback(async (restaurantId) => {
        if (!restaurantId) return;

        try {
            const key = `${STORAGE_PREFIX}${restaurantId}`;
            await AsyncStorage.removeItem(key);

            // Update state
            setLocalCarts(prev => {
                const updated = { ...prev };
                delete updated[restaurantId];
                return updated;
            });

            // Nếu xóa restaurant active, xóa lastActive
            if (restaurantId === lastActiveRestaurantId) {
                await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
                setLastActiveRestaurantId(null);
            }

            console.log(`[useMultiRestaurantCart] Deleted cart for restaurant ${restaurantId}`);
        } catch (err) {
            console.error(`[useMultiRestaurantCart] Error deleting cart ${restaurantId}:`, err.message);
            setError(err.message);
        }
    }, [lastActiveRestaurantId]);

    /**
     * Chuyển sang restaurant khác
     * - Save current cart (nếu có) vào AsyncStorage
     * - Load cart của restaurant mới
     * - Update lastActiveRestaurantId
     * @param {string} fromRestaurantId - Restaurant hiện tại
     * @param {Object} currentCartData - Dữ liệu cart hiện tại
     * @param {string} toRestaurantId - Restaurant muốn chuyển tới
     * @returns {Object} { success, cartData }
     */
    const switchRestaurant = useCallback(async (fromRestaurantId, currentCartData, toRestaurantId) => {
        try {
            // Save cart của restaurant hiện tại
            if (fromRestaurantId && currentCartData) {
                await saveLocalCart(fromRestaurantId, currentCartData);
            }

            // Load cart của restaurant mới
            const newCartData = await loadLocalCart(toRestaurantId);

            // Update lastActiveRestaurantId
            await AsyncStorage.setItem(LAST_ACTIVE_KEY, toRestaurantId);
            setLastActiveRestaurantId(toRestaurantId);

            console.log(`[useMultiRestaurantCart] Switched from ${fromRestaurantId} to ${toRestaurantId}`);

            return {
                success: true,
                cartData: newCartData || {
                    items: [],
                    restaurant_id: toRestaurantId,
                    restaurant_name: null,
                    total: 0,
                },
            };
        } catch (err) {
            console.error('[useMultiRestaurantCart] Error switching restaurant:', err.message);
            setError(err.message);
            return { success: false, cartData: null };
        }
    }, [saveLocalCart, loadLocalCart]);

    /**
     * Set lastActiveRestaurantId
     * @param {string} restaurantId
     */
    const setLastActive = useCallback(async (restaurantId) => {
        try {
            if (restaurantId) {
                await AsyncStorage.setItem(LAST_ACTIVE_KEY, restaurantId);
            } else {
                await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
            }
            setLastActiveRestaurantId(restaurantId);
        } catch (err) {
            console.error('[useMultiRestaurantCart] Error setting last active:', err.message);
            setError(err.message);
        }
    }, []);

    /**
     * Xóa tất cả carts (logout)
     */
    const clearAllCarts = useCallback(async () => {
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            const cartKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));

            await AsyncStorage.multiRemove([...cartKeys, LAST_ACTIVE_KEY]);

            setLocalCarts({});
            setLastActiveRestaurantId(null);

            console.log('[useMultiRestaurantCart] Cleared all carts');
        } catch (err) {
            console.error('[useMultiRestaurantCart] Error clearing all carts:', err.message);
            setError(err.message);
        }
    }, []);

    /**
     * Lấy tất cả restaurant IDs có cart
     */
    const getAllRestaurantIds = useCallback(() => {
        return Object.keys(localCarts);
    }, [localCarts]);

    /**
     * Lấy restaurant khác (ngoài current)
     * @param {string} currentRestaurantId
     * @returns {string|null}
     */
    const getAnotherRestaurantId = useCallback((currentRestaurantId) => {
        const ids = getAllRestaurantIds();
        return ids.find(id => id !== currentRestaurantId) || null;
    }, [getAllRestaurantIds]);

    return {
        // State
        localCarts,
        lastActiveRestaurantId,
        loading,
        error,

        // Actions
        saveLocalCart,
        loadLocalCart,
        loadLastActiveCart,
        deleteLocalCart,
        switchRestaurant,
        setLastActive,
        clearAllCarts,

        // Helpers
        getAllRestaurantIds,
        getAnotherRestaurantId,

        // Re-initialize
        initializeCartsFromStorage,
    };
};
