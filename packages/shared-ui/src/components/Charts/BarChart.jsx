import React from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const BarChart = ({ data, dataKey = "orders", fill = "#10b981" }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={fill} />
      </ReBarChart>
    </ResponsiveContainer>
  );
};
