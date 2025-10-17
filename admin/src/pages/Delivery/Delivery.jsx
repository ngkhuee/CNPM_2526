// src/pages/Delivery/Delivery.jsx
import React from "react";
import MapDroneRealtime from "../../components/DashboardComponents/MapDroneRealTime";
import "./Delivery.css";

const Delivery = () => {
  const drones = [
    { _id: "drone1", identifier: "Drone 1", lat: 10.770, lng: 106.680 } 
  ];

  const orders = [
    {
      id: "order1",
      lat: 10.775,
      lng: 106.685,
      address: "Order Address"
    }
  ];

  return (
    <div className="delivery-page">
      <h2>Delivery Monitoring (Demo Realtime)</h2>
      <MapDroneRealtime initialDrones={drones} initialOrders={orders} />
    </div>
  );
};

export default Delivery;
