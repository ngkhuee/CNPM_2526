import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocalCart = (initialRestaurantId = null) => {
    const [localCart, setLocalCart] = useState({
        items: [],
        restaurant_id: initialRestaurantId,
        restaurant_name: null,
        total: 0,
    });

    /**
     * Restore cart from AsyncStorage when component mounts
     */
    useEffect(() => {
        const restoreCart = async () => {
            if (!initialRestaurantId) return;

            try {
                const cartJson = await AsyncStorage.getItem(`cart_restaurant_${initialRestaurantId}`);
                if (cartJson) {
                    const savedCart = JSON.parse(cartJson);
                    console.log(`[useLocalCart] Restored cart for restaurant ${initialRestaurantId}:`, savedCart);
                    setLocalCart(savedCart);
                } else {
                    console.log(`[useLocalCart] No saved cart for restaurant ${initialRestaurantId}`);
                }
            } catch (err) {
                console.error(`[useLocalCart] Error restoring cart:`, err.message);
            }
        };

        restoreCart();
    }, [initialRestaurantId]);

    const addItem = useCallback((item) => {
        setLocalCart(prevCart => {
            const existingItemIndex = prevCart.items.findIndex(
                i => i.menu_id === item.menu_id || i.id === item.id
            );

            let updatedItems;
            if (existingItemIndex >= 0) {
                updatedItems = [...prevCart.items];
                updatedItems[existingItemIndex].quantity += item.quantity;
            } else {
                updatedItems = [...prevCart.items, item];
            }

            const newTotal = updatedItems.reduce(
                (sum, i) => sum + (i.price * i.quantity),
                0
            );

            return {
                ...prevCart,
                items: updatedItems,
                total: newTotal,
            };
        });
    }, []);

    const updateItem = useCallback((itemId, quantity) => {
        setLocalCart(prevCart => {
            if (quantity <= 0) {
                return removeItem(itemId);
            }

            const updatedItems = prevCart.items.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            );

            const newTotal = updatedItems.reduce(
                (sum, i) => sum + (i.price * i.quantity),
                0
            );

            return {
                ...prevCart,
                items: updatedItems,
                total: newTotal,
            };
        });
    }, []);

    const removeItem = useCallback((itemId) => {
        setLocalCart(prevCart => {
            const updatedItems = prevCart.items.filter(item => item.id !== itemId);
            const newTotal = updatedItems.reduce(
                (sum, i) => sum + (i.price * i.quantity),
                0
            );

            return {
                ...prevCart,
                items: updatedItems,
                total: newTotal,
            };
        });
    }, []);

    const clearCart = useCallback(() => {
        setLocalCart({
            items: [],
            restaurant_id: null,
            restaurant_name: null,
            total: 0,
        });
    }, []);

    const getTotalItems = useCallback(() => {
        return localCart.items.reduce((sum, item) => sum + item.quantity, 0);
    }, [localCart.items]);

    return {
        localCart,
        setLocalCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        getTotalItems,
    };
};
