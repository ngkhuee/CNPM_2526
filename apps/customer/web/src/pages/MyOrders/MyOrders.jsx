import React, { useContext, useState } from "react";
import { OrderContext, AuthContext } from "customer-shared";
import { reviewService } from "@api/services";
import { formatCurrency } from "shared-utils";
import "./MyOrders.css";
import { useNavigate } from "react-router-dom";
import {
  MdLocationOn,
  MdStar,
  MdStarBorder,
  MdCheckCircle,
  MdError,
} from "react-icons/md";

const MyOrders = () => {
  const { orders } = useContext(OrderContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previousOrders, setPreviousOrders] = useState([]);

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
        alert(`Đơn hàng #${order.id} đã được xác nhận! 🎉`);
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

      alert("Cảm ơn bạn đã đánh giá!");
      setShowReviewModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Lỗi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="myorders">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id || order._id} className="order-card">
            <h3>Order #{order.id || order._id}</h3>

            {/* Restaurant info */}
            {(order.restaurantName ||
              order.restaurant?.name ||
              order.restaurantId) && (
              <p
                style={{
                  color: "#ff6b35",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                <b>🍽️ Nhà hàng:</b>{" "}
                {order.restaurantName ||
                  order.restaurant?.name ||
                  `Restaurant ID: ${order.restaurantId}`}
              </p>
            )}

            <p>
              <b>Trạng thái:</b> {order.status}
            </p>
            <p>
              <b>Ngày đặt:</b> {order.createdAt || order.created_at}
            </p>

            {/* Customer info */}
            {order.customer && (
              <>
                <p>
                  <b>Khách hàng:</b> {order.customer.name}
                </p>
                <p>
                  <b>SĐT:</b> {order.customer.phone}
                </p>
                <p>
                  <b>Địa chỉ:</b> {order.customer.address}
                </p>
              </>
            )}

            <div className="order-actions">
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
                <MdLocationOn /> Theo dõi đơn hàng
              </button>

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
                  <MdStar /> Đánh giá
                </button>
              )}
            </div>

            {order.items && order.items.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Món ăn</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p className="order-total">
              <b>Tổng tiền:</b> {formatCurrency(order.total_amount)}
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
            <h3>Đánh giá đơn hàng</h3>
            <p>Đơn hàng #{selectedOrder.id || selectedOrder._id}</p>

            <div className="rating-section">
              <label>Chất lượng món ăn:</label>
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
              <p>{rating}/5 sao</p>
            </div>

            <div className="comment-section">
              <label>Nhận xét (tùy chọn):</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleSubmitReview} disabled={submitting}>
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
              <button onClick={() => setShowReviewModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
