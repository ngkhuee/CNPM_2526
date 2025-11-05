import React, { createContext, useState, useEffect } from "react";
import { restaurantService, orderService } from "@api/services";

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fetch restaurants from API
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const restaurants = await restaurantService.getAll();
      setPartners(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders for a specific restaurant
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

  // Add order
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

  return (
    <RestaurantContext.Provider
      value={{
        partners,
        setPartners,
        orders,
        addOrder,
        updateOrderStatus,
        updateDroneStatus,
        fetchRestaurants,
        fetchRestaurantOrders,
        loading,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export default RestaurantProvider;
