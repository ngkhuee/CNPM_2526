import { useState, useEffect } from "react";
import { orderService, authService } from "shared-services";

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
    const loadOrders = async () => {
      const user = await authService.getCurrentUser();

      if (!user || !user.restaurantId) {
        return; // Exit early if no user or restaurantId
      }

      let isActive = true; // Flag to prevent state updates after unmount

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
          console.error("Lỗi khi tải đơn hàng của nhà hàng:", err);
          setError(err.message || "Không thể tải đơn hàng");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }

      // Cleanup function
      return () => {
        isActive = false;
      };
    };

    loadOrders();
  }, []);

  // Refresh orders (can be called manually)
  const refreshOrders = async () => {
    const user = await authService.getCurrentUser();
    if (!user || !user.restaurantId) {
      return { success: false, message: "Không tìm thấy người dùng hoặc ID nhà hàng" };
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
      console.error("Lỗi khi làm mới đơn hàng:", err);
      setError(err.message || "Không thể làm mới đơn hàng");
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
      console.error("Lỗi khi thêm đơn hàng:", err);
      setError(err.message || "Không thể thêm đơn hàng");
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
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
      setError(err.message || "Không thể cập nhật trạng thái đơn hàng");
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
      console.error("Lỗi khi cập nhật trạng thái drone:", err);
      setError(err.message || "Không thể cập nhật trạng thái drone");
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
