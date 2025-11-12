import React, { createContext, useState, useEffect, useContext } from "react";
import { orderService } from "shared-services";
import { AuthContext } from "./AuthContext";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user orders when user changes (no auto-refresh)
  useEffect(() => {
    if (user) {
      // Check if token exists before fetching
      const token = localStorage.getItem("token");
      if (token) {
        fetchUserOrders();
      }
    } else {
      setOrders([]);
    }
  }, [user]);

  // Fetch user orders from API
  const fetchUserOrders = async () => {
    if (!user) return;

    // Double check token exists
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, skipping order fetch");
      return;
    }

    try {
      setLoading(true);
      const userOrders = await orderService.getByUser(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // If 401, clear orders
      if (error.message.includes("token")) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new order
  const addOrder = async (orderData) => {
    if (!user) {
      console.error("❌ No user found in OrderContext");
      return {
        success: false,
        message: "User must be logged in to create order",
      };
    }

    try {
      setLoading(true);
      console.log("📤 OrderContext: Creating order with data:", orderData);
      console.log("👤 Current user:", user);

      const newOrder = await orderService.create({
        ...orderData,
        customerId: user.id,
        status: "pending",
      });

      console.log("✅ OrderContext: Order created successfully:", newOrder);

      // Update local state
      setOrders((prev) => [newOrder, ...prev]);

      return { success: true, order: newOrder };
    } catch (error) {
      console.error("❌ OrderContext: Error creating order:", error);
      return {
        success: false,
        message: error.message || "Unknown error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (id, status) => {
    try {
      const updatedOrder = await orderService.updateStatus(id, status);

      // Update local state
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );

      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, message: error.message };
    }
  };

  // Cancel order
  const cancelOrder = async (id) => {
    try {
      await orderService.cancel(id);

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        fetchUserOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
