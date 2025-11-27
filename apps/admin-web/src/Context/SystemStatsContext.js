import React, { createContext, useState, useEffect, useCallback } from "react";
import { orderService, restaurantService, authService } from "shared-services";
import {
  calculateRevenueByRestaurant,
  generateLast7DaysData,
} from "../utils/statsHelpers";

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
    revenueByRestaurant: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel - includeAll for admin to see all restaurants
      const [allOrders, allRestaurants, allUsers] = await Promise.all([
        orderService.getAll(),
        restaurantService.getAll({}, true), // includeAll=true for admin
        authService.getAllUsers
          ? authService.getAllUsers()
          : Promise.resolve([]),
      ]);

      // Calculate statistics
      const totalOrders = allOrders.length;

      // Filter delivered orders
      const deliveredOrders = allOrders.filter((o) => o.status === "delivered");

      // Filter only ACTIVE restaurants
      const activeRestaurantsList = allRestaurants.filter(
        (r) => r.status === "active"
      );
      const activeRestaurantIds = activeRestaurantsList.map((r) => r.id);

      // Filter delivered orders from ACTIVE restaurants only
      const deliveredOrdersFromActiveRestaurants = deliveredOrders.filter(
        (order) => {
          const restaurantId = order.restaurantId || order.restaurant_id;
          return activeRestaurantIds.includes(restaurantId);
        }
      );

      // Calculate total revenue (only from active restaurants)
      const totalRevenue = deliveredOrdersFromActiveRestaurants.reduce(
        (sum, order) => {
          const amount =
            order.totalAmount ||
            order.total_amount ||
            order.total ||
            order.amount ||
            0;
          return sum + amount;
        },
        0
      );

      const pendingOrders = allOrders.filter((o) =>
        ["pending", "preparing", "ready"].includes(o.status)
      ).length;

      const completedOrders = deliveredOrders.length;
      const activeRestaurants = activeRestaurantsList.length;

      // Generate chart data for last 7 days (only from active restaurants)
      const last7Days = generateLast7DaysData(allOrders, activeRestaurantsList);

      // Calculate revenue by restaurant (only active restaurants)
      const revenueByRestaurant = calculateRevenueByRestaurant(
        deliveredOrders,
        activeRestaurantsList
      );

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
        revenueByRestaurant,
      });
    } catch (err) {
      console.error("Error fetching system stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
