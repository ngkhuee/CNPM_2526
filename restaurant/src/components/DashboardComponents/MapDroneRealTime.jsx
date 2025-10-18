// src/components/DashboardComponents/MapDroneRealtime.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icon drone
const droneIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [35, 35],
});

const MapDroneRealtime = ({ initialDrones = [], initialOrders = [] }) => {
  const [drone, setDrone] = useState(initialDrones[0] || { lat: 10.770, lng: 106.680 });
  const [order] = useState(initialOrders[0] || { lat: 10.775, lng: 106.685, address: "Order Address" });

  useEffect(() => {
    const interval = setInterval(() => {
      setDrone(prev => {
        const step = 0.01; // tốc độ di chuyển
        const newLat = prev.lat + (order.lat - prev.lat) * step;
        const newLng = prev.lng + (order.lng - prev.lng) * step;
        return { ...prev, lat: newLat, lng: newLng };
      });
    }, 100); // update mỗi 0.1s
    return () => clearInterval(interval);
  }, [order]);

  const center = [drone.lat, drone.lng];

  return (
    <MapContainer center={center} zoom={15} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Drone marker */}
      <Marker position={[drone.lat, drone.lng]} icon={droneIcon}>
        <Popup>Drone</Popup>
      </Marker>

      {/* Order marker */}
      <Marker position={[order.lat, order.lng]}>
        <Popup>{order.address}</Popup>
      </Marker>

      {/* Line từ drone → order */}
      <Polyline positions={[[drone.lat, drone.lng], [order.lat, order.lng]]} color="blue" />
    </MapContainer>
  );
};

export default MapDroneRealtime;
