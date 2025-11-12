import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOrderTracking } from "customer-shared";
import { formatCurrency } from "shared-utils";
import { orderService, droneService } from "shared-services";
import "./Tracking.css";
import {
  MdLocalShipping,
  MdCheckCircle,
  MdRefresh,
  MdPayment,
  MdRestaurant,
  MdKitchen,
  MdDoneAll,
  MdFlightTakeoff,
  MdFlight,
  MdDeliveryDining,
  MdLocationOn,
  MdHome,
} from "react-icons/md";

const Tracking = () => {
  const { id } = useParams();
  const { order, loading, refetch } = useOrderTracking(id);
  const [refreshing, setRefreshing] = useState(false);

  const [dronePosition, setDronePosition] = useState(null);
  const [droneProgress, setDroneProgress] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [droneArrived, setDroneArrived] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [arrivalTime, setArrivalTime] = useState(null);

  // Handle confirm delivery
  const handleConfirmDelivery = async () => {
    if (confirming) return;

    try {
      setConfirming(true);

      // Update order status to delivered
      await orderService.update(order.id, { status: "delivered" });

      // Release drone if assigned
      if (order.drone_id) {
        await droneService.update(order.drone_id, {
          status: "available",
          assigned_order_id: null,
        });
      }

      alert("Đã xác nhận nhận hàng thành công!");
      await refetch();
      setDroneArrived(false);
      setArrivalTime(null);
    } catch (error) {
      console.error("Error confirming delivery:", error);
      alert("Lỗi xác nhận nhận hàng. Vui lòng thử lại.");
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    if (order) {
      updateDroneProgress(order.status);

      // Update GPS position if available
      if (order.current_gps) {
        setDronePosition(order.current_gps);
      }

      // Check if drone has arrived (delivering status and progress >= 1)
      if (
        order.status === "delivering" &&
        droneProgress >= 1 &&
        !droneArrived
      ) {
        setDroneArrived(true);
        setArrivalTime(Date.now());
      }
    }
  }, [order, droneProgress]);

  // Auto-confirm after 5 minutes of arrival
  useEffect(() => {
    if (!arrivalTime || order?.status === "delivered" || !droneArrived) return;

    const timeout = setTimeout(
      () => {
        console.log("Auto-confirming delivery after 5 minutes...");
        handleConfirmDelivery();
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearTimeout(timeout);
  }, [arrivalTime, order?.status, droneArrived]);

  // Auto-refresh every 3 seconds for active orders
  useEffect(() => {
    if (!order || !autoRefreshEnabled) return;

    // Only auto-refresh for active delivery statuses
    const activeStatuses = [
      "confirmed",
      "preparing",
      "ready",
      "picking_up",
      "picked_up",
      "delivering",
    ];
    if (!activeStatuses.includes(order.status)) {
      return;
    }

    const intervalId = setInterval(async () => {
      console.log("Auto-refreshing tracking data...");
      try {
        await refetch();
      } catch (error) {
        console.error("Auto-refresh error:", error);
      }
    }, 3000); // 3 seconds

    // Cleanup interval on unmount
    return () => {
      console.log("Stopping auto-refresh");
      clearInterval(intervalId);
    };
  }, [order, autoRefreshEnabled, refetch]);

  // Update drone progress based on order status and GPS
  const updateDroneProgress = (status) => {
    switch (status) {
      case "pending":
      case "paid":
        setDroneProgress(0);
        break;
      case "confirmed":
        setDroneProgress(0.1);
        break;
      case "preparing":
        setDroneProgress(0.2);
        break;
      case "ready":
        setDroneProgress(0.3);
        break;
      case "picking_up":
        setDroneProgress(0.4);
        break;
      case "picked_up":
        setDroneProgress(0.5);
        break;
      case "delivering":
        // Calculate progress based on GPS position if available
        if (order?.current_gps && order?.pickup_gps && order?.dropoff_gps) {
          const pickup = order.pickup_gps;
          const dropoff = order.dropoff_gps;
          const current = order.current_gps;

          // Calculate distances
          const totalDistance = Math.sqrt(
            Math.pow(dropoff.lat - pickup.lat, 2) +
            Math.pow(dropoff.lng - pickup.lng, 2)
          );
          const currentDistance = Math.sqrt(
            Math.pow(current.lat - pickup.lat, 2) +
            Math.pow(current.lng - pickup.lng, 2)
          );

          // Progress from 0.5 to 1.0 during delivery
          const deliveryProgress = Math.min(currentDistance / totalDistance, 1);
          setDroneProgress(0.5 + deliveryProgress * 0.5);
        } else {
          setDroneProgress(0.7);
        }
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
        <p>Not found order #{id}</p>
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2>Order #{order.id || order._id}</h2>
          <button
            onClick={async () => {
              setRefreshing(true);
              try {
                await refetch();
              } catch (error) {
                console.error("Refresh error:", error);
                alert("Failed to refresh order data");
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: refreshing ? "#9e9e9e" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: refreshing ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
              opacity: refreshing ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!refreshing) {
                e.target.style.background = "#45a049";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!refreshing) {
                e.target.style.background = "#4caf50";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }
            }}
          >
            <MdRefresh
              size={18}
              style={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            {refreshing ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Restaurant info */}
        {(order.restaurantName ||
          order.restaurant?.name ||
          order.restaurantId) && (
            <p
              style={{ color: "#ff6b35", fontWeight: "600", marginBottom: "8px" }}
            >
              <span>Restaurant:</span>{" "}
              {order.restaurantName ||
                order.restaurant?.name ||
                `Restaurant ID: ${order.restaurantId}`}
            </p>
          )}

        <p style={{ marginBottom: "15px" }}>
          <strong>Status:</strong>{" "}
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "15px",
              fontSize: "14px",
              fontWeight: "600",
              color: "white",
              backgroundColor:
                order.status === "delivered"
                  ? "#4caf50"
                  : order.status === "delivering" ||
                    order.status === "picking_up" ||
                    order.status === "picked_up"
                    ? "#2196f3"
                    : order.status === "preparing" || order.status === "ready"
                      ? "#ff9800"
                      : order.status === "confirmed"
                        ? "#8bc34a"
                        : order.status === "paid"
                          ? "#9c27b0"
                          : "#757575",
            }}
          >
            {order.status === "pending" && "Pending"}
            {order.status === "paid" && "Paid"}
            {order.status === "confirmed" && "Confirmed"}
            {order.status === "preparing" && "Preparing"}
            {order.status === "ready" && "Ready"}
            {order.status === "picking_up" && "Picking Up"}
            {order.status === "picked_up" && "Picked Up"}
            {order.status === "delivering" && "Delivering"}
            {order.status === "delivered" && "Delivered"}
            {order.status === "cancelled" && "Cancelled"}
          </span>
        </p>
        <div className="customer-info">
          <p>
            <span>Customer:</span>{" "}
            {order.customerName || order.customer?.name || "N/A"}
          </p>
          <p>
            <span>Phone:</span>{" "}
            {order.customerPhone || order.customer?.phone || "N/A"}
          </p>
          <p>
            <span>Address:</span>{" "}
            {order.customerAddress || order.customer?.address || "N/A"}
          </p>
          <p>
            <span>Total:</span>{" "}
            {formatCurrency(order.totalAmount || order.total_amount || 0)}
          </p>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="order-timeline">
        <h3
          style={{ marginBottom: "30px", textAlign: "center", color: "#333" }}
        >
          Order Journey
        </h3>
        <div className="timeline-container">
          {[
            {
              status: "paid",
              label: "Paid",
              icon: <MdPayment />,
              description: "Payment completed",
            },
            {
              status: "confirmed",
              label: "Confirmed",
              icon: <MdRestaurant />,
              description: "Restaurant confirmed",
            },
            {
              status: "preparing",
              label: "Preparing",
              icon: <MdKitchen />,
              description: "Food is being prepared",
            },
            {
              status: "ready",
              label: "Ready",
              icon: <MdDoneAll />,
              description: "Ready for pickup",
            },
            {
              status: "picking_up",
              label: "Picking Up",
              icon: <MdFlightTakeoff />,
              description: "Drone picking up order",
            },
            {
              status: "picked_up",
              label: "Picked Up",
              icon: <MdFlight />,
              description: "Order picked up",
            },
            {
              status: "delivering",
              label: "Delivering",
              icon: <MdLocalShipping />,
              description: "On the way to you",
            },
            {
              status: "delivered",
              label: "Delivered",
              icon: <MdCheckCircle />,
              description: "Delivered successfully!",
            },
          ].map((stage, index, stages) => {
            const statusOrder = [
              "paid",
              "confirmed",
              "preparing",
              "ready",
              "picking_up",
              "picked_up",
              "delivering",
              "delivered",
            ];
            const currentIndex = statusOrder.indexOf(order.status);
            const stageIndex = statusOrder.indexOf(stage.status);
            const isCompleted = stageIndex <= currentIndex;
            const isActive = stageIndex === currentIndex;

            return (
              <div
                key={stage.status}
                className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
              >
                <div className="timeline-icon">{stage.icon}</div>
                <div className="timeline-content">
                  <div className="timeline-label">{stage.label}</div>
                  <div className="timeline-description">
                    {stage.description}
                  </div>
                  {isCompleted && order.updated_at && (
                    <div className="timeline-time">
                      {new Date(order.updated_at).toLocaleString("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  )}
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`timeline-line ${isCompleted ? "completed" : ""}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Map Section */}
      <div className="delivery-map-section">
        <div className="map-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MdLocationOn size={24} color="#ff6b35" />
            Delivery Route
          </h3>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
            />
            Auto-refresh (3s)
          </label>
        </div>

        <div className="map-container" style={{ position: "relative" }}>
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

          {/* Drone Marker Overlay - Show during delivery */}
          {["ready", "picking_up", "picked_up", "delivering"].includes(
            order.status
          ) && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "450px",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                {/* Drone Icon */}
                <div
                  style={{
                    position: "absolute",
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: "translate(-50%, -50%)",
                    transition: "all 2s linear",
                    animation: "drone-pulse 2s infinite",
                  }}
                >
                  <MdFlight
                    size={40}
                    color="#2196f3"
                    style={{
                      filter: "drop-shadow(0 4px 8px rgba(33, 150, 243, 0.5))",
                      transform: "rotate(45deg)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "45px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(33, 150, 243, 0.9)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {order.drone_id || "Drone"}
                  </div>
                </div>

                {/* Path Line from Restaurant to Customer */}
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="5"
                      refY="5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 5, 0 10" fill="#ff6b35" />
                    </marker>
                  </defs>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#ff6b35"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    markerEnd="url(#arrowhead)"
                    opacity="0.7"
                  />
                  {/* Restaurant Marker */}
                  <circle
                    cx={start.x}
                    cy={start.y}
                    r="8"
                    fill="#ff6b35"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Customer Marker */}
                  <circle
                    cx={end.x}
                    cy={end.y}
                    r="8"
                    fill="#4caf50"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}
        </div>

        <div className="map-legend">
          <div className="legend-item">
            <MdRestaurant size={24} color="#ff6b35" />
            <span>Restaurant: {order.restaurantName}</span>
          </div>
          <div className="legend-item">
            <MdHome size={24} color="#4caf50" />
            <span>Delivery: {order.customer?.address || "N/A"}</span>
          </div>
          {order.drone_id && (
            <div className="legend-item">
              <MdLocalShipping size={24} color="#2196f3" />
              <span>Drone: {order.drone_id}</span>
            </div>
          )}
        </div>

        <div className="delivery-status-card">
          <div className="status-icon">
            {order.status === "delivered" ? (
              <MdCheckCircle size={40} color="white" />
            ) : order.status === "delivering" ||
              order.status === "picking_up" ||
              order.status === "picked_up" ? (
              <MdLocalShipping size={40} color="white" />
            ) : (
              <MdKitchen size={40} color="white" />
            )}
          </div>
          <div className="status-text">
            {order.status === "delivered" && "Delivered successfully!"}
            {order.status === "delivering" &&
              `On the way... (${Math.round(droneProgress * 100)}%)`}
            {order.status === "picked_up" && "Drone has picked up your order"}
            {order.status === "picking_up" && "Drone is picking up the order"}
            {order.status === "ready" && "Order is ready for pickup"}
            {order.status === "preparing" &&
              "Restaurant is preparing your food"}
            {order.status === "confirmed" && "Restaurant confirmed your order"}
            {order.status === "paid" && "Waiting for restaurant confirmation"}
          </div>
          {dronePosition && order.status === "delivering" && (
            <p
              style={{
                fontSize: "12px",
                marginTop: "8px",
                color: "rgba(232, 166, 166, 0.9)",
              }}
            >
              Drone location: {dronePosition.lat?.toFixed(6)},{" "}
              {dronePosition.lng?.toFixed(6)}
            </p>
          )}

          {/* Confirm Received Button - Show when drone arrives */}
          {droneArrived && order.status === "delivering" && (
            <button
              onClick={handleConfirmDelivery}
              disabled={confirming}
              style={{
                marginTop: "15px",
                padding: "12px 24px",
                background: confirming ? "#9e9e9e" : "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: confirming ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                width: "100%",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!confirming) {
                  e.target.style.background = "#45a049";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!confirming) {
                  e.target.style.background = "#4caf50";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                }
              }}
            >
              <MdCheckCircle size={20} />
              {confirming ? "Đang xác nhận..." : "Đã nhận hàng"}
            </button>
          )}

          {/* Auto-confirm countdown */}
          {droneArrived && order.status === "delivering" && arrivalTime && (
            <p
              style={{
                fontSize: "12px",
                marginTop: "8px",
                color: "rgba(255,255,255,0.8)",
                textAlign: "center",
              }}
            >
              Automatic confirmation in 5 minutes if you don't click the button
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;
