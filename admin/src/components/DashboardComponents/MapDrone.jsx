// src/components/DashboardComponents/MapDrone.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom icon cho drone
const droneIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [35, 35],
});

const MapDrone = ({ drones = [], orders = [] }) => {
  // Trung tâm bản đồ: lấy drone đầu tiên hoặc mặc định
  const center = drones[0] ? [drones[0].lat, drones[0].lng] : [21.0278, 105.8342]; // Hà Nội mặc định

  return (
    <MapContainer center={center} zoom={13} className="leaflet-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Marker cho drones */}
      {drones.map((d) => (
        <Marker
          key={d._id}
          position={[d.lat, d.lng]}
          icon={droneIcon}
        >
          <Popup>
            Drone ID: {d.identifier || d._id}
          </Popup>
        </Marker>
      ))}

      {/* Marker cho orders */}
      {orders.map((o) => (
        <Marker
          key={o.id}
          position={[o.lat, o.lng]}
        >
          <Popup>
            Order ID: {o.id} <br />
            Address: {o.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapDrone;
