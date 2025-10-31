import React, { useContext, useState, useEffect } from "react";
import { OrderContext } from "../../Context/OrderContext";
import "./Tracking.css";

const Tracking = () => {
  const { orders } = useContext(OrderContext);

  // Lấy đơn hàng cuối cùng
  const order = orders[orders.length - 1];
  const [droneProgress, setDroneProgress] = useState(0); // 0 → 1

  useEffect(() => {
  const interval = setInterval(() => {
    setDroneProgress(prev => {
      if (prev >= 1) {
        clearInterval(interval); // dừng interval
        return 1; // drone dừng hẳn
      }
      return prev + 0.01; // tốc độ
    });
  }, 50);

  return () => clearInterval(interval);
}, []);

  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  // Kích thước map
  const mapWidth = 900;
  const mapHeight = 450;

  // Start (cửa hàng giả lập) và End (Đại học Sài Gòn)
  const start = { x: 50, y: 400 };
  const end = { x: 800, y: 50 };

  // Linear interpolation: vị trí drone
  const t = droneProgress;
  const x = start.x + (end.x - start.x) * t;
  const y = start.y + (end.y - start.y) * t;

  return (
    <div className="tracking-page">
      {/* Phần trên: thông tin đơn hàng */}
      <div className="tracking-info">
        <h2>Đơn hàng #{order._id}</h2>
        <p>
            Trạng thái: 
            <span className={`status ${droneProgress < 1 ? "delivering" : "arrived"}`}>
            {droneProgress < 1 ? "Đang giao" : "Đã đến nơi"}
            </span>
        </p>
        <div className="customer-info">
            <p><span>Khách hàng:</span> {order.customer?.name}</p>
            <p><span>SĐT:</span> {order.customer?.phone}</p>
            <p><span>Địa chỉ:</span> {order.customer?.address}</p>
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
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          🛸
        </div>
      </div>

      <div className="drone-status">
        {droneProgress < 1
          ? "🛸 Drone đang di chuyển tới địa chỉ..."
          : "✅ Drone đã đến nơi!"}
      </div>
    </div>
  );
};

export default Tracking;
