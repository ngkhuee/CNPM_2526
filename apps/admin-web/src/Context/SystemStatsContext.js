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
    revenueByRestaurant: [],
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

      console.log("Admin Stats Debug:");
      console.log("Total orders fetched:", allOrders.length);
      console.log("Sample order:", allOrders[0]);

      // Calculate statistics
      const totalOrders = allOrders.length;

      // Filter delivered orders first
      const deliveredOrders = allOrders.filter((o) => o.status === "delivered");
      console.log("Delivered orders:", deliveredOrders.length);
      console.log("Delivered orders data:", deliveredOrders);

      // Filter only ACTIVE restaurants first
      const activeRestaurantIds = allRestaurants
        .filter((r) => r.status === "active")
        .map((r) => r.id);

      // Filter delivered orders from ACTIVE restaurants only
      const deliveredOrdersFromActiveRestaurants = deliveredOrders.filter(
        (order) => {
          const restaurantId = order.restaurantId || order.restaurant_id;
          return activeRestaurantIds.includes(restaurantId);
        }
      );

      console.log(
        `📦 Delivered orders from active restaurants: ${deliveredOrdersFromActiveRestaurants.length} / ${deliveredOrders.length} total`
      );

      // Calculate total revenue with detailed logging (only from active restaurants)
      const totalRevenue = deliveredOrdersFromActiveRestaurants.reduce(
        (sum, order) => {
          const amount =
            order.totalAmount ||
            order.total_amount ||
            order.total ||
            order.amount ||
            0;
          console.log(
            `Order ${order.id}: ${amount} (totalAmount: ${order.totalAmount}, total_amount: ${order.total_amount})`
          );
          return sum + amount;
        },
        0
      );

      console.log("💰 Total Revenue:", totalRevenue);

      const pendingOrders = allOrders.filter((o) =>
        ["pending", "preparing", "ready"].includes(o.status)
      ).length;

      const completedOrders = deliveredOrders.length;

      // Filter only ACTIVE restaurants
      const activeRestaurantsList = allRestaurants.filter(
        (r) => r.status === "active"
      );
      const activeRestaurants = activeRestaurantsList.length;

      console.log(
        `🏪 Restaurants: ${activeRestaurants} active / ${allRestaurants.length} total`
      );

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
        revenueByRestaurant, // Add restaurant revenue breakdown
      });
    } catch (err) {
      console.error("Error fetching system stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate revenue by restaurant
  const calculateRevenueByRestaurant = (deliveredOrders, restaurants) => {
    const revenueMap = {};

    // Initialize all restaurants with 0 revenue
    restaurants.forEach((restaurant) => {
      revenueMap[restaurant.id] = {
        id: restaurant.id,
        name: restaurant.name,
        revenue: 0,
        orderCount: 0,
        image: restaurant.image,
      };
    });

    // Calculate revenue for each restaurant
    deliveredOrders.forEach((order) => {
      const restaurantId = order.restaurantId || order.restaurant_id;
      if (restaurantId && revenueMap[restaurantId]) {
        const amount = order.totalAmount || order.total_amount || 0;
        revenueMap[restaurantId].revenue += amount;
        revenueMap[restaurantId].orderCount += 1;
      }
    });

    // Convert to array and sort by revenue (highest first)
    return Object.values(revenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 restaurants
  };

  // Generate chart data for last 7 days (only from active restaurants)
  const generateLast7DaysData = (orders, activeRestaurants) => {
    const today = new Date();
    const last7Days = [];
    const activeRestaurantIds = activeRestaurants.map((r) => r.id);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = orders.filter((order) => {
        // Only include orders from ACTIVE restaurants
        const restaurantId = order.restaurantId || order.restaurant_id;
        if (!activeRestaurantIds.includes(restaurantId)) {
          return false;
        }

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
            sum +
            (order.total_amount ||
              order.totalAmount ||
              order.total ||
              order.amount ||
              0),
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
