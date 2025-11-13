import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@utils/formatters";
import { MdTrendingUp } from "react-icons/md";

/**
 * RevenueChart - Displays revenue trend over time
 * Pure UI component - receives data and callbacks only
 */
const RevenueChart = ({ data = [], loading = false, onDateRangeChange }) => {
    if (loading) {
        return (
            <div className="chart-container">
                <div className="chart-skeleton">Loading chart...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="chart-container">
                <div className="chart-empty">No revenue data available</div>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <div className="chart-header">
                <div className="chart-title">
                    <MdTrendingUp /> Revenue Trend
                </div>
                <div className="chart-filters">
                    <button
                        className="filter-btn"
                        onClick={() => onDateRangeChange("7days")}
                    >
                        7 Days
                    </button>
                    <button
                        className="filter-btn"
                        onClick={() => onDateRangeChange("week")}
                    >
                        Week
                    </button>
                    <button
                        className="filter-btn"
                        onClick={() => onDateRangeChange("month")}
                    >
                        Month
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                        }}
                        formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#667eea"
                        strokeWidth={2}
                        dot={{ fill: "#667eea", r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Revenue"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
