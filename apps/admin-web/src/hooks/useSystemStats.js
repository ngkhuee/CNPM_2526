import { useState, useEffect, useMemo } from "react";
import { orderService, restaurantService } from "shared-services";

/**
 * Hook for fetching and calculating system-wide statistics
 * Used in Admin Dashboard
 */
export const useSystemStats = () => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ordersData, restaurantsData] = await Promise.all([
          orderService.getAll(),
          restaurantService.getAll(),
        ]);

        setOrders(ordersData || []);
        setRestaurants(restaurantsData || []);
      } catch (err) {
        console.error("Error fetching system stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRestaurants = restaurants.length;

    const completedOrders = orders.filter(
      (o) => o.status === "delivered"
    ).length;
    const pendingOrders = orders.filter((o) =>
      ["pending", "preparing", "delivering"].includes(o.status)
    ).length;

    const totalRevenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // Revenue last 7 days
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === dateStr;
      });

      const dayRevenue = dayOrders
        .filter((o) => o.status === "delivered")
        .reduce((sum, order) => sum + (order.total || 0), 0);

      last7Days.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    return {
      totalOrders,
      totalRestaurants,
      completedOrders,
      pendingOrders,
      totalRevenue,
      chartData: last7Days,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }, [orders, restaurants]);

  // Refresh function for manual reload
  const refresh = async () => {
    try {
      setLoading(true);
      const [ordersData, restaurantsData] = await Promise.all([
        orderService.getAll(),
        restaurantService.getAll(),
      ]);
      setOrders(ordersData || []);
      setRestaurants(restaurantsData || []);
    } catch (err) {
      console.error("Error refreshing stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    orders,
    restaurants,
    loading,
    error,
    refresh,
  };
};
