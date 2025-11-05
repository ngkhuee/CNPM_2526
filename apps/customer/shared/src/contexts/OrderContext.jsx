import React, { createContext, useState, useEffect, useContext } from "react";
import { orderService } from "@api/services";
import { StoreContext } from "./StoreContext";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user orders when user changes + auto-polling every 5s
  useEffect(() => {
    if (user) {
      // Check if token exists before fetching
      const token = localStorage.getItem("token");
      if (token) {
        fetchUserOrders();

        // Setup polling interval for real-time updates
        const interval = setInterval(() => {
          fetchUserOrders();
        }, 5000); // Poll every 5 seconds

        console.log("OrderContext: Polling enabled (5s interval)");

        // Cleanup
        return () => {
          clearInterval(interval);
          console.log("OrderContext: Polling stopped");
        };
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
      throw new Error("User must be logged in to create order");
    }

    try {
      setLoading(true);
      const newOrder = await orderService.create({
        ...orderData,
        customerId: user.id,
        status: "pending",
      });

      // Update local state
      setOrders((prev) => [newOrder, ...prev]);

      return { success: true, order: newOrder };
    } catch (error) {
      console.error("Error creating order:", error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);

      // Update local state
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
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
