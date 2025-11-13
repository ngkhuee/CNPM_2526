/**
 * Order Card Component - shared between web and mobile
 * Displays order summary with items, status, and actions
 */

import React from "react";
import { orderValidationService } from "shared-services";

/**
 * Web version of OrderCard (uses CSS classes)
 */
export const OrderCardWeb = ({
    order,
    onTrack,
    onCancel,
    onReview,
    showTrackButton = true,
    showCancelButton = true,
}) => {
    const statusStyle = orderValidationService.getStatusBadgeStyle(order.status);
    const statusLabel = orderValidationService.getStatusLabel(order.status);
    const canCancel = orderValidationService.canCancelOrder(order);
    const canReview = orderValidationService.canReviewOrder(order.status);

    return (
        <div className="order-card">
            <h3>Order #{order.id || order._id}</h3>

            {/* Restaurant info */}
            {(order.restaurantName || order.restaurant?.name) && (
                <p style={{ color: "#ff6b35", fontWeight: "600", marginBottom: "8px" }}>
                    <b>Restaurant:</b> {order.restaurantName || order.restaurant?.name}
                </p>
            )}

            {/* Status */}
            <p>
                <b>Status:</b> <span style={statusStyle}>{statusLabel}</span>
            </p>

            {/* Order Date */}
            <p>
                <b>Order Date:</b>{" "}
                {new Date(order.createdAt || order.created_at).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                })}
            </p>

            {/* Rejection Reason */}
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
                        <b>Rejection Reason:</b> {order.rejection_reason}
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

            {/* Actions */}
            <div className="order-actions" style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                {showTrackButton &&
                    order.status !== "paid" &&
                    order.status !== "pending" && (
                        <button
                            onClick={() => onTrack?.(order.id || order._id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px 15px",
                                background: "#2196f3",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}
                        >
                            📍 Track Order
                        </button>
                    )}

                {showCancelButton && canCancel && (
                    <button
                        onClick={() => onCancel?.(order)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 15px",
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        ❌ Cancel
                    </button>
                )}

                {order.status === "paid" && (
                    <p
                        style={{
                            color: "#666",
                            fontSize: "14px",
                            fontStyle: "italic",
                            margin: 0,
                        }}
                    >
                        Waiting for restaurant confirmation...
                    </p>
                )}
            </div>

            {/* Items Table */}
            {order.items && order.items.length > 0 && (
                <table
                    style={{
                        width: "100%",
                        marginTop: "15px",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr style={{ borderBottom: "2px solid #ddd" }}>
                            <th style={{ textAlign: "left", padding: "8px" }}>Item</th>
                            <th style={{ textAlign: "center", padding: "8px" }}>Qty</th>
                            <th style={{ textAlign: "right", padding: "8px" }}>Price</th>
                            <th style={{ textAlign: "right", padding: "8px" }}>Total</th>
                            {canReview && <th style={{ textAlign: "center", padding: "8px" }}>Review</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "8px" }}>{item.name}</td>
                                <td style={{ textAlign: "center", padding: "8px" }}>
                                    {item.quantity}
                                </td>
                                <td style={{ textAlign: "right", padding: "8px" }}>
                                    ${item.price?.toFixed(2)}
                                </td>
                                <td style={{ textAlign: "right", padding: "8px" }}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </td>
                                {canReview && (
                                    <td style={{ textAlign: "center", padding: "8px" }}>
                                        <button
                                            onClick={() => onReview?.(item, order.id)}
                                            style={{
                                                padding: "6px 12px",
                                                background: "#ff9800",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                            }}
                                        >
                                            ⭐ Rate
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Total */}
            <p className="order-total" style={{ marginTop: "15px", fontSize: "16px", fontWeight: "600" }}>
                <b>Total:</b> ${(order.total_amount || order.totalAmount || 0).toFixed(2)}
            </p>
        </div>
    );
};

export default OrderCardWeb;
