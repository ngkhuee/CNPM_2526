// src/components/DashboardComponents/LineChart.jsx
import React from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReLineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
      </ReLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
