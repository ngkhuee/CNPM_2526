import React, { useState, useEffect } from "react";
import { Modal } from "../Modal/Modal";
import { DroneTrackingMap } from "./DroneTrackingMap";
import "./OrderDetailModal.css";

export const OrderDetailModal = ({ isOpen, onClose, order, enableAutoRefresh = false }) => {
  const [refreshedOrder, setRefreshedOrder] = useState(order);

  // Sync refreshedOrder when order prop changes
  useEffect(() => {
    setRefreshedOrder(order);
  }, [order]);

  // Auto-refresh order data AND drone location every 3 seconds
  useEffect(() => {
    if (!order || !isOpen || !enableAutoRefresh) return;

    const activeStatuses = ["confirmed", "preparing", "ready", "picking_up", "picked_up", "delivering"];
    if (!activeStatuses.includes(order.status)) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    const fetchOrderAndDrone = async () => {
      try {
        // Get auth token from localStorage (for admin/restaurant)
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        };

        // Fetch fresh order data
        const orderResponse = await fetch(`${API_BASE_URL}/orders/${order.id}`, { headers });
        if (orderResponse.ok) {
          const freshOrder = await orderResponse.json();

          // If order has drone assigned, fetch drone location
          if (freshOrder.drone_id) {
            try {
              const droneResponse = await fetch(`${API_BASE_URL}/drones/${freshOrder.drone_id}`, { headers });
              if (droneResponse.ok) {
                const droneData = await droneResponse.json();
                console.log('[OrderDetailModal] Drone data:', droneData);
                console.log('[OrderDetailModal] Drone current_location:', droneData.current_location);
                // Attach drone GPS to order
                freshOrder.current_gps = droneData.current_location || {
                  lat: droneData.latitude,
                  lng: droneData.longitude
                };
                console.log('[OrderDetailModal] freshOrder.current_gps set to:', freshOrder.current_gps);
              }
            } catch (droneError) {
              console.error("Error fetching drone location:", droneError);
            }
          }

          console.log('[OrderDetailModal] Setting refreshedOrder with current_gps:', freshOrder.current_gps);
          setRefreshedOrder(freshOrder);
        }
      } catch (error) {
        console.error("Error refreshing order:", error);
      }
    };

    // Initial fetch
    fetchOrderAndDrone();

    // Then poll every 1 second for real-time drone tracking
    const intervalId = setInterval(fetchOrderAndDrone, 1000);

    return () => clearInterval(intervalId);
  }, [isOpen, order, enableAutoRefresh]);

  if (!order) return null;

  // Use refreshed order data if available, otherwise use original
  const displayOrder = refreshedOrder || order;

  const formatCurrency = (v) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v || 0);
  };

  // Parse timestamps
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "Không xác định";
    try {
      return new Date(dateStr).toLocaleString("vi-VN");
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  const orderPlacedTime = getFormattedDate(displayOrder.created_at || displayOrder.createdAt);
  const completedTime = displayOrder.status === "completed"
    ? getFormattedDate(displayOrder.updated_at || displayOrder.updatedAt)
    : null;

  // Helper to normalize GPS format (handle both {lat,lng} and {latitude,longitude})
  const normalizeGPS = (gps) => {
    if (!gps) return null;
    return {
      lat: gps.lat ?? gps.latitude,
      lng: gps.lng ?? gps.longitude,
    };
  };

  // Get restaurant and delivery locations for map
  const pickupGPS = normalizeGPS(displayOrder.pickup_gps);
  const dropoffGPS = normalizeGPS(displayOrder.dropoff_gps);

  const restaurantLocation = {
    lat: displayOrder.restaurant?.location?.lat || displayOrder.restaurant?.latitude || pickupGPS?.lat || 10.776,
    lng: displayOrder.restaurant?.location?.lng || displayOrder.restaurant?.longitude || pickupGPS?.lng || 106.7,
    name: displayOrder.restaurant?.name || displayOrder.restaurantName || "Nhà hàng",
    address: displayOrder.pickup_address || displayOrder.restaurant?.address || "Vị trí lấy hàng",
  };

  const deliveryLocation = {
    lat: dropoffGPS?.lat || displayOrder.customer?.latitude || 10.776,
    lng: dropoffGPS?.lng || displayOrder.customer?.longitude || 106.7,
    address: displayOrder.customer?.address || displayOrder.delivery_address || displayOrder.address || "Vị trí giao hàng",
  };

  // Check drone assignment status first (before using in droneLocation logic)
  const isDelivering = ["ready", "picking_up", "picked_up", "delivering"].includes(displayOrder.status);
  const isActivelyDelivering = displayOrder.status === "delivering";
  const hasDroneAssigned = !!(displayOrder.drone_id || displayOrder.droneId);
  const shouldShowMap = hasDroneAssigned && ["confirmed", "preparing", "ready", "picking_up", "picked_up", "delivering"].includes(displayOrder.status);

  // Drone location: use current_gps if available, otherwise infer from journey stage
  console.log('[OrderDetailModal] displayOrder.current_gps:', displayOrder.current_gps);
  console.log('[OrderDetailModal] displayOrder.drone_journey_stage:', displayOrder.drone_journey_stage);

  let droneLocation = null;
  if (displayOrder.current_gps) {
    droneLocation = {
      lat: displayOrder.current_gps.lat || displayOrder.current_gps.latitude,
      lng: displayOrder.current_gps.lng || displayOrder.current_gps.longitude,
    };
    console.log('[OrderDetailModal] Using current_gps for drone:', droneLocation);
  } else if (hasDroneAssigned && displayOrder.drone_journey_stage) {
    // Fallback: Infer drone position from journey stage when no real-time GPS
    const stage = displayOrder.drone_journey_stage;
    console.log('[OrderDetailModal] No current_gps, using fallback for stage:', stage);
    if (stage === 'at_restaurant') {
      droneLocation = {
        lat: restaurantLocation.lat,
        lng: restaurantLocation.lng,
      };
      console.log('[OrderDetailModal] Drone at restaurant:', droneLocation);
    } else if (stage === 'at_customer') {
      droneLocation = {
        lat: deliveryLocation.lat,
        lng: deliveryLocation.lng,
      };
      console.log('[OrderDetailModal] Drone at customer:', droneLocation);
    }
    // Note: going_to_restaurant and going_to_customer should have current_gps from backend
  }

  console.log('[OrderDetailModal] Final droneLocation:', droneLocation);

  // Calculate distance remaining (simplified)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  let remainingDistance = null;
  if (isActivelyDelivering && droneLocation) {
    remainingDistance = calculateDistance(
      droneLocation.lat,
      droneLocation.lng,
      deliveryLocation.lat,
      deliveryLocation.lng
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${displayOrder.id}`}
      width="900px"
    >
      <div className="odm-body">
        {/* Drone Tracking Map - Show when drone is assigned */}
        {shouldShowMap && (
          <section className="odm-section odm-tracking-section">
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              [DRONE] Theo dõi giao hàng trực tiếp
              <span style={{
                fontSize: "12px",
                fontWeight: "normal",
                marginLeft: "auto",
                color: "#ff6b35",
              }}>
                Trực tiếp
              </span>
            </h4>
            <DroneTrackingMap
              restaurantLocation={restaurantLocation}
              deliveryLocation={deliveryLocation}
              droneLocation={droneLocation}
              droneId={displayOrder.drone_id || displayOrder.droneId}
              isDelivering={isActivelyDelivering}
              droneJourneyStage={displayOrder.drone_journey_stage || displayOrder.droneJourneyStage}
            />
          </section>
        )}

        {/* Delivery Progress Section - Show when actively delivering */}
        {isActivelyDelivering && displayOrder.drone_id && (
          <section className="odm-section odm-progress-section">
            <h4>[PIN] Tiến trình giao hàng</h4>
            <div className="progress-grid">
              <div className="progress-item">
                <span className="progress-label">Mã Drone:</span>
                <span className="progress-value">
                  {displayOrder.drone_id || displayOrder.droneId}
                </span>
              </div>
              {droneLocation && (
                <div className="progress-item">
                  <span className="progress-label">Vị trí hiện tại:</span>
                  <span className="progress-value">
                    {droneLocation.lat.toFixed(4)}, {droneLocation.lng.toFixed(4)}
                  </span>
                </div>
              )}
              {remainingDistance !== null && (
                <div className="progress-item">
                  <span className="progress-label">Khoảng cách đến nơi giao:</span>
                  <span className="progress-value progress-distance">
                    {remainingDistance < 1
                      ? Math.round(remainingDistance * 1000) + " m"
                      : remainingDistance.toFixed(2) + " km"}
                  </span>
                </div>
              )}
              <div className="progress-item">
                <span className="progress-label">Trạng thái:</span>
                <span className="progress-value status-badge status-delivering">
                  {displayOrder.status}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Row 1: Customer & Restaurant */}
        <div className="odm-row">
          <section className="odm-section odm-half">
            <h4>Khách hàng</h4>
            <p>
              <strong>Tên:</strong>
              <span>
                {displayOrder.customer?.name ||
                  displayOrder.user?.full_name ||
                  displayOrder.userName ||
                  displayOrder.full_name ||
                  "-"}
              </span>
            </p>
            <p>
              <strong>Mã KH:</strong>
              <span>{displayOrder.user_id || displayOrder.userId || "-"}</span>
            </p>
            <p>
              <strong>Điện thoại:</strong>
              <span>
                {displayOrder.customer?.phone ||
                  displayOrder.user?.phone ||
                  displayOrder.phone ||
                  "N/A"}
              </span>
            </p>
            <p>
              <strong>Địa chỉ:</strong>
              <span>
                {displayOrder.customer?.address ||
                  displayOrder.delivery_address ||
                  displayOrder.address ||
                  "-"}
              </span>
            </p>
          </section>

          <section className="odm-section odm-half">
            <h4>Nhà hàng</h4>
            <p>
              <strong>Tên:</strong>
              <span>
                {displayOrder.restaurant?.name || displayOrder.restaurantName || "N/A"}
              </span>
            </p>
            <p>
              <strong>Địa chỉ:</strong>
              <span>
                {displayOrder.restaurant?.address || displayOrder.restaurantAddress || "N/A"}
              </span>
            </p>
            <p>
              <strong>Mã NH:</strong>
              <span className="value-highlight">
                {displayOrder.restaurant_id || displayOrder.restaurantId || "-"}
              </span>
            </p>
            <p>
              <strong>Điện thoại:</strong>
              <span>
                {displayOrder.restaurant?.phone || displayOrder.restaurantPhone || "N/A"}
              </span>
            </p>
          </section>
        </div>

        {/* Row 2: Order Status (with Order Info merged) */}
        <section className="odm-section">
          <h4>Trạng thái đơn hàng</h4>
          <p>
            <strong>Trạng thái:</strong>
            <span className="odm-status-badge">
              {displayOrder.status || "Không xác định"}
            </span>
          </p>
          <p>
            <strong>Phương thức thanh toán:</strong>
            <span className="odm-payment-badge">
              {displayOrder.payment_method || displayOrder.paymentMethod || "N/A"}
            </span>
          </p>
          <p>
            <strong>Trạng thái thanh toán:</strong>
            <span>
              {displayOrder.payment_status || displayOrder.paymentStatus || "N/A"}
            </span>
          </p>
          <p>
            <strong>Ngày đặt:</strong>
            <span>{orderPlacedTime}</span>
          </p>
          {completedTime && (
            <p>
              <strong>Hoàn thành:</strong>
              <span>{completedTime}</span>
            </p>
          )}
        </section>

        {/* Row 3: Order & Payment Info combined */}
        <section className="odm-section">
          <h4>Tóm tắt đơn hàng</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            <div style={{ paddingLeft: "15px" }} >
              <h5 style={{ marginBottom: "10px" }} >Sản phẩm</h5>
              <ul>
                {displayOrder.items && displayOrder.items.length > 0 ? (
                  displayOrder.items.map((it, idx) => (
                    <li key={idx}>
                      <span>
                        <strong>{it.name}</strong> × {it.quantity}
                      </span>
                      <span className="value-highlight">
                        {formatCurrency(
                          it.subtotal || it.unit_price || it.unitPrice
                        )}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>Không có sản phẩm</li>
                )}
              </ul>
            </div>
            <div>
              <h5 style={{ marginBottom: "10px" }} >Chi tiết thanh toán</h5>
              <div style={{ paddingLeft: "20x" }} >
                <p>
                  <strong>Tạm tính:</strong>
                  <span className="odm-amount" style={{ color: "#000" }} >
                    {formatCurrency(
                      displayOrder.subtotal || displayOrder.sub_total || 0
                    )}
                  </span>
                </p>
                <p>
                  <strong>Phí giao hàng:</strong>
                  <span className="odm-amount" style={{ color: "#000" }} >
                    {formatCurrency(displayOrder.delivery_fee || displayOrder.deliveryFee || 0)}
                  </span>
                </p>
                <p>
                  <strong>Giảm giá:</strong>
                  <span className="odm-amount odm-discount">
                    -{formatCurrency(
                      displayOrder.discount_amount || displayOrder.discountAmount || 0
                    )}
                  </span>
                </p>
                <p style={{ borderTop: "1px solid #ddd", paddingTop: "8px", marginTop: "8px" }}>
                  <strong>Tổng cộng:</strong>
                  <span className="odm-amount odm-total">
                    {formatCurrency(
                      displayOrder.total_amount || displayOrder.totalPrice || displayOrder.totalAmount || 0
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Row 4: Delivery Info */}
        <section className="odm-section">
          <h4>Thông tin giao hàng</h4>
          <p>
            <strong>Drone:</strong>
            <span>
              {displayOrder.drone_id || displayOrder.droneId
                ? `${displayOrder.drone_id || displayOrder.droneId} - ${displayOrder.drone_name || displayOrder.droneName || ""}`.trim()
                : "Chưa phân công"}
            </span>
          </p>
          <p>
            <strong>Địa chỉ nhà hàng:</strong>
            <span>
              {displayOrder.restaurant?.address || displayOrder.restaurantAddress || "N/A"}
            </span>
          </p>
          <p>
            <strong>Địa chỉ khách hàng:</strong>
            <span>
              {displayOrder.customer?.address ||
                displayOrder.delivery_address ||
                displayOrder.address ||
                "N/A"}
            </span>
          </p>
          {(displayOrder.special_instructions || displayOrder.specialInstructions) && (
            <p>
              <strong>Ghi chú đặc biệt:</strong>
              <span>
                {displayOrder.special_instructions || displayOrder.specialInstructions}
              </span>
            </p>
          )}
        </section>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
