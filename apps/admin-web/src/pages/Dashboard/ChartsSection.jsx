import React from "react";
import { LineChart, BarChart } from "shared-ui";

const ChartsSection = ({ revenueOverTime, ordersOverTime }) => {
    return (
        <div className="charts-container">
            <div className="chart-item">
                <h3>Doanh thu theo thời gian (7 ngày qua)</h3>
                {revenueOverTime.length > 0 ? (
                    <LineChart data={revenueOverTime} dataKey="revenue" />
                ) : (
                    <p>Chưa có dữ liệu</p>
                )}
            </div>
            <div className="chart-item">
                <h3>Đơn hàng theo thời gian (7 ngày qua)</h3>
                {ordersOverTime.length > 0 ? (
                    <BarChart data={ordersOverTime} dataKey="orders" />
                ) : (
                    <p>Chưa có dữ liệu</p>
                )}
            </div>
        </div>
    );
};

export default ChartsSection;
