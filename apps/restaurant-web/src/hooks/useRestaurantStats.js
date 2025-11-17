import { useMemo, useContext } from "react";
import { OrderContext } from "../Context/OrderContext";
import { AuthContext } from "../Context/AuthContext";

export const useRestaurantStats = () => {
  const { orders } = useContext(OrderContext);
  const { currentUser } = useContext(AuthContext);

  const stats = useMemo(() => {
    console.log("useRestaurantStats - currentUser:", currentUser);
    console.log("useRestaurantStats - orders count:", orders?.length);

    if (!currentUser?.restaurantId) {
      console.warn("Missing restaurantId:", currentUser?.restaurantId);
      return {
        totalOrders: 0,
        completedOrders: 0,
        revenue: 0,
        pendingOrders: 0,
        chartData: [],
      };
    }

    if (!orders || orders.length === 0) {
      console.warn("⚠️ No orders yet - orders count:", orders?.length);
      return {
        totalOrders: 0,
        completedOrders: 0,
        revenue: 0,
        pendingOrders: 0,
        chartData: [],
      };
    }

    // Filter orders for current restaurant
    const restaurantOrders = orders.filter(
      (order) => order.restaurant_id === currentUser.restaurantId
    );

    console.log("Restaurant orders filtered:", restaurantOrders.length, "for restaurantId:", currentUser.restaurantId);

    const totalOrders = restaurantOrders.length;
    const completedOrders = restaurantOrders.filter(
      (o) => o.status === "delivered"
    ).length;
    const pendingOrders = restaurantOrders.filter((o) =>
      ["pending", "preparing"].includes(o.status)
    ).length;

    // Calculate revenue from completed orders (use snake_case from db.json)
    const revenue = restaurantOrders
      .filter((o) => o.status === "delivered")
      .reduce(
        (sum, order) => sum + (order.total_amount || order.totalAmount || 0),
        0
      );

    // Generate chart data (last 7 days)
    const last7Days = generateLast7DaysData(restaurantOrders);

    return {
      totalOrders,
      completedOrders,
      revenue,
      pendingOrders,
      chartData: last7Days,
    };
  }, [orders, currentUser]);

  return stats;
};

// Helper function to generate chart data for last 7 days
const generateLast7DaysData = (orders) => {
  const today = new Date();
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayOrders = orders.filter((order) => {
      // Handle both created_at and createdAt
      const orderDateStr = order.created_at || order.createdAt;
      if (!orderDateStr) return false;
      const orderDate = new Date(orderDateStr).toISOString().split("T")[0];
      return orderDate === dateStr;
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
