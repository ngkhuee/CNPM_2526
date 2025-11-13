import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MdBarChart } from "react-icons/md";

/**
 * OrderChart - Displays order count over time
 * Pure UI component - receives data and callbacks only
 */
const OrderChart = ({ data = [], loading = false }) => {
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
                <div className="chart-empty">No order data available</div>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <div className="chart-header">
                <div className="chart-title">
                    <MdBarChart /> Orders Trend
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                        }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#764ba2" name="Orders" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrderChart;
