import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderContext } from "customer-shared";
import { formatCurrency } from "shared-utils";
import "./PaymentCard.css";
import { MdCheckCircle, MdError, MdCreditCard, MdWarning } from "react-icons/md";

// Demo account information
const DEMO_ACCOUNT = {
    accountName: "Yummy Foods Demo",
    accountNumber: "1234567890",
    bankName: "Demo Bank",
    swift: "DEMOCB",
};

const PaymentCard = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { orders, updateOrderStatus, fetchUserOrders } =
        useContext(OrderContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentFailed, setPaymentFailed] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: "",
        cardHolder: "",
        expiryDate: "",
        cvv: "",
    });

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
        if (!order || order.status === "cancelled" || order.status === "rejected" || order.status === "paid") return;
        if (order.status !== "pending" && order.payment_status === "paid") return;

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

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(" ");
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (v.length >= 2) {
            return v.slice(0, 2) + "/" + v.slice(2, 4);
        }
        return v;
    };

    const handlePaymentSuccess = async () => {
        setLoading(true);
        try {
            console.log("Processing card payment for order:", orderId);

            // Update payment_status to 'paid' and status to 'paid'
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/orders/${orderId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        payment_status: "paid",
                        status: "paid",
                        updated_at: new Date().toISOString()
                    })
                }
            );

            if (!response.ok) {
                alert("Lỗi cập nhật trạng thái thanh toán");
                setLoading(false);
                return;
            }

            console.log("Card payment successful - status updated to 'paid', waiting for restaurant confirmation");

            // Refresh order data
            await fetchUserOrders();

            alert("Thanh toán thành công! Đơn hàng của bạn đang chờ nhà hàng xác nhận.");
            navigate(`/tracking/${orderId}`);
        } catch (error) {
            console.error("Payment error:", error);
            alert("Có lỗi xảy ra khi xử lý thanh toán!");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentFailed = () => {
        console.log("Card payment failed for order:", orderId);
        setPaymentFailed(true);
    };

    const handleRetryPayment = () => {
        console.log("Retrying payment for order:", orderId);
        setPaymentFailed(false);
        // Reset form
        setPaymentForm({
            cardNumber: "",
            cardHolder: "",
            expiryDate: "",
            cvv: "",
        });
    };

    const handleBackToOrders = () => {
        if (order?.status === "pending" && timeLeft && timeLeft > 0) {
            const minutes = Math.ceil(timeLeft / 60);
            const confirmed = window.confirm(
                `⏱️ Cảnh báo!\n\nĐơn hàng của bạn sẽ tự động bị hủy sau ${minutes} phút.\n\nBạn có chắc muốn rời trang thanh toán?\n\nNhấn OK để quay lại đơn hàng, hoặc Hủy để ở lại trang này.`
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
            "Bạn có chắc muốn hủy đơn hàng này?\nThao tác này không thể hoàn tác."
        );
        if (!confirmCancel) return;

        setCancelling(true);
        try {
            console.log("Cancelling order:", orderId);
            await updateOrderStatus(orderId, "cancelled");
            alert("Hủy đơn hàng thành công!");
            navigate("/myorders");
        } catch (error) {
            console.error("Error cancelling order:", error);
            alert("Lỗi hủy đơn hàng. Vui lòng thử lại!");
        } finally {
            setCancelling(false);
        }
    };

    if (!order) {
        return (
            <div className="payment-card-page">
                <p>Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    // Check if order is already cancelled or rejected
    if (order.status === "cancelled" || order.status === "rejected") {
        return (
            <div className="payment-card-page">
                <div className="payment-container">
                    <div className="payment-header">
                        <MdError size={60} color="#dc3545" />
                        <h1 style={{ color: "#dc3545" }}>Đơn hàng {order.status === "cancelled" ? "đã hủy" : "bị từ chối"}</h1>
                        <p className="order-id">Order #{order.id || order._id}</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <p>Đơn hàng này đã bị {order.status === "cancelled" ? "hủy" : "từ chối"}. Không thể thanh toán.</p>
                        {order.status === "rejected" && order.rejection_reason && (
                            <p style={{ color: "#666", marginTop: "10px", fontSize: "14px" }}>
                                Lý do: {order.rejection_reason}
                            </p>
                        )}
                    </div>
                    <div className="payment-footer">
                        <button className="btn-back" onClick={() => navigate("/myorders")}>
                            Quay lại đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if order is already paid
    if (order.status === "paid" || (order.payment_status === "paid" && order.status !== "pending")) {
        return (
            <div className="payment-card-page">
                <div className="payment-container">
                    <div className="payment-header">
                        <MdCheckCircle size={60} color="#4caf50" />
                        <h1 style={{ color: "#4caf50" }}>Đã thanh toán</h1>
                        <p className="order-id">Order #{order.id || order._id}</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <p>Đơn hàng này đã được thanh toán.</p>
                        <p style={{ color: "#666", marginTop: "10px" }}>Trạng thái: {order.status}</p>
                    </div>
                    <div className="payment-footer">
                        <button className="btn-back" onClick={() => navigate(`/tracking/${order.id || order._id}`)}>
                            Xem theo dõi
                        </button>
                    </div>
                </div>
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
        <div className="payment-card-page">
            <div className="payment-container">
                <div className="payment-header">
                    {paymentFailed ? (
                        <>
                            <MdError size={60} color="#dc3545" />
                            <h1 style={{ color: "#dc3545" }}>Thanh toán thất bại</h1>
                        </>
                    ) : (
                        <>
                            <MdCreditCard size={60} color="#1976d2" />
                            <h1>Thanh toán thẻ</h1>
                        </>
                    )}
                    <p className="order-id">Order #{order.id || order._id}</p>
                </div>

                {/* Timeout Warning */}
                {order.status === "pending" && timeLeft !== null && (
                    <div
                        className={`timeout-warning ${timeLeft < 300 ? "urgent" : ""}`}
                    >
                        {/* <MdWarning size={24} /> */}
                        <div>
                            {/* <p className="timeout-title">
                                Cảnh báo thời gian thanh toán
                            </p> */}
                            <p className="timeout-text">
                                Hoàn tất thanh toán trong <strong>{formatTimeLeft(timeLeft)}</strong> hoặc đơn hàng sẽ tự động bị hủy.
                            </p>
                        </div>
                    </div>
                )}

                <div className="payment-details">
                    <h3>Thông tin thanh toán</h3>
                    <div className="detail-row">
                        <span>Tạm tính:</span>
                        <strong>{formatCurrency(order.subtotal || order.sub_total || 0)}</strong>
                    </div>
                    {(order.discount_amount || order.discountAmount) > 0 && (
                        <div className="detail-row discount">
                            <span>Giảm giá:</span>
                            <strong style={{ color: "#28a745" }}>-{formatCurrency(order.discount_amount || order.discountAmount || 0)}</strong>
                        </div>
                    )}
                    {(order.delivery_fee || order.deliveryFee) > 0 && (
                        <div className="detail-row">
                            <span>Phí giao hàng:</span>
                            <strong>{formatCurrency(order.delivery_fee || order.deliveryFee || 0)}</strong>
                        </div>
                    )}
                    <div className="detail-row total-row">
                        <span>Tổng thanh toán:</span>
                        <strong className="total-amount">{formatCurrency(order.totalAmount || order.total_amount || 0)}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Phương thức thanh toán:</span>
                        <strong>Thẻ tín dụng/Ghi nợ</strong>
                    </div>
                    {paymentFailed && (
                        <div className="detail-row" style={{ marginTop: "15px" }}>
                            <span style={{ color: "#dc3545", fontWeight: "600" }}>
                                Trạng thái:
                            </span>
                            <strong style={{ color: "#dc3545" }}>Thanh toán thất bại</strong>
                        </div>
                    )}
                </div>

                {paymentFailed ? (
                    // Error state - show retry and cancel options
                    <>
                        <div className="payment-error-message">
                            <p className="error-title">
                                <MdError /> Thanh toán thất bại
                            </p>
                            <p className="error-text">
                                Đơn hàng của bạn vẫn đang chờ thanh toán. Bạn có thể thử lại hoặc hủy đơn hàng.
                            </p>
                        </div>

                        <div className="payment-actions">
                            <button
                                className="btn-retry"
                                onClick={handleRetryPayment}
                                disabled={loading || cancelling}
                            >
                                <MdCreditCard /> Thử lại thanh toán
                            </button>
                            <button
                                className="btn-cancel-order"
                                onClick={handleCancelOrder}
                                disabled={loading || cancelling}
                            >
                                <MdError /> {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                            </button>
                        </div>
                    </>
                ) : (
                    // Normal state - show card form and simulation buttons
                    <>
                        {/* Demo Account Info */}
                        <div className="demo-account-section">
                            <h3>Thông tin tài khoản thử nghiệm</h3>
                            <div className="account-box">
                                <div className="account-row">
                                    <span>Tên tài khoản:</span>
                                    <strong>{DEMO_ACCOUNT.accountName}</strong>
                                </div>
                                <div className="account-row">
                                    <span>Số tài khoản:</span>
                                    <strong>{DEMO_ACCOUNT.accountNumber}</strong>
                                </div>
                                <div className="account-row">
                                    <span>Ngân hàng:</span>
                                    <strong>{DEMO_ACCOUNT.bankName}</strong>
                                </div>
                                <div className="account-row">
                                    <span>SWIFT:</span>
                                    <strong>{DEMO_ACCOUNT.swift}</strong>
                                </div>
                            </div>
                            {/* <div className="demo-notice">
                                <MdWarning size={16} />
                                <span>Đây là tài khoản thử nghiệm chỉ dành cho mục đích kiểm tra.</span>
                            </div> */}
                        </div>

                        {/* Card Form */}
                        <div className="card-form-section">
                            <h3>Nhập thông tin thẻ (Tùy chọn)</h3>
                            <p className="form-note">Để trống để sử dụng tài khoản thử nghiệm ở trên</p>

                            <div className="form-group">
                                <label>Số thẻ</label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    value={paymentForm.cardNumber}
                                    onChange={(e) =>
                                        setPaymentForm({
                                            ...paymentForm,
                                            cardNumber: formatCardNumber(e.target.value),
                                        })
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>Tên chủ thẻ</label>
                                <input
                                    type="text"
                                    placeholder="Tên trên thẻ"
                                    value={paymentForm.cardHolder}
                                    onChange={(e) =>
                                        setPaymentForm({ ...paymentForm, cardHolder: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Ngày hết hạn</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        value={paymentForm.expiryDate}
                                        onChange={(e) =>
                                            setPaymentForm({
                                                ...paymentForm,
                                                expiryDate: formatExpiryDate(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group half">
                                    <label>CVV</label>
                                    <input
                                        type="password"
                                        placeholder="123"
                                        maxLength={4}
                                        value={paymentForm.cvv}
                                        onChange={(e) =>
                                            setPaymentForm({
                                                ...paymentForm,
                                                cvv: e.target.value.replace(/[^0-9]/g, ""),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="payment-instructions">
                            <p>
                                <strong>Mô phỏng thanh toán thẻ</strong>
                            </p>
                            <p>Chọn kết quả thanh toán:</p>
                        </div>

                        <div className="payment-actions">
                            <button
                                className="btn-success"
                                onClick={handlePaymentSuccess}
                                disabled={loading}
                            >
                                <MdCheckCircle /> {loading ? "Đang xử lý..." : "Thanh toán thành công"}
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
                    <button className="btn-back" onClick={handleBackToOrders}>
                        Quay lại đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCard;
