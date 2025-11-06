import React, { useContext } from "react";
import "./Dashboard.css";
import { CardStats, LineChart, BarChart } from "shared-ui";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { useRestaurantStats } from "../../hooks/useRestaurantStats";
import { formatCurrency } from "shared-utils";
import { MdLocationOn, MdStar, MdPhone } from "react-icons/md";

const Dashboard = () => {
  const { currentRestaurant } = useContext(RestaurantContext);
  const stats = useRestaurantStats();

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
          <CardStats
            title="Total Orders"
            value={stats.totalOrders}
            color="primary"
          />
          <CardStats
            title="Completed"
            value={stats.completedOrders}
            color="success"
          />
          <CardStats
            title="Pending"
            value={stats.pendingOrders}
            color="warning"
          />
          <CardStats
            title="Revenue"
            value={formatCurrency(stats.revenue)}
            color="success"
          />
        </div>

        {/* Biểu đồ */}
        <div className="charts-container">
          <div className="chart-item">
            <h3>Revenue Over Time (Last 7 Days)</h3>
            {stats.chartData.length > 0 ? (
              <LineChart data={stats.chartData} dataKey="revenue" />
            ) : (
              <p>No data available</p>
            )}
          </div>
          <div className="chart-item">
            <h3>Orders Over Time (Last 7 Days)</h3>
            {stats.chartData.length > 0 ? (
              <BarChart data={stats.chartData} dataKey="orders" />
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
