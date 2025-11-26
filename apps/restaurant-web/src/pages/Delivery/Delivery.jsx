// src/pages/Delivery/Delivery.jsx
import React from "react";
import MapDroneRealtime from "../../components/DashboardComponents/MapDroneRealTime";
import { useDroneTracking } from "../../hooks/useDroneTracking";
import "./Delivery.css";

const Delivery = () => {
  const { drones, orders, loading } = useDroneTracking();

  if (loading) {
    return (
      <div className="delivery-page">
        <h2>Theo dõi Giao hàng (Thời gian thực)</h2>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      <h2>Theo dõi Giao hàng (Thời gian thực)</h2>
      <MapDroneRealtime initialDrones={drones} initialOrders={orders} />
    </div>
  );
};

export default Delivery;
