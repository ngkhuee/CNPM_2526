import React from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "shared-utils";

const OrderTable = ({ orders, onOrderSelect, getStatusBadgeClass }) => {
    const navigate = useNavigate();

    return (
        <div className="orders-table-container">
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Drone</th>
                        <th>Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td className="order-id">#{order.id}</td>
                            <td>
                                <div className="customer-info">
                                    <span className="customer-name">
                                        {order.user?.full_name || order.userName || order.user_id}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div className="items-info">
                                    {order.items?.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="item-row">
                                            {item.name} x{item.quantity}
                                        </div>
                                    ))}
                                    {order.items?.length > 2 && (
                                        <span className="more-items">
                                            +{order.items.length - 2} more
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="order-total">
                                {formatCurrency(order.totalAmount || order.total_amount)}
                            </td>
                            <td>
                                <span className="payment-method">
                                    {order.paymentMethod || order.payment_method}
                                </span>
                            </td>
                            <td>
                                <span
                                    className={`status-badge ${getStatusBadgeClass(order.status)}`}
                                >
                                    {order.status}
                                </span>
                            </td>
                            <td>
                                {order.droneId || order.drone_id ? (
                                    <button
                                        className="btn-drone-link"
                                        onClick={() =>
                                            navigate("/admin/delivery", {
                                                state: { droneId: order.droneId || order.drone_id },
                                            })
                                        }
                                    >
                                        {order.droneId || order.drone_id}
                                    </button>
                                ) : (
                                    <span className="no-drone">—</span>
                                )}
                            </td>
                            <td className="order-time">
                                {new Date(order.createdAt || order.created_at).toLocaleString(
                                    "vi-VN",
                                    {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    }
                                )}
                            </td>
                            <td>
                                <button
                                    className="btn-view"
                                    title="View details"
                                    onClick={() => onOrderSelect(order)}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;
