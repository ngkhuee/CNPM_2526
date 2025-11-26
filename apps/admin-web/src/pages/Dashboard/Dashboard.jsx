import React, { useContext } from "react";
import "./Dashboard.css";
import { SystemStatsContext } from "../../Context/SystemStatsContext";
import StatsCardsSection from "./StatsCardsSection";
import ChartsSection from "./ChartsSection";
import RevenueTable from "./RevenueTable";
import { formatCurrency } from "shared-utils";

const Dashboard = () => {
  const { stats, loading, error, fetchStats } = useContext(SystemStatsContext);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h2>Bảng điều khiển Quản trị</h2>
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h2>Bảng điều khiển Quản trị</h2>
        <p className="error">Lỗi khi tải thống kê: {error}</p>
        <button onClick={fetchStats}>Thử lại</button>
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
        <h2>Bảng điều khiển Quản trị - Tổng quan Hệ thống</h2>
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
          Làm mới thống kê
        </button>
      </div>

      <StatsCardsSection stats={stats} />

      <ChartsSection
        revenueOverTime={stats.revenueOverTime}
        ordersOverTime={stats.ordersOverTime}
      />

      <div className="restaurant-revenue-section" style={{ marginTop: "60px" }}>
        <h3 style={{ marginBottom: "30px" }}>
          Doanh thu theo Nhà hàng (Top nổi bật)
        </h3>
        <RevenueTable
          restaurants={stats.revenueByRestaurant}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
};

export default Dashboard;
