// useCart hook - Cart logic tách riêng để web và mobile dùng chung
import { useState, useEffect, useCallback } from "react";
import { cartService } from "shared-services";

export const useCart = (user) => {
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(false);

  // Load cart from API when user changes
  useEffect(() => {
    if (user?.id) {
      loadCart(user.id);
    } else {
      setCartItems({});
    }
  }, [user?.id]);

  // Load cart from API
  const loadCart = async (userId) => {
    try {
      setLoading(true);
      const cart = await cartService.getByUser(userId);
      const cartObj = {};
      cart.items.forEach((item) => {
        cartObj[item.foodId] = item.quantity;
      });
      setCartItems(cartObj);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add to cart with API sync
  const addToCart = useCallback(
    async (itemId, qty = 1) => {
      if (!user) {
        alert("Please login to add items to cart");
        return;
      }

      try {
        // Optimistic update
        setCartItems((prev) => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + qty,
        }));

        // Sync with backend
        await cartService.addItem(user.id, itemId, qty);
      } catch (error) {
        console.error("Error adding to cart:", error);
        // Rollback on error
        setCartItems((prev) => {
          const newCart = { ...prev };
          if (newCart[itemId] === qty) {
            delete newCart[itemId];
          } else {
            newCart[itemId] -= qty;
          }
          return newCart;
        });
      }
    },
    [user]
  );

  // Remove from cart with API sync
  const removeFromCart = useCallback(
    async (itemId) => {
      if (!user) return;

      try {
        const newQuantity = cartItems[itemId] - 1;

        // Optimistic update
        setCartItems((prev) => {
          const newCart = { ...prev };
          if (newQuantity <= 0) {
            delete newCart[itemId];
          } else {
            newCart[itemId] = newQuantity;
          }
          return newCart;
        });

        // Sync with backend
        if (newQuantity <= 0) {
          await cartService.removeItem(user.id, itemId);
        } else {
          await cartService.addItem(user.id, itemId, -1);
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    },
    [user, cartItems]
  );

  // Clear cart after checkout
  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      await cartService.clear(user.id);
      setCartItems({});
      console.log("✅ Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [user]);

  // Get cart count
  const getCartCount = useCallback(() => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  }, [cartItems]);

  // Calculate total amount (requires food_list from another hook/context)
  const getTotalCartAmount = useCallback(
    (food_list) => {
      let totalAmount = 0;
      for (const item in cartItems) {
        if (cartItems[item] > 0) {
          let itemInfo = food_list.find(
            (product) =>
              String(product.id) === String(item) ||
              String(product._id) === String(item)
          );
          if (itemInfo) {
            totalAmount += itemInfo.price * cartItems[item];
          }
        }
      }
      return totalAmount;
    },
    [cartItems]
  );

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    getCartCount,
    getTotalCartAmount,
    setCartItems, // For manual updates if needed
  };
};
