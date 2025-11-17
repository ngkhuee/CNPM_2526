// CartContext - Cart state riêng, sử dụng useCart hook
import React, { createContext, useContext, useMemo, useState } from "react";
import { useCart } from "../hooks/useCart";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const cartHook = useCart();
  const [appliedPromotion, setAppliedPromotion] = useState(null);

  // Add helper function to calculate total (for backward compatibility)
  const getTotalCartAmount = useMemo(() => {
    return () => {
      if (!cartHook.cart?.items || cartHook.cart.items.length === 0) return 0;
      return cartHook.cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };
  }, [cartHook.cart?.items]);

  // Merge hook with helper functions
  const value = {
    ...cartHook,
    getTotalCartAmount,
    appliedPromotion,
    setAppliedPromotion,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
