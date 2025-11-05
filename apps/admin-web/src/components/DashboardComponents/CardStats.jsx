// src/components/DashboardComponents/CardStats.jsx
import React from "react";
//import "./CardStats.css"; // nếu muốn style riêng

const CardStats = ({ title, value }) => {
  return (
    <div className="card-stats" style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      flex: 1,
      textAlign: "center"
    }}>
      <h3>{title}</h3>
      <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</p>
    </div>
  );
};

export default CardStats; // <- cực kỳ quan trọng
