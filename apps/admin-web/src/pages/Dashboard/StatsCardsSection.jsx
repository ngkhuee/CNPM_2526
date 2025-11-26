import React from "react";
import { CardStats } from "shared-ui";
import { formatCurrency } from "shared-utils";

const StatsCardsSection = ({ stats }) => {
    return (
        <>
            <div className="cards-container">
                <CardStats
                    title="Tổng người dùng"
                    value={stats.totalUsers}
                    color="primary"
                />
                <CardStats
                    title="Tổng nhà hàng"
                    value={`${stats.activeRestaurants} / ${stats.totalRestaurants}`}
                    color="success"
                />
                <CardStats
                    title="Tổng đơn hàng"
                    value={stats.totalOrders}
                    color="warning"
                />
                <CardStats
                    title="Tổng doanh thu"
                    value={formatCurrency(stats.totalRevenue)}
                    color="success"
                />
            </div>

            <div className="cards-container" style={{ marginTop: "20px" }}>
                <CardStats
                    title="Đơn hàng chờ xử lý"
                    value={stats.pendingOrders}
                    color="warning"
                />
                <CardStats
                    title="Đơn hàng hoàn thành"
                    value={stats.completedOrders}
                    color="success"
                />
            </div>
        </>
    );
};

export default StatsCardsSection;
