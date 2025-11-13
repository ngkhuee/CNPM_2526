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

        <div className="payment-details">
          <h3>Payment Information</h3>
          <div className="detail-row">
            <span>Total Amount:</span>
            <strong>{formatCurrency(order.totalAmount || 0)}</strong>
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
          <button className="btn-back" onClick={() => navigate("/myorders")}>
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMoMo;
