// src/Context/OrderContext.js
import React, { createContext, useState, useEffect } from "react";
import { orderService } from "@api/services";
import { authService } from "@api/services";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch restaurant orders on mount (requires restaurantId from user)
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.restaurantId) {
      fetchRestaurantOrders(user.restaurantId);
    }
  }, []);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.restaurantId) {
      const interval = setInterval(() => {
        fetchRestaurantOrders(user.restaurantId);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  // Fetch orders for specific restaurant
  const fetchRestaurantOrders = async (restaurantId) => {
    try {
      setLoading(true);
      const restaurantOrders = await orderService.getByRestaurant(restaurantId);
      setOrders(restaurantOrders);
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
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
