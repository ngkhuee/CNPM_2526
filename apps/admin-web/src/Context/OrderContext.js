// src/Context/OrderContext.js
import React, { createContext, useState, useEffect } from "react";
import { orderService } from "shared-services";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all orders on mount (Admin sees all orders) - No auto-refresh
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await orderService.getAll();
      setOrders(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
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

  // Cancel order
  const cancelOrder = async (orderId) => {
    try {
      await orderService.cancel(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o))
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  return React.createElement(
    OrderContext.Provider,
    {
      value: {
        orders,
        setOrders,
        updateOrderStatus,
        addOrder,
        cancelOrder,
        fetchOrders,
        loading,
      },
    },
    children
  );
};
