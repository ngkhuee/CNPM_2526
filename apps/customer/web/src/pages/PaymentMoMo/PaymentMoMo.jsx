import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderContext } from "customer-shared";
import { formatCurrency } from "shared-utils";
import "./PaymentMoMo.css";
import { MdCheckCircle, MdError, MdPayment } from "react-icons/md";

const PaymentMoMo = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, fetchUserOrders } =
    useContext(OrderContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // Find order from context
    const foundOrder = orders.find(
      (o) => o.id === orderId || o._id === orderId
    );
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      // Fetch if not in context
      fetchUserOrders();
    }
  }, [orderId, orders, fetchUserOrders]);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      console.log("Processing payment for order:", orderId);

      // Step 1: Update order status to 'paid'
      const result = await updateOrderStatus(orderId, "paid");
      if (!result.success) {
        alert(`Lỗi cập nhật đơn hàng: ${result.message}`);
        setLoading(false);
        return;
      }

      console.log("Order status updated to 'paid'");

      // Show success message and redirect to tracking
      // Note: Drone will be assigned when restaurant confirms the order
      alert("Thanh toán thành công! Đơn hàng đang chờ nhà hàng xác nhận.");
      navigate(`/tracking/${orderId}`);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra khi xử lý thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailed = () => {
    console.log("Payment failed for order:", orderId);
    setPaymentFailed(true);
    // Order status remains 'pending' - no need to update
  };

  const handleRetryPayment = () => {
    console.log("Retrying payment for order:", orderId);
    setPaymentFailed(false);
    // Reload the page to reset state
    window.location.reload();
  };

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Bạn có chắc muốn hủy đơn hàng này?\nĐơn hàng sẽ không thể khôi phục."
    );
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      console.log("Cancelling order:", orderId);
      await updateOrderStatus(orderId, "cancelled");
      alert("Đơn hàng đã được hủy thành công!");
      navigate("/myorders");
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Lỗi khi hủy đơn hàng. Vui lòng thử lại!");
    } finally {
      setCancelling(false);
    }
  };

  if (!order) {
    return (
      <div className="payment-momo-page">
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="payment-momo-page">
      <div className="payment-container">
        <div className="payment-header">
          {paymentFailed ? (
            <>
              <MdError size={60} color="#dc3545" />
              <h1 style={{ color: "#dc3545" }}>Thanh toán thất bại</h1>
            </>
          ) : (
            <>
              <MdPayment size={60} color="#d82d8b" />
              <h1>Thanh toán MoMo</h1>
            </>
          )}
          <p className="order-id">Đơn hàng #{order.id || order._id}</p>
        </div>

        <div className="payment-details">
          <h3>Thông tin thanh toán</h3>
          <div className="detail-row">
            <span>Tổng tiền:</span>
            <strong>{formatCurrency(order.totalAmount || 0)}</strong>
          </div>
          <div className="detail-row">
            <span>Phương thức:</span>
            <strong>Ví MoMo</strong>
          </div>
          {paymentFailed && (
            <div className="detail-row" style={{ marginTop: "15px" }}>
              <span style={{ color: "#dc3545", fontWeight: "600" }}>
                ⚠️ Trạng thái:
              </span>
              <strong style={{ color: "#dc3545" }}>Thanh toán thất bại</strong>
            </div>
          )}
        </div>

        {paymentFailed ? (
          // Error state - show retry and cancel options
          <>
            <div
              className="payment-error-message"
              style={{
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                padding: "15px",
                margin: "20px 0",
                color: "#856404",
              }}
            >
              <p style={{ margin: 0, fontWeight: "600" }}>
                ❌ Thanh toán không thành công
              </p>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                Đơn hàng của bạn vẫn ở trạng thái chờ thanh toán. Bạn có thể thử
                lại hoặc hủy đơn hàng.
              </p>
            </div>

            <div className="payment-actions">
              <button
                className="btn-retry"
                onClick={handleRetryPayment}
                disabled={loading || cancelling}
                style={{
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                <MdPayment /> Thử lại thanh toán
              </button>
              <button
                className="btn-cancel-order"
                onClick={handleCancelOrder}
                disabled={loading || cancelling}
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: cancelling ? "not-allowed" : "pointer",
                  opacity: cancelling ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                <MdError /> {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
              </button>
            </div>
          </>
        ) : (
          // Normal state - show simulation buttons
          <>
            <div className="payment-instructions">
              <p>
                <strong>Mô phỏng thanh toán MoMo</strong>
              </p>
              <p>Chọn kết quả thanh toán:</p>
            </div>

            <div className="payment-actions">
              <button
                className="btn-success"
                onClick={handlePaymentSuccess}
                disabled={loading}
              >
                <MdCheckCircle /> Thanh toán thành công
              </button>
              <button
                className="btn-failed"
                onClick={handlePaymentFailed}
                disabled={loading}
              >
                <MdError /> Thanh toán thất bại
              </button>
            </div>
          </>
        )}

        <div className="payment-footer">
          <button className="btn-back" onClick={() => navigate("/myorders")}>
            Quay lại đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMoMo;
