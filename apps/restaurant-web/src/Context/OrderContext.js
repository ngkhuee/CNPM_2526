// src/Context/OrderContext.js
import React, { createContext, useState, useEffect } from "react";
import { orderService, authService } from "shared-services";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch restaurant orders on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user?.restaurantId) {
      return;
    }

    let isActive = true;

    const fetchOrders = async () => {
      if (!isActive) return;
      try {
        setLoading(true);
        const restaurantOrders = await orderService.getByRestaurant(user.restaurantId);
        if (isActive) {
          setOrders(restaurantOrders);
        }
      } catch (error) {
        if (isActive) {
          console.error("Error fetching restaurant orders:", error);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const contextValue = {
    orders,
    setOrders,
    loading,
  };

  return React.createElement(
    OrderContext.Provider,
    { value: contextValue },
    children
  );
};
