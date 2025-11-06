import React, { createContext, useState, useEffect, useCallback } from "react";
import { orderService, restaurantService, authService } from "shared-services";

export const SystemStatsContext = createContext();

export const SystemStatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeRestaurants: 0,
    totalRestaurants: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenueOverTime: [],
    ordersOverTime: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [allOrders, allRestaurants, allUsers] = await Promise.all([
        orderService.getAll(),
        restaurantService.getAll(),
        authService.getAllUsers
          ? authService.getAllUsers()
          : Promise.resolve([]),
      ]);

      // Calculate statistics
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders
        .filter((o) => o.status === "delivered")
        .reduce(
          (sum, order) =>
            sum + (order.total_amount || order.total || order.amount || 0),
          0
        );

      const pendingOrders = allOrders.filter((o) =>
        ["pending", "preparing", "ready"].includes(o.status)
      ).length;

      const completedOrders = allOrders.filter(
        (o) => o.status === "delivered"
      ).length;

      const activeRestaurants = allRestaurants.filter(
        (r) => r.isActive !== false
      ).length;

      // Generate chart data for last 7 days
      const last7Days = generateLast7DaysData(allOrders);

      setStats({
        totalUsers: allUsers.length,
        totalOrders,
        totalRevenue,
        activeRestaurants,
        totalRestaurants: allRestaurants.length,
        pendingOrders,
        completedOrders,
        revenueOverTime: last7Days,
        ordersOverTime: last7Days,
      });
    } catch (err) {
      console.error("Error fetching system stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate chart data for last 7 days
  const generateLast7DaysData = (orders) => {
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = orders.filter((order) => {
        // Handle both createdAt and created_at fields from db.json
        const orderDateStr = order.created_at || order.createdAt;
        if (!orderDateStr) return false;

        try {
          const orderDate = new Date(orderDateStr);
          if (isNaN(orderDate.getTime())) return false; // Invalid date
          return orderDate.toISOString().split("T")[0] === dateStr;
        } catch (e) {
          return false;
        }
      });

      const dayRevenue = dayOrders
        .filter((o) => o.status === "delivered")
        .reduce(
          (sum, order) =>
            sum + (order.total_amount || order.total || order.amount || 0),
          0
        );

      last7Days.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    return last7Days;
  };

  // Fetch on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const contextValue = {
    stats,
    loading,
    error,
    fetchStats,
  };

  return React.createElement(
    SystemStatsContext.Provider,
    { value: contextValue },
    children
  );
};
