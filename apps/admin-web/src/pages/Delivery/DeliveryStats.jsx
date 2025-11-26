import React from "react";

const DeliveryStats = ({ drones, deliveryOrdersCount, totalOrders }) => {
  // Đang hoạt động: available, busy, delivering (không locked)
  const activeDronesCount = drones.filter((d) => d.status !== "locked").length;

  // Đang vận chuyển: busy, delivering, hoặc có assignedOrderId
  const deliveringDronesCount = drones.filter(
    (d) =>
      d.status === "busy" ||
      d.status === "delivering" ||
      d.assignedOrderId !== null
  ).length;

  // Đã bị khóa
  const lockedDronesCount = drones.filter((d) => d.status === "locked").length;

  return (
    <div className="delivery-stats">
      <div className="stat-card total">
        <div className="stat-icon">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="stat-info">
          <p className="stat-label">Tổng drone</p>
          <p className="stat-value">{drones.length}</p>
        </div>
      </div>
      <div className="stat-card active">
        <div className="stat-icon">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="stat-info">
          <p className="stat-label">Hoạt động</p>
          <p className="stat-value">{activeDronesCount}</p>
        </div>
      </div>
      <div className="stat-card delivery">
        <div className="stat-icon">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div className="stat-info">
          <p className="stat-label">Đang giao</p>
          <p className="stat-value">{deliveringDronesCount}</p>
        </div>
      </div>
      <div className="stat-card locked">
        <div className="stat-icon">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="stat-info">
          <p className="stat-label">Đã khóa</p>
          <p className="stat-value">{lockedDronesCount}</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStats;
