import { useState, useEffect, useCallback } from "react";
import { droneService, orderService } from "shared-services";

/**
 * Hook for tracking drones and orders with delivery locations
 * Used in Admin Delivery Monitoring page
 */
export const useDroneTracking = () => {
  const [drones, setDrones] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all drones
      const dronesData = await droneService.getAllDrones();

      // Fetch all orders (admin can see all)
      const ordersData = await orderService.getAll();

      // Map drones with proper field names from db.json
      // Also check if assigned order is still active
      const mappedDrones = (dronesData || []).map((drone) => {
        const assignedOrder = ordersData.find(
          (order) => order.id === drone.assigned_order_id
        );

        // If order is delivered/cancelled, clear assignment
        const isOrderActive =
          assignedOrder &&
          !["delivered", "cancelled"].includes(assignedOrder.status);

        return {
          id: drone.id,
          name: drone.identifier,
          status: drone.status,
          latitude: drone.latitude,
          longitude: drone.longitude,
          assignedOrderId: isOrderActive ? drone.assigned_order_id : null,
          maxWeightKg: drone.max_weight_kg,
          currentLocation: drone.current_location,
          updated_at: drone.updated_at,
        };
      });
      setDrones(mappedDrones);

      // Map orders with proper field names
      const ordersWithLocation = (ordersData || []).map((order) => ({
        id: order.id,
        userId: order.user_id,
        restaurantId: order.restaurant_id,
        addressId: order.address_id,
        status: order.status,
        droneId: order.drone_id,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        deliveryLocation: order.address_id ? { lat: 10.77, lng: 106.68 } : null, // Mock location, should fetch from addresses
      }));

      setOrders(ordersWithLocation);
    } catch (err) {
      console.error("Error fetching delivery data:", err);
      setError(err.message);

      // Empty data on error
      setDrones([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh function for manual reload
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Get drones by status
  const getDronesByStatus = useCallback(
    (status) => {
      return drones.filter((drone) => drone.status === status);
    },
    [drones]
  );

  // Get orders by status
  const getOrdersByStatus = useCallback(
    (status) => {
      return orders.filter((order) => order.status === status);
    },
    [orders]
  );

  return {
    drones,
    orders,
    loading,
    error,
    refresh,
    getDronesByStatus,
    getOrdersByStatus,
  };
};
