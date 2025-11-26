import React from "react";
import { MdLocationOn, MdError, MdCancel, MdPayment } from "react-icons/md";
import { formatCurrency } from "shared-utils";
import { orderValidationService } from "shared-services";

const OrderCardHeader = ({ order, onTrackClick, onCancelClick, onContinuePaymentClick }) => {
    return (
        <>
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
                        <b>Nhà hàng:</b>{" "}
                        {order.restaurantName || order.restaurant?.name || `Belga Pizza`}
                    </p>
                )}

            <p>
                <b>Trạng thái:</b>{" "}
                <span style={orderValidationService.getStatusBadgeStyle(order.status)}>
                    {order.status}
                </span>
            </p>
            <p>
                <b>Ngày đặt:</b>{" "}
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
                            <MdCancel /> Lý do từ chối:
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
                        Thanh toán của bạn sẽ được hoàn lại trong 3-5 ngày làm việc.
                    </p>
                </div>
            )}

            {/* Customer info */}
            {order.customer && (
                <>
                    <p>
                        <b>Khách hàng:</b> {order.customer.name}
                    </p>
                    <p>
                        <b>Điện thoại:</b> {order.customer.phone}
                    </p>
                    <p>
                        <b>Địa chỉ:</b> {order.customer.address}
                    </p>
                </>
            )}

            <div className="order-actions">
                {/* Show "Continue Payment" button for pending orders */}
                {order.status === "pending" && (
                    <button
                        className="continue-payment-btn"
                        onClick={() => onContinuePaymentClick?.(order)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            justifyContent: "center",
                            background: "#28a745",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                        }}
                    >
                        <MdPayment /> Tiếp tục thanh toán
                    </button>
                )}

                {/* Only show Track button if order can be tracked */}
                {order.status !== "pending" &&
                    order.status !== "cancelled" &&
                    order.status !== "rejected" && (
                        <button
                            className="track-btn"
                            onClick={() => onTrackClick(order)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                justifyContent: "center",
                            }}
                        >
                            <MdLocationOn /> Theo dõi đơn hàng
                        </button>
                    )}

                {/* Cancel button for orders that can be cancelled */}
                {orderValidationService.canCancelOrder(order) && (
                    <button
                        className="cancel-btn"
                        onClick={() => onCancelClick(order)}
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
                        <MdError /> Hủy đơn hàng
                    </button>
                )}

                {/* Show waiting message for pending orders with payment completed */}
                {order.status === "pending" && order.payment_status === "paid" && (
                    <p
                        style={{
                            color: "#666",
                            fontSize: "14px",
                            fontStyle: "italic",
                            margin: "10px 0",
                        }}
                    >
                        Đang chờ nhà hàng xác nhận...
                    </p>
                )}
            </div>
        </>
    );
};

export default OrderCardHeader;
