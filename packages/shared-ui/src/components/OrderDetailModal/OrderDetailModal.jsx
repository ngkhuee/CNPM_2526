import React, { useState, useEffect } from "react";
import { Modal } from "../Modal/Modal";
import { DroneTrackingMap } from "./DroneTrackingMap";
import "./OrderDetailModal.css";

export const OrderDetailModal = ({ isOpen, onClose, order, enableAutoRefresh = false }) => {
  const [autoRefresh, setAutoRefresh] = useState(enableAutoRefresh);
  const [refreshedOrder, setRefreshedOrder] = useState(order);

  // Auto-refresh order data every 3 seconds if order is in active delivery state
  useEffect(() => {
    if (!order || !isOpen || !autoRefresh || !enableAutoRefresh) return;

    const activeStatuses = ["ready", "picking_up", "picked_up", "delivering"];
    if (!activeStatuses.includes(order?.status)) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    const intervalId = setInterval(async () => {
      try {
        // Fetch fresh order data - using /orders/:id endpoint (routes.json will handle /api/ prefix)
        const response = await fetch(
          `${API_BASE_URL}/orders/${order.id}`
        );
        if (response.ok) {
          const freshOrder = await response.json();
          setRefreshedOrder(freshOrder);
        }
      } catch (error) {
        console.error("Error refreshing order:", error);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isOpen, autoRefresh, order?.id, order?.status, enableAutoRefresh]);

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
    if (!dateStr) return "Unknown";
    try {
      return new Date(dateStr).toLocaleString("vi-VN");
    } catch {
      return "Invalid date";
    }
  };

  const orderPlacedTime = getFormattedDate(displayOrder.created_at || displayOrder.createdAt);
  const completedTime = displayOrder.status === "completed"
    ? getFormattedDate(displayOrder.updated_at || displayOrder.updatedAt)
    : null;

  // Get restaurant and delivery locations for map
  const restaurantLocation = {
    lat: displayOrder.restaurant?.location?.lat || displayOrder.restaurant?.latitude || displayOrder.pickup_gps?.lat || 10.776,
    lng: displayOrder.restaurant?.location?.lng || displayOrder.restaurant?.longitude || displayOrder.pickup_gps?.lng || 106.7,
    name: displayOrder.restaurant?.name || displayOrder.restaurantName || "Restaurant",
  };

  const deliveryLocation = {
    lat: displayOrder.dropoff_gps?.lat || displayOrder.customer?.latitude || 10.776,
    lng: displayOrder.dropoff_gps?.lng || displayOrder.customer?.longitude || 106.7,
    address: displayOrder.customer?.address || displayOrder.delivery_address || displayOrder.address || "Delivery Location",
  };

  const droneLocation = displayOrder.current_gps ? {
    lat: displayOrder.current_gps.lat || displayOrder.current_gps.latitude,
    lng: displayOrder.current_gps.lng || displayOrder.current_gps.longitude,
  } : null;

  const isDelivering = ["ready", "picking_up", "picked_up", "delivering"].includes(displayOrder.status);
  const isActivelyDelivering = displayOrder.status === "delivering";

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
        {/* Drone Tracking Map - Show when order is delivering */}
        {isActivelyDelivering && displayOrder.drone_id && (
          <section className="odm-section odm-tracking-section">
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              [DRONE] Real-time Delivery Tracking
              <span style={{
                fontSize: "12px",
                fontWeight: "normal",
                marginLeft: "auto",
                color: "#ff6b35",
              }}>
                Live
              </span>
            </h4>
            <DroneTrackingMap
              restaurantLocation={restaurantLocation}
              deliveryLocation={deliveryLocation}
              droneLocation={droneLocation}
              droneId={displayOrder.drone_id || displayOrder.droneId}
              isDelivering={isActivelyDelivering}
            />
          </section>
        )}

        {/* Delivery Progress Section - Show when actively delivering */}
        {isActivelyDelivering && displayOrder.drone_id && (
          <section className="odm-section odm-progress-section">
            <h4>[PIN] Delivery Progress</h4>
            <div className="progress-grid">
              <div className="progress-item">
                <span className="progress-label">Drone ID:</span>
                <span className="progress-value">
                  {displayOrder.drone_id || displayOrder.droneId}
                </span>
              </div>
              {droneLocation && (
                <div className="progress-item">
                  <span className="progress-label">Current Position:</span>
                  <span className="progress-value">
                    {droneLocation.lat.toFixed(4)}, {droneLocation.lng.toFixed(4)}
                  </span>
                </div>
              )}
              {remainingDistance !== null && (
                <div className="progress-item">
                  <span className="progress-label">Distance to Delivery:</span>
                  <span className="progress-value progress-distance">
                    {remainingDistance < 1
                      ? Math.round(remainingDistance * 1000) + " m"
                      : remainingDistance.toFixed(2) + " km"}
                  </span>
                </div>
              )}
              <div className="progress-item">
                <span className="progress-label">Status:</span>
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
            <h4>Customer</h4>
            <p>
              <strong>Name:</strong>
              <span>
                {displayOrder.customer?.name ||
                  displayOrder.user?.full_name ||
                  displayOrder.userName ||
                  displayOrder.full_name ||
                  "-"}
              </span>
            </p>
            <p>
              <strong>ID:</strong>
              <span>{displayOrder.user_id || displayOrder.userId || "-"}</span>
            </p>
            <p>
              <strong>Phone:</strong>
              <span>
                {displayOrder.customer?.phone ||
                  displayOrder.user?.phone ||
                  displayOrder.phone ||
                  "N/A"}
              </span>
            </p>
            <p>
              <strong>Address:</strong>
              <span>
                {displayOrder.customer?.address ||
                  displayOrder.delivery_address ||
                  displayOrder.address ||
                  "-"}
              </span>
            </p>
          </section>

          <section className="odm-section odm-half">
            <h4>Restaurant</h4>
            <p>
              <strong>Name:</strong>
              <span>
                {displayOrder.restaurant?.name || displayOrder.restaurantName || "N/A"}
              </span>
            </p>
            <p>
              <strong>Address:</strong>
              <span>
                {displayOrder.restaurant?.address || displayOrder.restaurantAddress || "N/A"}
              </span>
            </p>
            <p>
              <strong>ID:</strong>
              <span className="value-highlight">
                {displayOrder.restaurant_id || displayOrder.restaurantId || "-"}
              </span>
            </p>
            <p>
              <strong>Phone:</strong>
              <span>
                {displayOrder.restaurant?.phone || displayOrder.restaurantPhone || "N/A"}
              </span>
            </p>
          </section>
        </div>

        {/* Row 2: Order Status (with Order Info merged) */}
        <section className="odm-section">
          <h4>Order Status</h4>
          <p>
            <strong>Status:</strong>
            <span className="odm-status-badge">
              {displayOrder.status || "Unknown"}
            </span>
          </p>
          <p>
            <strong>Payment Method:</strong>
            <span className="odm-payment-badge">
              {displayOrder.payment_method || displayOrder.paymentMethod || "N/A"}
            </span>
          </p>
          <p>
            <strong>Payment Status:</strong>
            <span>
              {displayOrder.payment_status || displayOrder.paymentStatus || "N/A"}
            </span>
          </p>
          <p>
            <strong>Order Placed:</strong>
            <span>{orderPlacedTime}</span>
          </p>
          {completedTime && (
            <p>
              <strong>Completed:</strong>
              <span>{completedTime}</span>
            </p>
          )}
        </section>

        {/* Row 3: Order & Payment Info combined */}
        <section className="odm-section">
          <h4>Order Summary</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            <div style={{ paddingLeft: "15px" }} >
              <h5 style={{ marginBottom: "10px" }} >Items</h5>
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
                  <li>No items</li>
                )}
              </ul>
            </div>
            <div>
              <h5 style={{ marginBottom: "10px" }} >Payment Details</h5>
              <div style={{ paddingLeft: "20x" }} >
                <p>
                  <strong>Subtotal:</strong>
                  <span className="odm-amount" style={{ color: "#000" }} >
                    {formatCurrency(
                      displayOrder.subtotal || displayOrder.sub_total || 0
                    )}
                  </span>
                </p>
                <p>
                  <strong>Delivery Fee:</strong>
                  <span className="odm-amount" style={{ color: "#000" }} >
                    {formatCurrency(displayOrder.delivery_fee || displayOrder.deliveryFee || 0)}
                  </span>
                </p>
                <p>
                  <strong>Discount:</strong>
                  <span className="odm-amount odm-discount">
                    -{formatCurrency(
                      displayOrder.discount_amount || displayOrder.discountAmount || 0
                    )}
                  </span>
                </p>
                <p style={{ borderTop: "1px solid #ddd", paddingTop: "8px", marginTop: "8px" }}>
                  <strong>Total:</strong>
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
          <h4>Delivery Info</h4>
          <p>
            <strong>Drone:</strong>
            <span>
              {displayOrder.drone_id || displayOrder.droneId
                ? `${displayOrder.drone_id || displayOrder.droneId} - ${displayOrder.drone_name || displayOrder.droneName || ""}`.trim()
                : "Not assigned"}
            </span>
          </p>
          <p>
            <strong>Restaurant Address:</strong>
            <span>
              {displayOrder.restaurant?.address || displayOrder.restaurantAddress || "N/A"}
            </span>
          </p>
          <p>
            <strong>Customer Address:</strong>
            <span>
              {displayOrder.customer?.address ||
                displayOrder.delivery_address ||
                displayOrder.address ||
                "N/A"}
            </span>
          </p>
          {(displayOrder.special_instructions || displayOrder.specialInstructions) && (
            <p>
              <strong>Special Instructions:</strong>
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
