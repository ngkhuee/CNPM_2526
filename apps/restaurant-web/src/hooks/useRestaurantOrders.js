import { useState, useEffect } from "react";
import { orderService, authService } from "@api/services";

/**
 * Custom hook for managing restaurant orders
 * Fetches orders for current restaurant and provides CRUD operations
 */
export const useRestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch restaurant orders on mount
  useEffect(() => {
    const user = authService.getCurrentUser();

    if (!user || !user.restaurantId) {
      return; // Exit early if no user or restaurantId
    }

    let isActive = true; // Flag to prevent state updates after unmount

    const fetchOrders = async () => {
      if (!isActive) return;

      try {
        setLoading(true);
        setError(null);
        const restaurantOrders = await orderService.getByRestaurant(
          user.restaurantId
        );
        if (isActive) {
          setOrders(restaurantOrders);
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching restaurant orders:", err);
          setError(err.message || "Failed to fetch orders");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    // Cleanup function
    return () => {
      isActive = false;
    };
  }, []);

  // Refresh orders (can be called manually)
  const refreshOrders = async () => {
    const user = authService.getCurrentUser();
    if (!user || !user.restaurantId) {
      return { success: false, message: "No user or restaurantId found" };
    }

    try {
      setLoading(true);
      setError(null);
      const restaurantOrders = await orderService.getByRestaurant(
        user.restaurantId
      );
      setOrders(restaurantOrders);
      return { success: true, orders: restaurantOrders };
    } catch (err) {
      console.error("Error refreshing restaurant orders:", err);
      setError(err.message || "Failed to refresh orders");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add new order
  const addOrder = async (orderData) => {
    try {
      setLoading(true);
      const newOrder = await orderService.create(orderData);
      setOrders((prev) => [...prev, newOrder]);
      return { success: true, order: newOrder };
    } catch (err) {
      console.error("Error adding order:", err);
      setError(err.message || "Failed to add order");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      await orderService.updateStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      return { success: true };
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.message || "Failed to update order status");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update drone status
  const updateDroneStatus = async (orderId, droneStatus) => {
    try {
      setLoading(true);
      await orderService.update(orderId, { droneStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, droneStatus } : o))
      );
      return { success: true };
    } catch (err) {
      console.error("Error updating drone status:", err);
      setError(err.message || "Failed to update drone status");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    refreshOrders,
    addOrder,
    updateOrderStatus,
    updateDroneStatus,
  };
};
