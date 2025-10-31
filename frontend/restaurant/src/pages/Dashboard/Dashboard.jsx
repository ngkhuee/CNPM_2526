// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import CardStats from "../../components/DashboardComponents/CardStats";
import LineChart from "../../components/DashboardComponents/LineChart";
import BarChart from "../../components/DashboardComponents/BarChart";

const Dashboard = () => {
  // Mock data
  const [stats, setStats] = useState({
    users: 120,
    orders: 75,
    revenue: 5400,
  });

  const [chartData, setChartData] = useState([
    { date: "2025-10-10", revenue: 500, orders: 10 },
    { date: "2025-10-11", revenue: 600, orders: 12 },
    { date: "2025-10-12", revenue: 800, orders: 15 },
    { date: "2025-10-13", revenue: 900, orders: 20 },
    { date: "2025-10-14", revenue: 700, orders: 18 },
  ]);

  // Nếu muốn, bạn có thể fetch dữ liệu từ backend ở đây
  // useEffect(() => {
  //   fetch("/admin/stats")
  //     .then(res => res.json())
  //     .then(data => {
  //       setStats(data.stats);
  //       setChartData(data.chart);
  //     });
  // }, []);

  return (
  <div className="main-content">
    <div className="dashboard-page">
      <h2>Admin Dashboard</h2>

      {/* Card thống kê */}
      <div className="cards-container">
        <CardStats title="Users" value={stats.users} />
        <CardStats title="Orders" value={stats.orders} />
        <CardStats
          title="Revenue"
          value={new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(stats.revenue)}
        />
      </div>

      {/* Biểu đồ */}
      <div className="charts-container">
        <div className="chart-item">
          <h3>Revenue Over Time</h3>
          <LineChart data={chartData} />
        </div>
        <div className="chart-item">
          <h3>Orders Over Time</h3>
          <BarChart data={chartData} />
        </div>
      </div>
    </div>
  </div>
);

};

export default Dashboard;
