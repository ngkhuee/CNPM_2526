import React, { useContext, useState } from "react";
import {
  OrderContext,
  AuthContext,
  useOrderActions,
  useReview,
  useOrderFiltering,
  getStatusBadgeStyle,
} from "customer-shared";
import {
  canCancelOrder,
  canReviewOrder,
} from "customer-shared";
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
  MdCancel,
} from "react-icons/md";

const MyOrders = () => {
  const { orders, fetchUserOrders } = useContext(OrderContext);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Use new hooks for business logic
  const { cancelOrder } = useOrderActions();
  const { submitReview, getReviewedFoodIds } = useReview();
  const { currentOrders, historyOrders } = useOrderFiltering(orders);

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewedFoods, setReviewedFoods] = useState({});
  const [activeTab, setActiveTab] = useState("current");

  // Check which foods have been reviewed by this user
  React.useEffect(() => {
    const checkReviewed = async () => {
      if (!user?.id) return;
      const reviewed = await getReviewedFoodIds(user.id);
      setReviewedFoods(reviewed);
    };
    checkReviewed();
  }, [user?.id, getReviewedFoodIds]);

  const handleOpenReview = (orderItem, orderId, restaurantId) => {
    setSelectedOrderItem(orderItem);
    setSelectedOrderId(orderId);
    setShowReviewModal(true);
    setRating(5);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!selectedOrderItem || !user || !selectedOrderId) return;

    try {
      setSubmitting(true);

      const order = orders.find((o) => o.id === selectedOrderId);

      const result = await submitReview({
        foodId: selectedOrderItem.foodId || selectedOrderItem.id,
        userId: user.id,
        restaurantId: order?.restaurantId,
        orderId: selectedOrderId,
        rating,
        comment,
      });

      if (result.success) {
        alert(result.message || "Thank you for your review!");
        setShowReviewModal(false);
        setSelectedOrderItem(null);
        setSelectedOrderId(null);

        // Mark this food as reviewed
        setReviewedFoods((prev) => ({
          ...prev,
          [selectedOrderItem.foodId || selectedOrderItem.id]: true,
        }));
      } else {
        alert(result.message || "Error submitting review");
      }
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
    if (!canCancelOrder(order)) {
      alert("This order cannot be cancelled at this stage");
      return;
    }

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel order #${order.id}?\nThis action cannot be undone.`
    );
    if (!confirmCancel) return;

    try {
      const result = await cancelOrder(order);

      if (result.success) {
        alert(result.message || "Order cancelled successfully!");
        await fetchUserOrders();
      } else {
        alert(result.message || "Failed to cancel order. Please try again.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const displayOrders =
    activeTab === "current" ? currentOrders : historyOrders;

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
                  <b>Restaurant:</b>{" "}
                  {order.restaurantName ||
                    order.restaurant?.name ||
                    `Belga Pizza`}
                </p>
              )}

            <p>
              <b>Status:</b>{" "}
              <span style={getStatusBadgeStyle(order.status)}>
                {order.status}
              </span>
            </p>
            <p>
              <b>Order Date:</b>{" "}
              {new Date(order.createdAt || order.created_at).toLocaleString(
                "vi-VN",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                }
              )}
            </p>

            {/* Show rejection reason if order was rejected */}
            {order.status === "rejected" && order.rejection_reason && (
              <div
                style={{
                  background: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "6px",
                  padding: "12px",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                <p style={{ margin: 0, color: "#721c24", fontSize: "14px" }}>
                  <b>
                    <MdCancel /> Rejection Reason:
                  </b>{" "}
                  {order.rejection_reason}
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: "#721c24",
                    fontSize: "13px",
                    fontStyle: "italic",
                  }}
                >
                  Your payment will be refunded within 3-5 business days.
                </p>
              </div>
            )}

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
              {/* Only show Track button if order can be tracked */}
              {order.status !== "paid" && order.status !== "pending" && (
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
              {canCancelOrder(order) && (
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
                    {canReviewOrder(order) && <th>Review</th>}
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
                      {canReviewOrder(order.status) && (
                        <td>
                          {reviewedFoods[item.foodId || item.id] ? (
                            <button
                              style={{
                                background: "#6c757d",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor: "not-allowed",
                                opacity: 0.6,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              disabled
                            >
                              <MdCheckCircle size={14} /> Reviewed
                            </button>
                          ) : (
                            <button
                              style={{
                                background: "#ff9800",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "all 0.2s ease",
                              }}
                              onClick={() =>
                                handleOpenReview(
                                  item,
                                  order.id,
                                  order.restaurantId
                                )
                              }
                              onMouseEnter={(e) => {
                                e.target.style.background = "#f57c00";
                                e.target.style.transform = "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "#ff9800";
                                e.target.style.transform = "translateY(0)";
                              }}
                            >
                              <MdStar size={14} /> Rate
                            </button>
                          )}
                        </td>
                      )}
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
      {showReviewModal && selectedOrderItem && (
        <div
          className="review-modal-overlay"
          onClick={() => setShowReviewModal(false)}
        >
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rate Food</h3>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
              {selectedOrderItem.name}
            </p>

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
                placeholder="Share your experience with this dish..."
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
