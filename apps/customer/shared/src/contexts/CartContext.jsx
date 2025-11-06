// CartContext - Cart state riêng, sử dụng useCart hook
import React, { createContext, useContext } from "react";
import { useCart } from "../hooks/useCart";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const cart = useCart(user);

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};

export default CartProvider;
