import React, { useContext, useEffect } from "react";
import "./Dashboard.css";
import { CardStats } from "shared-ui";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { useRestaurantStats } from "../../hooks/useRestaurantStats";
import { useRestaurantReviews } from "../../hooks/useRestaurantReviews";
import { useDashboardCharts } from "../../hooks/useDashboardCharts";
import { formatCurrency, formatRating } from "shared-utils";
import { MdLocationOn, MdStar, MdPhone } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import RevenueChart from "./RevenueChart";
import OrderChart from "./OrderChart";
import ProductRevenueTable from "./ProductRevenueTable";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentRestaurant } = useContext(RestaurantContext);
  const stats = useRestaurantStats();
  const { fetchReviews, getStats: getReviewStats, loading: reviewsLoading } = useRestaurantReviews();
  const { chartData, dateRange, loading: chartsLoading, error: chartsError, loadChartData, setDateRange } = useDashboardCharts();
  const [reviewStats, setReviewStats] = React.useState(null);

  useEffect(() => {
    const loadReviewStats = async () => {
      await fetchReviews("all");
      const stats = getReviewStats();
      setReviewStats(stats);
    };
    loadReviewStats();
  }, []); // Run once on mount only

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadChartData();
    }
  }, [currentRestaurant?.id, loadChartData]);

  return (
    <div className="main-content">
      <div className="dashboard-page">
        <h2>
          {currentRestaurant
            ? `Bảng điều khiển ${currentRestaurant.name}`
            : "Bảng điều khiển Nhà hàng"}
        </h2>

        {currentRestaurant && (
          <div className="restaurant-info-summary">
            <p>
              <MdLocationOn /> {currentRestaurant.location?.address}
            </p>
            <p>
              <MdStar /> Đánh giá: {currentRestaurant.rating} (
              {currentRestaurant.reviewCount} đánh giá)
            </p>
            <p>
              <MdPhone /> {currentRestaurant.ownerPhone}
            </p>
          </div>
        )}

        {/* Card thống kê */}
        <div className="cards-container">
          <CardStats
            title="Tổng đơn hàng"
            value={stats.totalOrders}
            color="primary"
          />
          <CardStats
            title="Hoàn thành"
            value={stats.completedOrders}
            color="success"
          />
          <CardStats
            title="Đang chờ"
            value={stats.pendingOrders}
            color="warning"
          />
          <CardStats
            title="Doanh thu"
            value={formatCurrency(stats.revenue)}
            color="success"
          />
        </div>

        {/* Review Stats Card */}
        {reviewStats && (
          <div className="cards-container">
            <CardStats
              title="Đánh giá trung bình"
              value={`${formatRating(reviewStats.avgRating)}/5`}
              color="info"
            />
            <CardStats
              title="Tổng đánh giá"
              value={reviewStats.total}
              color="primary"
            />
            <CardStats
              title="Chờ phản hồi"
              value={reviewStats.pending}
              color="warning"
              onClick={() => navigate("/reviews?filter=pending")}
              className="clickable"
            />
            <CardStats
              title="Đã phản hồi"
              value={reviewStats.replied}
              color="success"
              onClick={() => navigate("/reviews?filter=replied")}
              className="clickable"
            />
          </div>
        )}

        {/* Charts */}
        <div className="charts-container">
          <div className="chart-item">
            <RevenueChart
              data={chartData.revenueChart}
              loading={chartsLoading}
              onDateRangeChange={setDateRange}
            />
          </div>
          <div className="chart-item">
            <OrderChart
              data={chartData.orderChart}
              loading={chartsLoading}
            />
          </div>
          <div className="chart-item full-width">
            <ProductRevenueTable
              data={chartData.revenueByProduct}
              loading={chartsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
