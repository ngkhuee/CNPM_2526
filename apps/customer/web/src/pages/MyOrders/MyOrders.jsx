import React, { useContext, useState } from "react";
import { OrderContext, AuthContext } from "customer-shared";
import { reviewService, orderService, droneService } from "shared-services";
import { formatCurrency } from "shared-utils";
import "./MyOrders.css";
import { useNavigate } from "react-router-dom";
import {
  MdLocationOn,
  MdStar,
  MdStarBorder,
  MdCheckCircle,
  MdError,
  MdRefresh,
} from "react-icons/md";

const MyOrders = () => {
  const { orders, fetchUserOrders } = useContext(OrderContext);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("current"); // "current" or "history"

  // Track status changes and auto-redirect to tracking
  React.useEffect(() => {
    if (orders.length === 0) return;

    // Check each order for status change
    orders.forEach((order) => {
      const prevOrder = previousOrders.find((o) => o.id === order.id);

      // If status changed from pending → preparing/ready/in_delivery
      if (
        prevOrder &&
        prevOrder.status === "pending" &&
        ["preparing", "ready", "in_delivery"].includes(order.status)
      ) {
        console.log(
          `🔔 Order #${order.id} confirmed! Redirecting to tracking...`
        );
        alert(`Order #${order.id} has been confirmed! 🎉`);
        navigate(`/tracking/${order.id}`);
      }
    });

    // Update previous orders state
    setPreviousOrders(orders);
  }, [orders, navigate]);

  const handleOpenReview = (order) => {
    setSelectedOrder(order);
    setShowReviewModal(true);
    setRating(5);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder || !user) return;

    try {
      setSubmitting(true);
      await reviewService.create({
        orderId: selectedOrder.id,
        userId: user.id,
        restaurantId: selectedOrder.restaurantId,
        rating,
        comment,
      });

      alert("Thank you for your review!");
      setShowReviewModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserOrders();
      alert("Order list updated!");
    } catch (error) {
      console.error("Refresh error:", error);
      alert("Error loading orders");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelOrder = async (order) => {
    // Check if order can be cancelled (only paid, confirmed, preparing)
    const cancellableStatuses = ["paid", "confirmed", "preparing"];
    if (!cancellableStatuses.includes(order.status)) {
      alert("This order cannot be cancelled at this stage");
      return;
    }

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel order #${order.id}?\nThis action cannot be undone.`
    );
    if (!confirmCancel) return;

    try {
      console.log("🚫 Cancelling order:", order.id);

      // Step 1: Update order status to cancelled
      await orderService.updateStatus(order.id, "cancelled");

      // Step 2: If drone was assigned, release it
      if (order.droneId || order.drone_id) {
        const droneId = order.droneId || order.drone_id;
        console.log("🚁 Releasing drone:", droneId);
        try {
          await droneService.updateDrone(droneId, {
            status: "available",
            assigned_order_id: null,
          });
          console.log("✅ Drone released successfully");
        } catch (error) {
          console.warn("⚠️ Could not release drone:", error);
          // Continue anyway - order is cancelled
        }
      }

      alert("Order cancelled successfully!");

      // Refresh orders list
      await fetchUserOrders();
    } catch (error) {
      console.error("❌ Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  // Split orders into current and history
  const currentOrders = orders
    .filter((order) =>
      [
        "pending",
        "paid",
        "confirmed",
        "preparing",
        "ready",
        "delivering",
        "picking_up",
        "picked_up",
      ].includes(order.status)
    )
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt)
    );

  const historyOrders = orders
    .filter((order) =>
      ["delivered", "cancelled", "rejected"].includes(order.status)
    )
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt)
    );

  const displayOrders = activeTab === "current" ? currentOrders : historyOrders;

  return (
    <div className="myorders">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Your Order</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 15px",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: refreshing ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          <MdRefresh /> {refreshing ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Tab buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          borderBottom: "2px solid #e0e0e0",
        }}
      >
        <button
          onClick={() => setActiveTab("current")}
          style={{
            padding: "12px 24px",
            background: activeTab === "current" ? "#ff6b35" : "transparent",
            color: activeTab === "current" ? "white" : "#666",
            border: "none",
            borderBottom:
              activeTab === "current" ? "3px solid #ff6b35" : "none",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: activeTab === "current" ? "600" : "400",
            transition: "all 0.3s ease",
          }}
        >
          Current Order ({currentOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "12px 24px",
            background: activeTab === "history" ? "#ff6b35" : "transparent",
            color: activeTab === "history" ? "white" : "#666",
            border: "none",
            borderBottom:
              activeTab === "history" ? "3px solid #ff6b35" : "none",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: activeTab === "history" ? "600" : "400",
            transition: "all 0.3s ease",
          }}
        >
          History ({historyOrders.length})
        </button>
      </div>

      {displayOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>
            {activeTab === "current"
              ? "You have no orders in progress"
              : "You have no completed orders"}
          </p>
          {activeTab === "current" && (
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                background: "#ff6b35",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Order Now
            </button>
          )}
        </div>
      ) : (
        displayOrders.map((order) => (
          <div key={order.id || order._id} className="order-card">
            <h3>Order #{order.id || order._id}</h3>

            {/* Restaurant info */}
            {(order.restaurantName ||
              order.restaurant?.name ||
              order.restaurantId ||
              order.restaurant_id) && (
              <p
                style={{
                  color: "#ff6b35",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                <b>🍽️ Restaurant:</b>{" "}
                {order.restaurantName ||
                  order.restaurant?.name ||
                  `Belga Pizza`}
              </p>
            )}

            <p>
              <b>📋 Status:</b>{" "}
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  textTransform: "capitalize",
                  background:
                    order.status === "delivered"
                      ? "#d4edda"
                      : order.status === "cancelled" ||
                          order.status === "rejected"
                        ? "#f8d7da"
                        : order.status === "delivering" ||
                            order.status === "picking_up" ||
                            order.status === "picked_up"
                          ? "#cce5ff"
                          : order.status === "ready"
                            ? "#d4edda"
                            : order.status === "preparing"
                              ? "#d1ecf1"
                              : order.status === "confirmed"
                                ? "#cfe2ff"
                                : "#fff3cd",
                  color:
                    order.status === "delivered"
                      ? "#155724"
                      : order.status === "cancelled" ||
                          order.status === "rejected"
                        ? "#721c24"
                        : order.status === "delivering" ||
                            order.status === "picking_up" ||
                            order.status === "picked_up"
                          ? "#004085"
                          : order.status === "ready"
                            ? "#155724"
                            : order.status === "preparing"
                              ? "#0c5460"
                              : order.status === "confirmed"
                                ? "#084298"
                                : "#856404",
                }}
              >
                {order.status}
              </span>
            </p>
            <p>
              <b>📅 Order Date:</b>{" "}
              {new Date(order.createdAt || order.created_at).toLocaleString(
                "vi-VN",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                }
              )}
            </p>

            {/* Customer info */}
            {order.customer && (
              <>
                <p>
                  <b>Customer:</b> {order.customer.name}
                </p>
                <p>
                  <b>Phone:</b> {order.customer.phone}
                </p>
                <p>
                  <b>Address:</b> {order.customer.address}
                </p>
              </>
            )}

            <div className="order-actions">
              {/* Only show Track button if order is confirmed or later */}
              {!["paid", "pending"].includes(order.status) && (
                <button
                  className="track-btn"
                  onClick={() => navigate(`/tracking/${order.id || order._id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  <MdLocationOn /> Track Order
                </button>
              )}

              {/* Cancel button for orders that can be cancelled */}
              {["paid", "confirmed", "preparing"].includes(order.status) && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelOrder(order)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <MdError /> Cancel Order
                </button>
              )}

              {order.status === "delivered" && (
                <button
                  className="review-btn"
                  onClick={() => handleOpenReview(order)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  <MdStar /> Rate Order
                </button>
              )}

              {/* Show waiting message for paid orders */}
              {order.status === "paid" && (
                <p
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    fontStyle: "italic",
                    margin: "10px 0",
                  }}
                >
                  Waiting for restaurant confirmation...
                </p>
              )}
            </div>

            {order.items && order.items.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {formatCurrency(item.unit_price || item.price || 0)}
                      </td>
                      <td>
                        {formatCurrency(
                          item.subtotal ||
                            (item.unit_price || item.price || 0) * item.quantity
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p className="order-total">
              <b>Total:</b>{" "}
              {formatCurrency(order.total_amount || order.totalAmount || 0)}
            </p>
            <hr />
          </div>
        ))
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div
          className="review-modal-overlay"
          onClick={() => setShowReviewModal(false)}
        >
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rate Order</h3>
            <p>Order #{selectedOrder.id || selectedOrder._id}</p>

            <div className="rating-section">
              <label>Food Quality:</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${rating >= star ? "filled" : ""}`}
                    onClick={() => setRating(star)}
                    style={{
                      cursor: "pointer",
                      fontSize: "28px",
                      color: rating >= star ? "#ffc107" : "#ddd",
                    }}
                  >
                    {rating >= star ? <MdStar /> : <MdStarBorder />}
                  </span>
                ))}
              </div>
              <p>{rating}/5 stars</p>
            </div>

            <div className="comment-section">
              <label>Your comment:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleSubmitReview} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button onClick={() => setShowReviewModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
