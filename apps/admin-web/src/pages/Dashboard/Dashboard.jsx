import React, { useContext } from "react";
import "./Dashboard.css";
import { CardStats, LineChart, BarChart } from "shared-ui";
import { SystemStatsContext } from "../../Context/SystemStatsContext";
import { formatCurrency } from "shared-utils";

const Dashboard = () => {
  const { stats, loading, error, fetchStats } = useContext(SystemStatsContext);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h2>Admin Dashboard</h2>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h2>Admin Dashboard</h2>
        <p className="error">Error loading stats: {error}</p>
        <button onClick={fetchStats}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Admin Dashboard - System Overview</h2>
        <button
          onClick={fetchStats}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Refresh Stats
        </button>
      </div>

      {/* Card thống kê */}
      <div className="cards-container">
        <CardStats
          title="Total Users"
          value={stats.totalUsers}
          color="primary"
        />
        <CardStats
          title="Active Restaurants"
          value={`${stats.activeRestaurants} / ${stats.totalRestaurants}`}
          color="success"
        />
        <CardStats
          title="Total Orders"
          value={stats.totalOrders}
          color="warning"
        />
        <CardStats
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="success"
        />
      </div>

      <div className="cards-container" style={{ marginTop: "20px" }}>
        <CardStats
          title="Pending Orders"
          value={stats.pendingOrders}
          color="warning"
        />
        <CardStats
          title="Completed Orders"
          value={stats.completedOrders}
          color="success"
        />
      </div>

      {/* Biểu đồ */}
      <div className="charts-container">
        <div className="chart-item">
          <h3>Revenue Over Time (Last 7 Days)</h3>
          {stats.revenueOverTime.length > 0 ? (
            <LineChart data={stats.revenueOverTime} dataKey="revenue" />
          ) : (
            <p>No data available</p>
          )}
        </div>
        <div className="chart-item">
          <h3>Orders Over Time (Last 7 Days)</h3>
          {stats.ordersOverTime.length > 0 ? (
            <BarChart data={stats.ordersOverTime} dataKey="orders" />
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
