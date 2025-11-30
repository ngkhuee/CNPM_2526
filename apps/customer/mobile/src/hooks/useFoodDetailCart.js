import { useState, useEffect, useRef, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toastHelper';
import { createBubbleAnimation } from '../utils/animationHelpers';

/**
 * useFoodDetailCart - Hook to manage cart operations in FoodDetailScreen
 * Handles: local cart state, AsyncStorage sync, add to cart, quantity management
 * 
 * @param {Object} foodItem - Food item object
 * @param {Object} pendingLocalCart - Cart from navigation context
 * @param {Object} cartContext - CartContext object
 * @returns {Object} Cart state and handlers
 */
export const useFoodDetailCart = (foodItem, pendingLocalCart, cartContext) => {
    // Local cart state - specific to this restaurant
    const [localCart, setLocalCart] = useState(pendingLocalCart || {
        items: [],
        restaurant_id: foodItem?.restaurant_id,
        restaurant_name: null,
        total: 0,
    });

    // UI state
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    // Animation
    const bubbleAnimation = useRef(createBubbleAnimation());

    // Keep track of latest localCart for cleanup
    const localCartRef = useRef(localCart);

    /**
     * Restore cart from AsyncStorage if pendingLocalCart not provided
     */
    useEffect(() => {
        const restoreCartFromStorage = async () => {
            if (pendingLocalCart && pendingLocalCart.items && pendingLocalCart.items.length > 0) {
                console.log('[useFoodDetailCart] Using pendingLocalCart:', pendingLocalCart);
                return;
            }

            const restaurantId = foodItem?.restaurant_id;
            if (restaurantId) {
                try {
                    const cartJson = await AsyncStorage.getItem(`cart_restaurant_${restaurantId}`);
                    if (cartJson) {
                        const savedCart = JSON.parse(cartJson);
                        console.log('[useFoodDetailCart] Restored cart from AsyncStorage:', restaurantId);
                        setLocalCart(savedCart);
                    }
                } catch (err) {
                    console.error('[useFoodDetailCart] Error restoring cart:', err.message);
                }
            }
        };

        restoreCartFromStorage();
    }, [foodItem?.restaurant_id, pendingLocalCart]);

    /**
     * Sync local cart to global cart when screen mounts
     */
    useEffect(() => {
        const syncCartToGlobal = async () => {
            if (localCart && localCart.items && localCart.items.length > 0) {
                const restaurantId = localCart.restaurant_id || foodItem?.restaurant_id;
                if (restaurantId) {
                    try {
                        if (cartContext?.syncLocalCartToGlobal) {
                            await cartContext.syncLocalCartToGlobal(localCart, false);
                            console.log('[useFoodDetailCart] Synced local cart to global on mount:', restaurantId);
                        }
                        if (cartContext?.setLastActive) {
                            await cartContext.setLastActive(restaurantId);
                        }
                    } catch (error) {
                        console.error('[useFoodDetailCart] Error syncing cart on mount:', error.message);
                    }
                }
            }
        };

        syncCartToGlobal();
    }, [foodItem?.restaurant_id]);

    // Keep track of latest localCart for cleanup
    useEffect(() => {
        localCartRef.current = localCart;
    }, [localCart]);

    /**
     * Save cart to AsyncStorage when component unmounts
     */
    useEffect(() => {
        return () => {
            if (localCartRef.current && localCartRef.current.items && localCartRef.current.items.length > 0) {
                const restaurantId = localCartRef.current.restaurant_id || foodItem?.restaurant_id;
                if (restaurantId) {
                    AsyncStorage.setItem(`cart_restaurant_${restaurantId}`, JSON.stringify(localCartRef.current));
                    console.log('[useFoodDetailCart] Saved cart on unmount:', restaurantId, 'items:', localCartRef.current.items.length);
                }
            }
        };
    }, []);

    /**
     * Get total items in local cart
     */
    const getTotalItems = () => {
        return localCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    };

    /**
     * Handle add to cart
     */
    const handleAddToCart = async (selectedRestaurant, onSwitchRestaurant) => {
        try {
            setIsAdding(true);

            const restaurantId = foodItem.restaurant_id;
            const currentRestaurantId = cartContext.cart?.restaurant_id;

            // Check if can add from this restaurant
            const canAdd = await cartContext.canAddFromRestaurant(restaurantId);
            if (!canAdd) {
                // Show switch restaurant confirmation
                const currentRestaurantName = await cartContext.getCurrentRestaurantName();
                onSwitchRestaurant(currentRestaurantName, selectedRestaurant?.name);
                return;
            }

            // Add item to cart via CartContext (API call)
            const result = await cartContext.addItem(foodItem.id, quantity, '');
            if (result) {
                // Update local cart state
                const updatedLocalCart = {
                    ...localCart,
                    restaurant_id: restaurantId,
                    restaurant_name: selectedRestaurant?.name,
                    items: [...(localCart.items || []), {
                        ...foodItem,
                        quantity,
                        food_id: foodItem.id,
                        item_id: result.item_id || `${foodItem.id}_${Date.now()}`,
                    }],
                };
                setLocalCart(updatedLocalCart);

                // Save to AsyncStorage
                await AsyncStorage.setItem(`cart_restaurant_${restaurantId}`, JSON.stringify(updatedLocalCart));

                // Trigger bubble animation
                if (bubbleAnimation.current) {
                    bubbleAnimation.current.start();
                }

                showToast('success', `Đã thêm ${quantity} ${foodItem.name} vào giỏ`);
                setQuantity(1);
            }
        } catch (error) {
            console.error('[useFoodDetailCart] Error adding to cart:', error);
            showToast('error', 'Không thể thêm vào giỏ hàng');
        } finally {
            setIsAdding(false);
        }
    };

    /**
     * Handle clear and switch restaurant
     */
    const handleClearAndSwitch = async (selectedRestaurant) => {
        try {
            // Clear current cart
            await cartContext.clearCart();

            // Reset local cart
            const newCart = {
                items: [],
                restaurant_id: foodItem.restaurant_id,
                restaurant_name: selectedRestaurant?.name,
                total: 0,
            };
            setLocalCart(newCart);

            // Add current item to new cart
            await handleAddToCart(selectedRestaurant, () => { });
        } catch (error) {
            console.error('[useFoodDetailCart] Error clearing and switching:', error);
            showToast('error', 'Không thể chuyển nhà hàng');
        }
    };

    return {
        // State
        localCart,
        quantity,
        isAdding,
        bubbleAnimation,

        // Setters
        setLocalCart,
        setQuantity,

        // Handlers
        handleAddToCart,
        handleClearAndSwitch,
        getTotalItems,
    };
};
