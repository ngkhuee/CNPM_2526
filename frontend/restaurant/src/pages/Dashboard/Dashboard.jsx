// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import "./Dashboard.css";
import CardStats from "../../components/DashboardComponents/CardStats";
import LineChart from "../../components/DashboardComponents/LineChart";
import BarChart from "../../components/DashboardComponents/BarChart";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { OrderContext } from "../../Context/OrderContext";
import { authService } from "@api/services";
import { MdLocationOn, MdStar, MdPhone } from "react-icons/md";

const Dashboard = () => {
  const { currentRestaurant } = useContext(RestaurantContext);
  const { orders } = useContext(OrderContext);

  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    revenue: 0,
    pendingOrders: 0,
  });

  const [chartData, setChartData] = useState([]);

  // Calculate stats from orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      const user = authService.getCurrentUser();

      // Filter orders for current restaurant
      const restaurantOrders = orders.filter(
        (order) => order.restaurantId === user?.restaurantId
      );

      const totalOrders = restaurantOrders.length;
      const completedOrders = restaurantOrders.filter(
        (o) => o.status === "delivered"
      ).length;
      const pendingOrders = restaurantOrders.filter((o) =>
        ["pending", "preparing"].includes(o.status)
      ).length;

      // Calculate revenue from completed orders
      const revenue = restaurantOrders
        .filter((o) => o.status === "delivered")
        .reduce((sum, order) => sum + (order.total || 0), 0);

      setStats({
        totalOrders,
        completedOrders,
        revenue,
        pendingOrders,
      });

      // Generate chart data (last 7 days)
      const last7Days = generateLast7DaysData(restaurantOrders);
      setChartData(last7Days);
    }
  }, [orders]);

  // Generate chart data for last 7 days
  const generateLast7DaysData = (orders) => {
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

    return last7Days;
  };

  return (
    <div className="main-content">
      <div className="dashboard-page">
        <h2>
          {currentRestaurant
            ? `${currentRestaurant.name} Dashboard`
            : "Restaurant Dashboard"}
        </h2>

        {currentRestaurant && (
          <div className="restaurant-info-summary">
            <p>
              <MdLocationOn /> {currentRestaurant.location?.address}
            </p>
            <p>
              <MdStar /> Rating: {currentRestaurant.rating} (
              {currentRestaurant.reviewCount} reviews)
            </p>
            <p>
              <MdPhone /> {currentRestaurant.ownerPhone}
            </p>
          </div>
        )}

        {/* Card thống kê */}
        <div className="cards-container">
          <CardStats title="Total Orders" value={stats.totalOrders} />
          <CardStats title="Completed" value={stats.completedOrders} />
          <CardStats title="Pending" value={stats.pendingOrders} />
          <CardStats
            title="Revenue"
            value={new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(stats.revenue)}
          />
        </div>

        {/* Biểu đồ */}
        <div className="charts-container">
          <div className="chart-item">
            <h3>Revenue Over Time (Last 7 Days)</h3>
            {chartData.length > 0 ? (
              <LineChart data={chartData} />
            ) : (
              <p>No data available</p>
            )}
          </div>
          <div className="chart-item">
            <h3>Orders Over Time (Last 7 Days)</h3>
            {chartData.length > 0 ? (
              <BarChart data={chartData} />
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
