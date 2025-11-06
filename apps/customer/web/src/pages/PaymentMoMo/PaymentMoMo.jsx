import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderContext } from "customer-shared";
import { formatCurrency } from "shared-utils";
import "./PaymentMoMo.css";
import { MdCheckCircle, MdError, MdPayment } from "react-icons/md";

const PaymentMoMo = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, fetchOrders } = useContext(OrderContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Find order from context
    const foundOrder = orders.find(
      (o) => o.id === orderId || o._id === orderId
    );
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      // Fetch if not in context
      fetchOrders();
    }
  }, [orderId, orders]);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      const result = await updateOrderStatus(orderId, "paid");
      if (result.success) {
        alert("Thanh toán thành công! Đơn hàng đã được gửi đến nhà hàng.");
        navigate("/myorders");
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra khi xử lý thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailed = () => {
    alert(
      "Thanh toán thất bại! Bạn có thể thử lại hoặc quay lại trang đơn hàng."
    );
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
          <MdPayment size={60} color="#d82d8b" />
          <h1>Thanh toán MoMo</h1>
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
        </div>

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
