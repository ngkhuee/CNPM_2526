// src/Context/OrderContext.js
import React, { createContext, useState, useEffect } from "react";
import { orderService } from "@api/services";
import { authService } from "@api/services";

export const OrderContext = createContext();

export const OrderProvider = ({
  children,
  autoRefresh = false, // TẮT auto-refresh, chỉ fetch thủ công
  refreshInterval = 30000,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch restaurant orders on mount and auto-refresh every 30 seconds
  useEffect(() => {
    const user = authService.getCurrentUser();

    if (!user || !user.restaurantId) {
      return; // Exit early if no user or restaurantId
    }

    let isActive = true; // Flag to prevent state updates after unmount

    // Fetch wrapper with isActive check
    const safeFetch = async (restaurantId) => {
      if (!isActive) return;

      try {
        setLoading(true);
        const restaurantOrders = await orderService.getByRestaurant(
          restaurantId
        );
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

    // Initial fetch
    safeFetch(user.restaurantId);

    // Setup interval for auto-refresh (only if autoRefresh is enabled)
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        safeFetch(user.restaurantId);
      }, refreshInterval);
      console.log(
        `OrderContext: Auto-refresh enabled (every ${refreshInterval / 1000}s)`
      );
    }

    // Cleanup function
    return () => {
      isActive = false; // Prevent state updates
      if (interval) {
        clearInterval(interval); // Clear interval
        console.log("🧹 OrderContext: Cleanup - interval cleared");
      }
    };
  }, [autoRefresh, refreshInterval]); // Add dependencies

  // Fetch orders for specific restaurant (can be called manually)
  const fetchRestaurantOrders = async (restaurantId) => {
    try {
      setLoading(true);
      const restaurantOrders = await orderService.getByRestaurant(restaurantId);
      setOrders(restaurantOrders);
      return { success: true, orders: restaurantOrders };
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Add new order
  const addOrder = async (orderData) => {
    try {
      const newOrder = await orderService.create(orderData);
      setOrders((prev) => [...prev, newOrder]);
      return { success: true, order: newOrder };
    } catch (error) {
      console.error("Error adding order:", error);
      return { success: false, message: error.message };
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Update drone status
  const updateDroneStatus = async (orderId, droneStatus) => {
    try {
      await orderService.update(orderId, { droneStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, droneStatus } : o))
      );
    } catch (error) {
      console.error("Error updating drone status:", error);
    }
  };

  // Dùng React.createElement thay cho JSX
  return React.createElement(
    OrderContext.Provider,
    {
      value: {
        orders,
        setOrders,
        updateOrderStatus,
        updateDroneStatus,
        addOrder,
        fetchRestaurantOrders,
        loading,
      },
    },
    children
  );
};
