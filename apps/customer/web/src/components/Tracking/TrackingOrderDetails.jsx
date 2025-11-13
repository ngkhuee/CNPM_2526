import React from "react";
import { formatCurrency } from "shared-utils";
import { MdLocationOn, MdRestaurant, MdHome } from "react-icons/md";

const TrackingOrderDetails = ({ order }) => {
    if (!order) return null;

    return (
        <div className="tracking-section order-details">
            <h3>Order Details</h3>

            {/* Order ID & Status */}
            <div className="detail-row">
                <strong>Order ID:</strong>
                <span>#{order.id || order._id}</span>
            </div>
            <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge status-${order.status}`}>
                    {order.status}
                </span>
            </div>

            {/* Restaurant info */}
            {order.restaurant && (
                <div className="detail-row">
                    <strong>Restaurant:</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MdRestaurant size={16} />
                        <span>{order.restaurant.name || "Unknown"}</span>
                    </div>
                </div>
            )}

            {/* Pickup & Delivery locations */}
            {order.restaurant?.address && (
                <div className="detail-row">
                    <strong>Pickup:</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MdLocationOn size={16} />
                        <small>{order.restaurant.address}</small>
                    </div>
                </div>
            )}

            {order.delivery_address && (
                <div className="detail-row">
                    <strong>Delivery:</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MdHome size={16} />
                        <small>{order.delivery_address}</small>
                    </div>
                </div>
            )}

            {/* Items */}
            <div className="detail-row">
                <strong>Items:</strong>
                <div>
                    {order.items?.map((item, idx) => (
                        <div key={idx} style={{ fontSize: "14px", marginTop: "4px" }}>
                            • {item.name || item.food_name} x{item.quantity} -{" "}
                            {formatCurrency((item.unit_price || item.price || 0) * item.quantity)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Total */}
            <div className="detail-row" style={{ fontWeight: "bold", fontSize: "16px" }}>
                <strong>Total:</strong>
                <span style={{ color: "#ff6b35" }}>
                    {formatCurrency(order.total_amount || order.totalAmount || 0)}
                </span>
            </div>
        </div>
    );
};

export default TrackingOrderDetails;
