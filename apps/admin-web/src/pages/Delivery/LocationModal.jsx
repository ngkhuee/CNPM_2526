import React, { useEffect, useState } from "react";
import { Modal } from "shared-ui";
import { MdSearch, MdFlight, MdStore, MdLocationOn, MdLock, MdCheckCircle, MdRefresh, MdDescription } from "react-icons/md";

const LocationModal = ({ isOpen, onClose, locationCoords }) => {
  const [refreshTime, setRefreshTime] = useState(new Date().toLocaleTimeString());

  // Auto-refresh displayed time when modal is open and drone has active order
  useEffect(() => {
    if (!isOpen || !locationCoords?.orderInfo) return;

    const interval = setInterval(() => {
      setRefreshTime(new Date().toLocaleTimeString());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isOpen, locationCoords?.orderInfo]);

  // Map drone journey stage to readable status with icons
  const getJourneyStatusText = (stage) => {
    const stageMap = {
      searching: { icon: <MdSearch />, text: "Đang tìm drone" },
      going_to_restaurant: { icon: <MdFlight />, text: "Đang bay đến nhà hàng (lấy hàng)" },
      at_restaurant: { icon: <MdStore />, text: "Đang ở nhà hàng - Chờ lấy hàng" },
      going_to_customer: { icon: <MdFlight />, text: "Đang bay đến khách hàng (giao hàng)" },
      at_customer: { icon: <MdLocationOn />, text: "Đang ở vị trí khách - Giao hàng" },
    };
    return stageMap[stage] || { icon: null, text: stage };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vị trí Drone"
      width="700px"
    >
      <div className="location-modal">
        {locationCoords ? (
          <>
            <div className="location-info-card">
              {/* Order Journey Status */}
              {locationCoords.orderInfo ? (
                <div
                  style={{
                    background: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "8px", color: "#856404", display: "flex", alignItems: "center", gap: "8px" }}>
                    <MdDescription size={20} />
                    Đang giao: Đơn #{locationCoords.orderInfo.orderId}
                  </div>
                  <div style={{ fontSize: "14px", color: "#856404" }}>
                    <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <strong>Trạng thái:</strong>
                      {getJourneyStatusText(locationCoords.orderInfo.droneJourneyStage).icon}
                      {getJourneyStatusText(locationCoords.orderInfo.droneJourneyStage).text}
                    </div>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Lấy hàng:</strong> {locationCoords.orderInfo.restaurantAddress || "Nhà hàng"}
                    </div>
                    <div>
                      <strong>Giao đến:</strong> {locationCoords.orderInfo.customerAddress || "Địa chỉ khách hàng"}
                    </div>
                  </div>
                </div>
              ) : locationCoords.droneStatus === "available" ? (
                <div
                  style={{
                    background: "#d4edda",
                    border: "1px solid #28a745",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                    color: "#155724",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <MdCheckCircle size={20} />
                  Drone sẵn sàng tại Yummy
                </div>
              ) : locationCoords.droneStatus === "locked" ? (
                <div
                  style={{
                    background: "#f8d7da",
                    border: "1px solid #dc3545",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                    color: "#721c24",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <MdLock size={20} />
                  Drone đã khóa (chế độ bảo trì)
                </div>
              ) : null}

              <div className="info-row">
                <span className="info-label">Vị trí hiện tại:</span>
                <span className="info-value">{locationCoords.address}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tọa độ:</span>
                <span className="info-value">{locationCoords.lat}, {locationCoords.lng}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Cập nhật lần cuối:</span>
                <span className="info-value">
                  {locationCoords.updated_at ? new Date(locationCoords.updated_at).toLocaleString() : new Date().toLocaleString()}
                </span>
              </div>
            </div>

            <div className="map-container">
              <iframe
                title="Drone Location Map"
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationCoords.lng - 0.01},${locationCoords.lat - 0.01},${locationCoords.lng + 0.01},${locationCoords.lat + 0.01}&layer=mapnik&marker=${locationCoords.lat},${locationCoords.lng}`}
                style={{ border: "1px solid #ccc", borderRadius: 8 }}
              />
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${locationCoords.lat}&mlon=${locationCoords.lng}#map=15/${locationCoords.lat}/${locationCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#ff6b35",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  Xem trên OpenStreetMap →
                </a>
              </div>
            </div>
          </>
        ) : (
          <p>Không có dữ liệu vị trí</p>
        )}
      </div>
    </Modal>
  );
};

export default LocationModal;
