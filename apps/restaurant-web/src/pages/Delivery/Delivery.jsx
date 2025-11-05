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
        <h2>Delivery Monitoring (Realtime)</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      <h2>Delivery Monitoring (Realtime)</h2>
      <MapDroneRealtime initialDrones={drones} initialOrders={orders} />
    </div>
  );
};

export default Delivery;
