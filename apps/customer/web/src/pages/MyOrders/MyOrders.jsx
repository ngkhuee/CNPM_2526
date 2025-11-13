import React, { useContext, useState } from "react";
import {
  OrderContext,
  AuthContext,
  useOrderActions,
  useReview,
  useOrderFiltering,
  OrderCardHeader,
  OrderItemsTable,
  ReviewModal,
} from "customer-shared";
import { formatCurrency } from "shared-utils";
import "./MyOrders.css";
import { useNavigate } from "react-router-dom";
import { MdRefresh } from "react-icons/md";

const MyOrders = () => {
  const { orders, fetchUserOrders } = useContext(OrderContext);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Use new hooks for business logic
  const { cancelOrder, canCancelOrder } = useOrderActions();
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

  const handleOpenReview = (orderItem, orderId) => {
    console.log("👉 handleOpenReview - item:", orderItem, "orderId:", orderId);
    if (!orderId || !orderItem) return;
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
      if (!order) {
        alert("Order not found");
        return;
      }

      // Get foodId - already mapped in orderService
      const foodId = selectedOrderItem.foodId;
      console.log("🎯 handleSubmitReview - selectedOrderItem:", selectedOrderItem);
      console.log("🎯 handleSubmitReview - foodId:", foodId);
      if (!foodId) {
        console.error("❌ Food ID not found in item:", selectedOrderItem);
        alert("Food ID not found");
        return;
      }

      const result = await submitReview({
        foodId: foodId,
        userId: user.id,
        restaurantId: order?.restaurantId || order?.restaurant_id,
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
          [foodId]: true,
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

  const handleTrackOrder = (order) => {
    navigate(`/tracking/${order.id || order._id}`);
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setSelectedOrderItem(null);
    setSelectedOrderId(null);
  };

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
            <OrderCardHeader
              order={order}
              onTrackClick={handleTrackOrder}
              onCancelClick={handleCancelOrder}
            />

            <OrderItemsTable
              items={order.items}
              orderStatus={order.status}
              reviewedFoods={reviewedFoods}
              orderId={order.id || order._id}
              restaurantId={order.restaurantId || order.restaurant_id}
              onReviewClick={handleOpenReview}
            />

            <p className="order-total">
              <b>Total:</b>{" "}
              {formatCurrency(order.total_amount || order.totalAmount || 0)}
            </p>
            <hr />
          </div>
        ))
      )}

      <ReviewModal
        isOpen={showReviewModal}
        itemName={selectedOrderItem?.name}
        rating={rating}
        comment={comment}
        submitting={submitting}
        onRatingChange={setRating}
        onCommentChange={setComment}
        onSubmit={handleSubmitReview}
        onClose={handleReviewModalClose}
      />
    </div>
  );
};

export default MyOrders;
