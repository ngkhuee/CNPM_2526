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
          title="Total Restaurants"
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

      {/* Revenue by Restaurant Table */}
      <div className="restaurant-revenue-section" style={{ marginTop: "60px" }}>
        <h3 style={{ marginBottom: "30px" }}>Revenue by Restaurant (Top Performers)</h3>
        {stats.revenueByRestaurant && stats.revenueByRestaurant.length > 0 ? (
          <table
            className="revenue-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Rank
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Restaurant
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  Orders
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  Revenue
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  Avg Order
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.revenueByRestaurant.map((restaurant, index) => (
                <tr
                  key={restaurant.id}
                  style={{
                    borderBottom: "1px solid #e9ecef",
                    backgroundColor: index < 3 ? "#fff8e1" : "white",
                  }}
                >
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color:
                          index === 0
                            ? "#ffd700"
                            : index === 1
                              ? "#c0c0c0"
                              : index === 2
                                ? "#cd7f32"
                                : "#666",
                        fontSize: "18px",
                      }}
                    >
                      #{index + 1}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {restaurant.image && (
                        <img
                          src={`http://localhost:4000${restaurant.image}`}
                          alt={restaurant.name}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <span style={{ fontWeight: "500" }}>
                        {restaurant.name}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: "#666",
                    }}
                  >
                    {restaurant.orderCount}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#10b981",
                    }}
                  >
                    {formatCurrency(restaurant.revenue)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: "#666",
                    }}
                  >
                    {restaurant.orderCount > 0
                      ? formatCurrency(
                          restaurant.revenue / restaurant.orderCount
                        )
                      : formatCurrency(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No revenue data available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
