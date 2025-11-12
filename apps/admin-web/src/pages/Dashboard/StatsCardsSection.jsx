import React from "react";
import { CardStats } from "shared-ui";
import { formatCurrency } from "shared-utils";

const StatsCardsSection = ({ stats }) => {
    return (
        <>
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
        </>
    );
};

export default StatsCardsSection;
