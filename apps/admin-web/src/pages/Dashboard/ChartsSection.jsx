import React from "react";
import { LineChart, BarChart } from "shared-ui";

const ChartsSection = ({ revenueOverTime, ordersOverTime }) => {
    return (
        <div className="charts-container">
            <div className="chart-item">
                <h3>Revenue Over Time (Last 7 Days)</h3>
                {revenueOverTime.length > 0 ? (
                    <LineChart data={revenueOverTime} dataKey="revenue" />
                ) : (
                    <p>No data available</p>
                )}
            </div>
            <div className="chart-item">
                <h3>Orders Over Time (Last 7 Days)</h3>
                {ordersOverTime.length > 0 ? (
                    <BarChart data={ordersOverTime} dataKey="orders" />
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
};

export default ChartsSection;
