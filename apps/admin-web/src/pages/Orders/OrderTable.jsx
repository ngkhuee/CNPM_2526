import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "shared-utils";
import { Pagination } from "shared-ui";
import { HiOutlineChevronUpDown } from "react-icons/hi2";

const OrderTable = ({ orders, onOrderSelect, getStatusBadgeClass }) => {
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchId, setSearchId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredOrders = useMemo(() => {
        return orders
            .filter((order) => {
                if (!searchId) return true;
                return order.id.toString().includes(searchId);
            })
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at);
                const dateB = new Date(b.createdAt || b.created_at);
                return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
            });
    }, [orders, searchId, sortOrder]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIdx, startIdx + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchId, sortOrder]);

    return (
        <div className="orders-table-container">
            <div style={{ marginBottom: "15px" }}>
                <input
                    type="text"
                    placeholder="Search by Order ID..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        minWidth: "150px",
                        fontSize: "14px",
                    }}
                />
            </div>
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
                        <th>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    cursor: "pointer",
                                    gap: "8px",
                                }}
                                onClick={() =>
                                    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                                }
                                title="Click to change sort order"
                            >
                                Time
                                <HiOutlineChevronUpDown
                                    style={{
                                        transform:
                                            sortOrder === "asc"
                                                ? "rotate(0deg)"
                                                : "rotate(180deg)",
                                        transition: "transform 0.2s",
                                        fontSize: "16px",
                                        color: "#ff6b35",
                                    }}
                                />
                            </div>
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedOrders.map((order) => (
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
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default OrderTable;
