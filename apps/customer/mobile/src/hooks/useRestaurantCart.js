// hooks/useRestaurantCart.js - Quản lý cart logic với AsyncStorage sync
import { useState, useEffect, useRef, useCallback } from 'react';
import { showToast } from '../utils/toastHelper';
import { isRestaurantOpen } from '../utils/hoursHelper';
import { getFoodImageUrl } from '../shared/imageHelper';
import { createBubbleAnimation } from '../utils/animationHelpers';

export const useRestaurantCart = (restaurant, initialCart, pendingCart, clearPendingCart, cartContext = null) => {
    const [localCart, setLocalCart] = useState(initialCart);
    const bubbleAnimation = useRef(createBubbleAnimation()).current;

    // Restore pending cart from navigation context
    useEffect(() => {
        if (pendingCart) {
            setLocalCart(pendingCart);
            clearPendingCart?.();
        }
    }, [pendingCart, clearPendingCart]);

    /**
     * Sync localCart when initialCart changes (e.g., restored from AsyncStorage)
     */
    useEffect(() => {
        if (initialCart && initialCart.items && initialCart.items.length > 0) {
            console.log('[useRestaurantCart] Syncing initialCart (restored from storage):', initialCart);
            setLocalCart(initialCart);
        }
    }, [initialCart]);

    /**
     * Sync local cart → AsyncStorage + Global Cart
     * Called after every local cart update
     */
    const syncCartToStorage = useCallback(async (updatedCart) => {
        try {
            if (!updatedCart || !updatedCart.items || updatedCart.items.length === 0) {
                console.log('[useRestaurantCart] Cart empty, skipping sync');
                return;
            }

            const restaurantId = updatedCart.restaurant_id || restaurant?.id;
            if (!restaurantId) {
                console.log('[useRestaurantCart] No restaurant ID, skipping sync');
                return;
            }

            // Save to AsyncStorage via CartContext
            if (cartContext?.saveLocalCart) {
                await cartContext.saveLocalCart(restaurantId, updatedCart);
                console.log('[useRestaurantCart] Saved to AsyncStorage:', restaurantId);
            }

            // Sync to Global Cart via CartContext
            if (cartContext?.syncLocalCartToGlobal) {
                await cartContext.syncLocalCartToGlobal(updatedCart, true);
                console.log('[useRestaurantCart] Synced to global cart');
            }

            // Set as last active restaurant
            if (cartContext?.setLastActive) {
                await cartContext.setLastActive(restaurantId);
            }
        } catch (error) {
            console.error('[useRestaurantCart] Sync error:', error.message);
        }
    }, [restaurant?.id, cartContext]);

    const handleAddToCart = async (foodItem) => {
        // Check if restaurant is open
        if (!isRestaurantOpen(restaurant?.openingHours)) {
            showToast('error', 'This restaurant is currently closed');
            return;
        }

        try {
            // Add to API backend cart
            if (!cartContext?.addItem) {
                throw new Error('Cart context not available');
            }

            const restaurantId = foodItem.restaurant_id || restaurant?.id;
            const updatedCart = await cartContext.addItem(
                restaurantId,
                foodItem.id,
                1,
                ''
            );

            if (updatedCart) {
                setLocalCart(updatedCart);

                // Sync to AsyncStorage for backup
                if (cartContext?.saveLocalCart) {
                    await cartContext.saveLocalCart(restaurantId, updatedCart);
                    console.log('[useRestaurantCart] Saved to AsyncStorage:', restaurantId);
                }

                // Set as last active restaurant
                // This ensures global cart always shows current restaurant items
                if (cartContext?.setLastActive) {
                    await cartContext.setLastActive(restaurantId);
                }

                bubbleAnimation.pulse();
                showToast('success', 'Added to cart!');

                console.log('[useRestaurantCart] Added to API cart:', {
                    foodId: foodItem.id,
                    restaurantId: restaurantId,
                });
            }
        } catch (error) {
            console.error('[useRestaurantCart] Error:', error.message);

            // On mobile: each restaurant has its own bubble cart
            // Backend auto-clears old cart when adding from different restaurant
            // So no error handling needed - just show generic error
            showToast('error', 'Failed to add item');
        }
    };

    const getTotalItems = () => {
        return localCart.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    return {
        localCart,
        setLocalCart,
        handleAddToCart,
        getTotalItems,
        bubbleAnimation,
        syncCartToStorage,
    };
};
