import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderTimeline } from "customer-shared";
import { formatCurrency } from "shared-utils";
import { droneProgressService } from "shared-services";
import { DroneIcon, DroneTrackingMap } from "shared-ui";
import "./Tracking.css";
import { MdLocationOn, MdRestaurant, MdHome, MdArrowBack } from "react-icons/md";
import {
  TrackingLoadingError,
  TrackingOrderDetails,
  TrackingControls,
  OrderStatusHeader,
  ArrivedPopup,
} from "../../components/Tracking";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import { useDeliveryTracking } from "../../hooks/useDeliveryTracking";

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Use new hooks with adaptive polling
  const { order, loading, refreshing, handleRefresh, refetch, setAutoRefresh } = useOrderTracking(id);
  const {
    currentStatusIndex,
    isDelivered,
    showMap,
    showArrivedPopup,
    handleCloseArrivedPopup,
    handleConfirmDelivery,
  } = useDeliveryTracking(order, refetch);

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Sync auto-refresh state
  useEffect(() => {
    setAutoRefresh(autoRefreshEnabled);
  }, [autoRefreshEnabled]);

  // Show loading state
  if (loading || !order) return <TrackingLoadingError loading={loading} error={null} orderId={id} />;

  // Handle both lat/lng and latitude/longitude formats
  const normalizeGPS = (gps) => {
    if (!gps) return { lat: 10.776, lng: 106.7 };
    return {
      lat: gps.lat || gps.latitude || 10.776,
      lng: gps.lng || gps.longitude || 106.7,
    };
  };

  const pickupGPS = normalizeGPS(order.pickup_gps);
  const dropoffGPS = normalizeGPS(order.dropoff_gps);

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
        <MdArrowBack /> Quay lại
      </button>

      {/* Status Header */}
      <OrderStatusHeader order={order} isDelivered={isDelivered} />

      {/* Arrived Popup */}
      <ArrivedPopup
        visible={showArrivedPopup}
        order={order}
        onConfirmDelivery={handleConfirmDelivery}
      />

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
          <h3>Hành trình đơn hàng</h3>
          <button className="btn-view-details" onClick={() => setShowOrderDetails(true)}>
            Xem chi tiết đơn hàng
          </button>
        </div>
        <OrderTimeline order={order} />
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng</h3>
              <button className="modal-close" onClick={() => setShowOrderDetails(false)}>
                ×
              </button>
            </div>
            <TrackingOrderDetails order={order} />
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="delivery-map-section" style={{ marginTop: "30px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MdLocationOn size={24} color="#ff6b35" />
          Tuyến giao hàng
        </h3>

        {/* Drone Tracking Map */}
        {showMap && order && (
          <div style={{ marginBottom: "20px" }}>
            <DroneTrackingMap
              restaurantLocation={{
                lat: pickupGPS.lat,
                lng: pickupGPS.lng,
                name: order.restaurant?.name || order.restaurantName || "Restaurant",
                address: order.pickup_address || "Pickup Location"
              }}
              deliveryLocation={{
                lat: dropoffGPS.lat,
                lng: dropoffGPS.lng,
                address: order.customer?.address || order.customerAddress || order.delivery_address || order.address || "Your Location"
              }}
              droneLocation={order.current_gps ? {
                lat: order.current_gps.lat || order.current_gps.latitude,
                lng: order.current_gps.lng || order.current_gps.longitude
              } : null}
              droneId={order.drone_id}
              droneJourneyStage={order.drone_journey_stage}
              hideBaseLocation={true}
            />
          </div>
        )}

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
            <b>Vị trí Drone:</b> {order.current_gps.lat?.toFixed(6)},{" "}
            {order.current_gps.lng?.toFixed(6)}
          </div>
        )}
      </div>      {/* Items Table
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
