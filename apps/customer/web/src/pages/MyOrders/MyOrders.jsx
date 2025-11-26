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
import { Pagination } from "shared-ui";
import "./MyOrders.css";
import { useNavigate } from "react-router-dom";
import { MdRefresh, MdTimer } from "react-icons/md";

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
  const [pendingTimeLeft, setPendingTimeLeft] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Check which foods have been reviewed by this user (only on mount)
  React.useEffect(() => {
    const checkReviewed = async () => {
      if (!user?.id) return;
      const reviewed = await getReviewedFoodIds(user.id);
      setReviewedFoods(reviewed);
    };
    checkReviewed();
  }, [user?.id, getReviewedFoodIds]);

  // Check and auto-cancel expired pending orders (only on mount)
  React.useEffect(() => {
    const checkPendingOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:4000/orders/check-pending-expiry`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
        });
        // Refresh orders list to reflect any cancellations
        await fetchUserOrders();
      } catch (error) {
        console.error("Error checking pending orders:", error);
      }
    };

    checkPendingOrders();
  }, []); // Only run once on mount

  // Update countdown timer every second for pending orders
  React.useEffect(() => {
    const timerInterval = setInterval(() => {
      const newTimeLeft = {};
      const PENDING_TIMEOUT = 30 * 60 * 1000; // 30 minutes
      const now = Date.now();

      orders.forEach((order) => {
        if (order.status === "pending") {
          const orderId = order.id || order._id;
          const createdAt = new Date(order.created_at).getTime();
          const timeDiff = now - createdAt;
          const remainingTime = Math.max(0, PENDING_TIMEOUT - timeDiff);
          newTimeLeft[orderId] = Math.ceil(remainingTime / 1000); // seconds
        }
      });

      setPendingTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [orders]); // Recalculate timer when orders change

  const handleOpenReview = (orderItem, orderId) => {
    console.log("handleOpenReview - item:", orderItem, "orderId:", orderId);
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
        alert("Không tìm thấy đơn hàng");
        return;
      }

      // Get foodId - already mapped in orderService
      const foodId = selectedOrderItem.foodId;
      console.log("handleSubmitReview - selectedOrderItem:", selectedOrderItem);
      console.log("handleSubmitReview - foodId:", foodId);
      if (!foodId) {
        console.error("Food ID not found in item:", selectedOrderItem);
        alert("Không tìm thấy ID món ăn");
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
        alert(result.message || "Cảm ơn bạn đã đánh giá!");
        setShowReviewModal(false);
        setSelectedOrderItem(null);
        setSelectedOrderId(null);

        // Mark this food as reviewed
        setReviewedFoods((prev) => ({
          ...prev,
          [foodId]: true,
        }));
      } else {
        alert(result.message || "Lỗi gửi đánh giá");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Lỗi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserOrders();
      alert("Danh sách đơn hàng đã cập nhật!");
    } catch (error) {
      console.error("Refresh error:", error);
      alert("Lỗi tải đơn hàng");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!canCancelOrder(order)) {
      alert("Đơn hàng này không thể hủy ở giai đoạn này");
      return;
    }

    const confirmCancel = window.confirm(
      `Bạn có chắc chắn muốn hủy đơn hàng #${order.id}?\nThao tác này không thể hoàn tác.`
    );
    if (!confirmCancel) return;

    try {
      const result = await cancelOrder(order);

      if (result.success) {
        alert(result.message || "Hủy đơn hàng thành công!");
        await fetchUserOrders();
      } else {
        alert(result.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại.");
    }
  };

  const displayOrders =
    activeTab === "current" ? currentOrders : historyOrders;

  const handleTrackOrder = (order) => {
    navigate(`/tracking/${order.id || order._id}`);
  };

  const handleContinuePayment = (order) => {
    navigate(`/payment-momo/${order.id || order._id}`);
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setSelectedOrderItem(null);
    setSelectedOrderId(null);
  };

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return "Expired";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
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
        <h2>Đơn hàng của bạn</h2>
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
          <MdRefresh /> {refreshing ? "Đang tải..." : "Làm mới"}
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
          onClick={() => {
            setActiveTab("current");
            setCurrentPage(1);
          }}
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
          Đơn hiện tại ({currentOrders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            setCurrentPage(1);
          }}
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
          Lịch sử ({historyOrders.length})
        </button>
      </div>

      {displayOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>
            {activeTab === "current"
              ? "Bạn không có đơn hàng nào đang xử lý"
              : "Bạn chưa có đơn hàng nào hoàn thành"}
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
              Đặt hàng ngay
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Paginated Orders */}
          {displayOrders
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            .map((order) => {
              const orderId = order.id || order._id;
              const timeLeft = pendingTimeLeft[orderId];
              const isPending = order.status === "pending" && typeof timeLeft === "number";

              return (
                <div key={orderId} className="order-card">
                  {isPending && (
                    <div
                      style={{
                        background: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: "6px",
                        padding: "10px 12px",
                        marginBottom: "12px",
                        color: "#856404",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <MdTimer size={16} />
                      <span>
                        <b>Thanh toán hết hạn sau:</b> {formatTimeLeft(timeLeft)}
                      </span>
                    </div>
                  )}

                  <OrderCardHeader
                    order={order}
                    onTrackClick={handleTrackOrder}
                    onCancelClick={handleCancelOrder}
                    onContinuePaymentClick={handleContinuePayment}
                  />

                  <OrderItemsTable
                    items={order.items}
                    orderStatus={order.status}
                    reviewedFoods={reviewedFoods}
                    orderId={orderId}
                    restaurantId={order.restaurantId || order.restaurant_id}
                    onReviewClick={handleOpenReview}
                  />

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Tạm tính:</span>
                      <span>{formatCurrency(order.subtotal || order.sub_total || 0)}</span>
                    </div>
                    {(order.discount_amount || order.discountAmount) > 0 && (
                      <div className="summary-row discount">
                        <span>Giảm giá:</span>
                        <span>-{formatCurrency(order.discount_amount || order.discountAmount || 0)}</span>
                      </div>
                    )}
                    {(order.delivery_fee || order.deliveryFee) > 0 && (
                      <div className="summary-row">
                        <span>Phí giao hàng:</span>
                        <span>{formatCurrency(order.delivery_fee || order.deliveryFee || 0)}</span>
                      </div>
                    )}
                    <p className="order-total">
                      <b>Tổng cộng:</b>{" "}
                      {formatCurrency(order.total_amount || order.totalAmount || 0)}
                    </p>
                  </div>
                  <hr />
                </div>
              );
            })}

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalItems={displayOrders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
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
