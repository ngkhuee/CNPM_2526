import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOrderTracking } from "customer-shared";
import { formatCurrency } from "shared-utils";
import "./Tracking.css";
import { MdLocalShipping, MdCheckCircle } from "react-icons/md";

const Tracking = () => {
  const { id } = useParams();
  const { order, loading } = useOrderTracking(id);

  const [dronePosition, setDronePosition] = useState(null);
  const [droneProgress, setDroneProgress] = useState(0);

  useEffect(() => {
    if (order) {
      updateDroneProgress(order.status);

      // Update GPS position if available
      if (order.current_gps) {
        setDronePosition(order.current_gps);
      }
    }
  }, [order]);

  // Update drone progress based on order status
  const updateDroneProgress = (status) => {
    switch (status) {
      case "pending":
      case "paid":
        setDroneProgress(0);
        break;
      case "preparing":
        setDroneProgress(0.2);
        break;
      case "ready":
        setDroneProgress(0.4);
        break;
      case "in_delivery":
        setDroneProgress(0.7);
        break;
      case "delivered":
        setDroneProgress(1);
        break;
      default:
        setDroneProgress(0);
    }
  };

  if (!order) {
    return (
      <div className="tracking-page">
        <p>Không tìm thấy đơn hàng #{id}</p>
      </div>
    );
  }

  // Map configuration
  const mapWidth = 900;
  const mapHeight = 450;

  // Get coordinates from order or use defaults
  const pickupGPS = order.pickup_gps || { lat: 10.776, lng: 106.7 };
  const dropoffGPS = order.dropoff_gps ||
    order.customer?.gps || { lat: 10.7729, lng: 106.6981 };

  // Convert GPS to map coordinates (simplified)
  const start = { x: 50, y: 400 };
  const end = { x: 800, y: 50 };

  // Use real drone position if available, otherwise interpolate
  let x, y;
  if (dronePosition) {
    // Map real GPS to screen coordinates (you'd need proper conversion)
    x = start.x + (end.x - start.x) * droneProgress;
    y = start.y + (end.y - start.y) * droneProgress;
  } else {
    // Fallback to progress-based interpolation
    x = start.x + (end.x - start.x) * droneProgress;
    y = start.y + (end.y - start.y) * droneProgress;
  }

  return (
    <div className="tracking-page">
      {/* Order information */}
      <div className="tracking-info">
        <h2>Đơn hàng #{order.id || order._id}</h2>

        {/* Restaurant info */}
        {(order.restaurantName ||
          order.restaurant?.name ||
          order.restaurantId) && (
          <p
            style={{ color: "#ff6b35", fontWeight: "600", marginBottom: "8px" }}
          >
            <span>🍽️ Nhà hàng:</span>{" "}
            {order.restaurantName ||
              order.restaurant?.name ||
              `Restaurant ID: ${order.restaurantId}`}
          </p>
        )}

        <p>
          Trạng thái:
          <span className={`status ${order.status}`}>
            {order.status === "pending" && "Chờ xác nhận"}
            {order.status === "paid" && "Đã thanh toán"}
            {order.status === "preparing" && "Đang chuẩn bị"}
            {order.status === "ready" && "Sẵn sàng giao"}
            {order.status === "in_delivery" && "Đang giao"}
            {order.status === "delivered" && "Đã giao"}
            {order.status === "cancelled" && "Đã hủy"}
          </span>
        </p>
        <div className="customer-info">
          <p>
            <span>Khách hàng:</span> {order.customer?.name || "N/A"}
          </p>
          <p>
            <span>SĐT:</span> {order.customer?.phone || "N/A"}
          </p>
          <p>
            <span>Địa chỉ:</span> {order.customer?.address || "N/A"}
          </p>
          <p>
            <span>Tổng tiền:</span> {formatCurrency(order.total_amount)}
          </p>
        </div>
      </div>

      {/* Phần dưới: map + drone */}
      <div className="map-container">
        <iframe
          title="Google Map"
          width={mapWidth}
          height={mapHeight}
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            "Đại học Sài Gòn"
          )}&output=embed`}
        />

        {/* Drone */}
        <div
          className={`drone ${droneProgress >= 1 ? "arrived" : ""}`}
          style={{
            left: `${x}px`,
            top: `${y}px`,
            fontSize: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {droneProgress >= 1 ? (
            <MdCheckCircle color="#28a745" />
          ) : (
            <MdLocalShipping color="#007bff" />
          )}
        </div>
      </div>

      <div className="drone-status">
        {order.status === "delivered" && "Đã giao hàng thành công!"}
        {order.status === "in_delivery" &&
          `Đang giao hàng... (${Math.round(droneProgress * 100)}%)`}
        {order.status === "ready" && "Đơn hàng sẵn sàng để giao"}
        {order.status === "preparing" && "Đang chuẩn bị món"}
        {order.status === "paid" && "Đã thanh toán, chờ nhà hàng xác nhận"}
        {order.status === "pending" && "Chờ thanh toán"}
        {dronePosition && (
          <p style={{ fontSize: "12px", marginTop: "5px" }}>
            Vị trí: {dronePosition.lat?.toFixed(4)},{" "}
            {dronePosition.lng?.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
};

export default Tracking;
