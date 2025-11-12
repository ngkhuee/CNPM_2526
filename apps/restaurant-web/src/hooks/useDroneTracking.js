import { useState, useEffect } from "react";
import { droneService, orderService, authService } from "shared-services";

/**
 * Custom hook for tracking drones and delivery orders
 * Fetches drones and filters orders for current restaurant with delivery locations
 */
export const useDroneTracking = () => {
  const [drones, setDrones] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch drones and orders
  const fetchData = async () => {
    const user = authService.getCurrentUser();
    if (!user || !user.restaurantId) {
      console.warn("No user or restaurantId found for drone tracking");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch drones and restaurant orders in parallel
      const [dronesData, restaurantOrders] = await Promise.all([
        droneService.getAllDrones(),
        orderService.getByRestaurant(user.restaurantId),
      ]);

      // Filter orders with delivery locations
      const ordersWithLocations = restaurantOrders.filter(
        (order) => order.deliveryLocation?.lat && order.deliveryLocation?.lng
      );

      setDrones(dronesData);
      setOrders(ordersWithLocations);
    } catch (err) {
      console.error("Error fetching drone tracking data:", err);
      setError(err.message || "Failed to fetch tracking data");

      // Set fallback data on error
      setDrones([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get drones by status
  const getDronesByStatus = (status) => {
    return drones.filter((drone) => drone.status === status);
  };

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter((order) => order.status === status);
  };

  // Update drone location
  const updateDroneLocation = async (droneId, location) => {
    try {
      await droneService.updateDroneLocation(droneId, location);
      setDrones((prev) =>
        prev.map((d) => (d.id === droneId ? { ...d, location } : d))
      );
      return { success: true };
    } catch (err) {
      console.error("Error updating drone location:", err);
      return { success: false, message: err.message };
    }
  };

  return {
    drones,
    orders,
    loading,
    error,
    refreshData: fetchData,
    getDronesByStatus,
    getOrdersByStatus,
    updateDroneLocation,
  };
};
