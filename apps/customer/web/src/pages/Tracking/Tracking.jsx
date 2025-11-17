import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrackingLogic } from "customer-shared";
import { TrackingHeader, DeliveryStatusCard, OrderTimeline } from "customer-shared";
import { formatCurrency } from "shared-utils";
import { droneProgressService } from "shared-services";
import "./Tracking.css";
import { MdLocationOn, MdRestaurant, MdHome, MdArrowBack, MdFlight } from "react-icons/md";
import {
  TrackingLoadingError,
  TrackingOrderDetails,
  TrackingControls,
} from "../../components/Tracking";

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const {
    order,
    loading,
    error,
    confirming,
    droneProgress,
    arrivalTime,
    droneArrived,
    confirmDelivery,
    refreshTracking,
  } = useTrackingLogic(id);

  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTracking();
    } catch (err) {
      console.error("Refresh error:", err);
      alert("Failed to refresh order data");
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    if (!order || !autoRefreshEnabled) return;

    const activeStatuses = [
      "confirmed",
      "preparing",
      "ready",
      "picking_up",
      "picked_up",
      "delivering",
    ];

    if (!activeStatuses.includes(order.status)) return;

    const intervalId = setInterval(async () => {
      try {
        await refreshTracking();
      } catch (error) {
        console.error("Auto-refresh error:", error);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [order, autoRefreshEnabled, refreshTracking]);

  // Show loading or error state
  const errorState = <TrackingLoadingError loading={loading} error={error} orderId={id} />;
  if (loading || error || !order) return errorState;

  const pickupGPS = order.pickup_gps || { lat: 10.776, lng: 106.7 };
  const dropoffGPS = order.dropoff_gps || { lat: 10.7729, lng: 106.6981 };

  return (
    <div className="tracking-page">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          background: "#f0f0f0",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <MdArrowBack /> Back
      </button>

      {/* Header */}
      <TrackingHeader order={order} onRefresh={handleRefresh} refreshing={refreshing} />

      {/* Controls */}
      <TrackingControls
        refreshing={refreshing}
        autoRefreshEnabled={autoRefreshEnabled}
        onRefresh={handleRefresh}
        onToggleAutoRefresh={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
      />

      {/* Order Timeline */}
      <div className="order-timeline-section">
        <div className="timeline-header">
          <h3>Order Journey</h3>
          <button className="btn-view-details" onClick={() => setShowOrderDetails(true)}>
            View Order Details
          </button>
        </div>
        <OrderTimeline order={order} />
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button className="modal-close" onClick={() => setShowOrderDetails(false)}>
                ×
              </button>
            </div>
            <TrackingOrderDetails order={order} />
          </div>
        </div>
      )}

      {/* Delivery Status */}
      <DeliveryStatusCard
        order={order}
        droneProgress={droneProgress}
        droneArrived={droneArrived}
        onConfirmDelivery={confirmDelivery}
        confirming={confirming}
      />

      {/* Map Section */}
      <div className="delivery-map-section" style={{ marginTop: "30px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MdLocationOn size={24} color="#ff6b35" />
          Delivery Route
        </h3>

        {/* Legend - Restaurant & Delivery Info */}
        <div
          style={{
            display: "flex",
            gap: "30px",
            padding: "15px",
            background: "#f5f5f5",
            borderRadius: "8px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MdRestaurant size={24} color="#ff6b35" />
            <span>
              <b>Restaurant:</b> {order.restaurant?.name || order.restaurantName || "Restaurant"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MdHome size={24} color="#4caf50" />
            <span>
              <b>Delivery:</b> {order.customer?.address || order.customerAddress || order.delivery_address || order.address || "Your Location"}
            </span>
          </div>
          {order.drone_id && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MdFlight size={24} color="#ff6b35" style={{ transform: "rotate(45deg)" }} />
              <span>
                <b>Drone:</b> {order.drone_id}
              </span>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="map-container" style={{ position: "relative", marginBottom: "20px" }}>
          <iframe
            title="Delivery Map"
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: "8px" }}
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${dropoffGPS.lng - 0.02
              },${dropoffGPS.lat - 0.02},${dropoffGPS.lng + 0.02},${dropoffGPS.lat + 0.02
              }&layer=mapnik&marker=${dropoffGPS.lat},${dropoffGPS.lng}`}
          />
        </div>

        {/* GPS Position */}
        {order.current_gps && order.status === "delivering" && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "#e3f2fd",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <b>Drone Position:</b> {order.current_gps.lat?.toFixed(6)},{" "}
            {order.current_gps.lng?.toFixed(6)}
          </div>
        )}
      </div>

      {/* Items Table
      {order.items && order.items.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Order Items</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "12px" }}>Item</th>
                <th style={{ textAlign: "center", padding: "12px" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "12px" }}>Price</th>
                <th style={{ textAlign: "right", padding: "12px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{item.name || item.food_name}</td>
                  <td style={{ textAlign: "center", padding: "12px" }}>
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px" }}>
                    {formatCurrency(item.unit_price || item.price || 0)}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px" }}>
                    {formatCurrency(
                      (item.unit_price || item.price || 0) * item.quantity
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}
    </div>
  );
};

export default Tracking;
