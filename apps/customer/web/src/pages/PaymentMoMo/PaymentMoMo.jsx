import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderContext } from "customer-shared";
import { formatCurrency } from "shared-utils";
import "./PaymentMoMo.css";
import { MdCheckCircle, MdError, MdPayment, MdWarning } from "react-icons/md";

const PaymentMoMo = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, fetchUserOrders } =
    useContext(OrderContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

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

  // Countdown timer for pending payment
  useEffect(() => {
    if (!order || order.status !== "pending") return;

    const PENDING_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const createdAt = new Date(order.created_at).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const timeDiff = now - createdAt;
      const remainingTime = Math.max(0, PENDING_TIMEOUT - timeDiff);
      setTimeLeft(Math.ceil(remainingTime / 1000)); // seconds
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      console.log("Processing payment for order:", orderId);

      // Step 1: Update order status to 'paid'
      const result = await updateOrderStatus(orderId, "paid");
      if (!result.success) {
        alert(`Error updating order: ${result.message}`);
        setLoading(false);
        return;
      }

      console.log("Order status updated to 'paid'");

      // Show success message and redirect to tracking
      // Note: Drone will be assigned when restaurant confirms the order
      alert("Payment successful! Your order is waiting for restaurant confirmation.");
      navigate(`/tracking/${orderId}`);
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred while processing payment!");
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

  const handleBackToOrders = () => {
    if (order?.status === "pending" && timeLeft && timeLeft > 0) {
      const minutes = Math.ceil(timeLeft / 60);
      const confirmed = window.confirm(
        `⏱️ Warning!\n\nYour order will be automatically cancelled in ${minutes} minute${minutes > 1 ? "s" : ""}.\n\nAre you sure you want to leave the payment page?\n\nClick OK to go back to orders, or Cancel to stay on this page.`
      );
      if (confirmed) {
        navigate("/myorders");
      }
    } else {
      navigate("/myorders");
    }
  };

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?\nThis action cannot be undone."
    );
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      console.log("Cancelling order:", orderId);
      await updateOrderStatus(orderId, "cancelled");
      alert("Order cancelled successfully!");
      navigate("/myorders");
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Error cancelling order. Please try again!");
    } finally {
      setCancelling(false);
    }
  };

  if (!order) {
    return (
      <div className="payment-momo-page">
        <p>Loading order information...</p>
      </div>
    );
  }

  const formatTimeLeft = (seconds) => {
    if (!seconds || seconds <= 0) return "Expired";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="payment-momo-page">
      <div className="payment-container">
        <div className="payment-header">
          {paymentFailed ? (
            <>
              <MdError size={60} color="#dc3545" />
              <h1 style={{ color: "#dc3545" }}>Payment Failed</h1>
            </>
          ) : (
            <>
              <MdPayment size={60} color="#d82d8b" />
              <h1>MoMo Payment</h1>
            </>
          )}
          <p className="order-id">Order #{order.id || order._id}</p>
        </div>

        {/* Timeout Warning */}
        {order.status === "pending" && timeLeft !== null && (
          <div
            style={{
              background: `${timeLeft && timeLeft < 300 ? "#fff3cd" : "#e3f2fd"}`,
              border: `1px solid ${timeLeft && timeLeft < 300 ? "#ffc107" : "#2196f3"}`,
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
              color: timeLeft && timeLeft < 300 ? "#856404" : "#1565c0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <MdWarning size={24} />
            <div>
              <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "15px" }}>
                Payment Timeout Warning
              </p>
              <p style={{ margin: "0", fontSize: "14px" }}>
                Complete your payment within <strong>{formatTimeLeft(timeLeft)}</strong> or your order will be automatically cancelled.
              </p>
            </div>
          </div>
        )}

        <div className="payment-details">
          <h3>Payment Information</h3>
          <div className="detail-row">
            <span>Subtotal:</span>
            <strong>{formatCurrency(order.subtotal || order.sub_total || 0)}</strong>
          </div>
          {(order.discount_amount || order.discountAmount) > 0 && (
            <div className="detail-row discount">
              <span>Discount:</span>
              <strong style={{ color: "#28a745" }}>-{formatCurrency(order.discount_amount || order.discountAmount || 0)}</strong>
            </div>
          )}
          {(order.delivery_fee || order.deliveryFee) > 0 && (
            <div className="detail-row">
              <span>Delivery Fee:</span>
              <strong>{formatCurrency(order.delivery_fee || order.deliveryFee || 0)}</strong>
            </div>
          )}
          <div className="detail-row" style={{ borderTop: "1px solid #ddd", paddingTop: "10px", marginTop: "10px", fontWeight: "600" }}>
            <span>Total Amount:</span>
            <strong style={{ color: "#ff7e5f", fontSize: "18px" }}>{formatCurrency(order.totalAmount || order.total_amount || 0)}</strong>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <strong>MoMo Wallet</strong>
          </div>
          {paymentFailed && (
            <div className="detail-row" style={{ marginTop: "15px" }}>
              <span style={{ color: "#dc3545", fontWeight: "600" }}>
                Status:
              </span>
              <strong style={{ color: "#dc3545" }}>Payment Failed</strong>
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
              <p style={{ margin: 0, fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <MdError /> Payment Failed
              </p>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                Your order is still pending payment. You can retry or cancel the order.
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
                <MdPayment /> Retry Payment
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
                <MdError /> {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </>
        ) : (
          // Normal state - show simulation buttons
          <>
            <div className="payment-instructions">
              <p>
                <strong>Simulate MoMo Payment</strong>
              </p>
              <p>Select payment result:</p>
            </div>

            <div className="payment-actions">
              <button
                className="btn-success"
                onClick={handlePaymentSuccess}
                disabled={loading}
              >
                <MdCheckCircle /> Payment Successful
              </button>
              <button
                className="btn-failed"
                onClick={handlePaymentFailed}
                disabled={loading}
              >
                <MdError /> Payment Failed
              </button>
            </div>
          </>
        )}

        <div className="payment-footer">
          <button className="btn-back" onClick={handleBackToOrders}>
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMoMo;
