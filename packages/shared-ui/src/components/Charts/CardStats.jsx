import React from "react";
import "./CardStats.css";

export const CardStats = ({ title, value, icon, color = "primary" }) => {
  return (
    <div className={`card-stats card-stats-${color}`}>
      {icon && <div className="card-stats-icon">{icon}</div>}
      <div className="card-stats-content">
        <h3 className="card-stats-title">{title}</h3>
        <p className="card-stats-value">{value}</p>
      </div>
    </div>
  );
};
