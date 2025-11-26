import React from "react";
import { formatCurrency } from "shared-utils";
import { MdLocationOn, MdRestaurant, MdHome } from "react-icons/md";

const TrackingOrderDetails = ({ order }) => {
    if (!order) return null;

    return (
        <div className="tracking-section order-details">
            {/* Order ID & Status */}
            <div className="detail-row">
                <strong>Mã đơn hàng:</strong>
                <span>#{order.id || order._id}</span>
            </div>
            <div className="detail-row">
                <strong>Trạng thái:</strong>
                <span className={`status-badge status-${order.status}`}>
                    {order.status?.replace(/_/g, ' ')}
                </span>
            </div>

            {/* Restaurant info */}
            {order.restaurant && (
                <div className="detail-row">
                    <strong>Nhà hàng:</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MdRestaurant size={16} />
                        <span>{order.restaurant.name || "Không xác định"}</span>
                    </div>
                </div>
            )}

            {/* Pickup & Delivery locations */}
            {order.restaurant?.address && (
                <div className="detail-row">
                    <strong>Điểm lấy hàng:</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MdLocationOn size={16} />
                        <small>{order.restaurant.address}</small>
                    </div>
                </div>
            )}

            {order.delivery_address && (
                <div className="detail-row">
                    <strong>Điểm giao hàng:</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MdHome size={16} />
                        <small>{order.delivery_address}</small>
                    </div>
                </div>
            )}

            {/* Items */}
            <div className="detail-row">
                <strong>Sản phẩm:</strong>
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
                <strong>Tổng cộng:</strong>
                <span style={{ color: "#ff6b35" }}>
                    {formatCurrency(order.total_amount || order.totalAmount || 0)}
                </span>
            </div>
        </div>
    );
};

export default TrackingOrderDetails;
