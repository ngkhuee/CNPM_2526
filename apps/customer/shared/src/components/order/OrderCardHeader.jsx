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
                        <b>Restaurant:</b>{" "}
                        {order.restaurantName || order.restaurant?.name || `Belga Pizza`}
                    </p>
                )}

            <p>
                <b>Status:</b>{" "}
                <span style={orderValidationService.getStatusBadgeStyle(order.status)}>
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
                        <MdPayment /> Continue Payment
                    </button>
                )}

                {/* Only show Track button if order can be tracked */}
                {order.status !== "paid" && order.status !== "pending" && (
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
                        <MdLocationOn /> Track Order
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
        </>
    );
};

export default OrderCardHeader;
