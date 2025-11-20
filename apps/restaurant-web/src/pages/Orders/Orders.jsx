import React, { useEffect, useState, useContext } from "react";
import "./Orders.css";
import { OrderContext } from "../../Context/OrderContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { AuthContext } from "../../Context/AuthContext";
import { MdRefresh, MdVisibility, MdNotifications } from "react-icons/md";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import { OrderDetailModal, Pagination } from "shared-ui";
import { droneSimulation } from "shared-services";
import { useOrderManagement } from "../../hooks/useOrderManagement";
import { useDroneAssignment } from "../../hooks/useDroneAssignment";
import { useOrderRejection } from "../../hooks/useOrderRejection";
import OrderRejectModal from "../../components/OrderRejectModal";
import { toast } from "react-toastify";

const Orders = () => {
    const { orders } = useContext(OrderContext);
    const { currentRestaurant } = useContext(RestaurantContext);
    const { currentUser } = useContext(AuthContext);
    const {
        refreshOrders,
        updateOrderStatus,
        loading: orderLoading,
    } = useOrderManagement();
    const { assignDroneToOrder, releaseDroneFromOrder } = useDroneAssignment();
    const { rejectOrder: submitRejection, loading: rejectLoading } = useOrderRejection(() => {
        setShowRejectModal(false);
        setRejectingOrder(null);
    });

    const [filter, setFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [newOrdersCount, setNewOrdersCount] = useState(0);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingOrder, setRejectingOrder] = useState(null);
    const [sortOrder, setSortOrder] = useState("desc"); // "asc" or "desc"
    const [searchId, setSearchId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // New orders = 'paid' status (payment completed, waiting for restaurant confirmation)
        const paidOrders = restaurantOrders.filter((o) => o.status === "paid");
        setNewOrdersCount(paidOrders.length);
        if (paidOrders.length > 0) {
            console.log(`[Order Alert] ${paidOrders.length} new order(s) waiting for confirmation!`);
        }
    }, [orders]);

    const restaurantOrders = orders.filter(
        (order) =>
            order.restaurant_id === currentUser?.restaurantId ||
            order.restaurantId === currentUser?.restaurantId
    );

    const handleRefresh = async () => {
        if (currentUser?.restaurantId) {
            await refreshOrders();
        }
    };

    const handleConfirmOrder = async (orderId) => {
        try {
            await updateOrderStatus(orderId, "confirmed");
            const droneResult = await assignDroneToOrder(orderId);
            if (droneResult.success) {
                toast.success("Order confirmed and drone assigned!");
            }
        } catch (error) {
            console.error("Error confirming order:", error);
            toast.error("Failed to confirm order");
        }
    };

    const handleStartPreparing = async (orderId) => {
        const result = await updateOrderStatus(orderId, "preparing");
        if (result?.success !== false) {
            toast.success("Started preparing order!");
        }
    };

    const handleMarkReady = async (orderId) => {
        try {
            await updateOrderStatus(orderId, "ready");

            // Assign drone if not already assigned
            const droneAssignmentResult = await assignDroneToOrder(orderId);

            if (droneAssignmentResult.success || droneAssignmentResult.message === "Order confirmed but no drones available") {
                toast.success("Order is ready for delivery!");
                droneSimulation.autoTriggerDelivery(orderId).catch((error) => {
                    console.error("Failed to start drone delivery:", error);
                });
            } else {
                toast.error("Failed to assign drone to order");
            }
        } catch (error) {
            console.error("Error marking order as ready:", error);
            toast.error("Failed to mark order as ready");
        }
    };

    const handleRejectSubmit = async (reason) => {
        if (!rejectingOrder) return { success: false };
        return await submitRejection(rejectingOrder.id, reason);
    };

    const openRejectModal = (order) => {
        setRejectingOrder(order);
        setShowRejectModal(true);
    };

    const formatVND = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);

    const getOrderField = (order, camelCase, snakeCase) => {
        return order[camelCase] || order[snakeCase];
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            pending: "status-pending",
            confirmed: "status-confirmed",
            preparing: "status-preparing",
            ready: "status-ready",
            delivering: "status-delivering",
            delivered: "status-delivered",
            cancelled: "status-cancelled",
            rejected: "status-rejected",
        };
        return statusMap[status] || "status-default";
    };

    const filteredOrders = restaurantOrders
        .filter((order) => {
            if (filter === "all") return true;
            return order.status === filter;
        })
        .filter((order) => {
            if (!searchId) return true;
            return order.id.toString().includes(searchId);
        })
        .sort((a, b) => {
            const dateA = new Date(getOrderField(a, "createdAt", "created_at"));
            const dateB = new Date(getOrderField(b, "createdAt", "created_at"));
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIdx, startIdx + itemsPerPage);

    // Reset to page 1 when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchId, sortOrder]);

    const openOrderDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const closeOrderDetail = () => {
        setSelectedOrder(null);
        setShowDetailModal(false);
    };

    if (orderLoading) {
        return (
            <div className="main-content">
                <div className="loading">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="orders-page">
                <div className="orders-header">
                    <div>
                        <h2>Order Management</h2>
                        <p className="restaurant-name">
                            {currentRestaurant?.name || "Restaurant"}
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={orderLoading}
                        className="refresh-btn"
                    >
                        <MdRefresh /> {orderLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {newOrdersCount > 0 && (
                    <div
                        className="new-orders-alert"
                        style={{
                            background: "#ff6b35",
                            color: "white",
                            padding: "15px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <MdNotifications style={{ fontSize: "32px" }} />
                        <div>
                            <strong>New Order{newOrdersCount > 1 ? "s" : ""}!</strong>
                            <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>
                                You have {newOrdersCount} new order
                                {newOrdersCount > 1 ? "s" : ""} waiting for confirmation
                            </p>
                        </div>
                    </div>
                )}

                <div className="orders-filter">
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            marginRight: "10px",
                            minWidth: "150px",
                            fontSize: "14px",
                        }}
                    />
                    <button
                        className={filter === "all" ? "active" : ""}
                        onClick={() => setFilter("all")}
                    >
                        All ({restaurantOrders.length})
                    </button>
                    <button
                        className={filter === "paid" ? "active" : ""}
                        onClick={() => setFilter("paid")}
                        style={{
                            background: newOrdersCount > 0 ? "#ff6b35" : "",
                            color: newOrdersCount > 0 ? "white" : "",
                        }}
                    >
                        New Orders (
                        {restaurantOrders.filter((o) => o.status === "paid").length})
                    </button>
                    <button
                        className={filter === "confirmed" ? "active" : ""}
                        onClick={() => setFilter("confirmed")}
                    >
                        Confirmed (
                        {restaurantOrders.filter((o) => o.status === "confirmed").length})
                    </button>
                    <button
                        className={filter === "preparing" ? "active" : ""}
                        onClick={() => setFilter("preparing")}
                    >
                        Preparing (
                        {restaurantOrders.filter((o) => o.status === "preparing").length})
                    </button>
                    <button
                        className={filter === "ready" ? "active" : ""}
                        onClick={() => setFilter("ready")}
                    >
                        Ready ({restaurantOrders.filter((o) => o.status === "ready").length}
                        )
                    </button>
                    <button
                        className={filter === "delivering" ? "active" : ""}
                        onClick={() => setFilter("delivering")}
                    >
                        Delivering (
                        {restaurantOrders.filter((o) => o.status === "delivering").length})
                    </button>
                    <button
                        className={filter === "delivered" ? "active" : ""}
                        onClick={() => setFilter("delivered")}
                    >
                        Delivered (
                        {restaurantOrders.filter((o) => o.status === "delivered").length})
                    </button>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="no-data">No orders found</div>
                ) : (
                    <>
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
                                                        {order.user?.full_name ||
                                                            order.userName ||
                                                            getOrderField(order, "userId", "user_id") ||
                                                            "Unknown"}
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
                                                {formatVND(
                                                    getOrderField(order, "totalAmount", "total_amount")
                                                )}
                                            </td>
                                            <td>
                                                <span className="payment-method">
                                                    {getOrderField(
                                                        order,
                                                        "paymentMethod",
                                                        "payment_method"
                                                    ) || "N/A"}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-badge ${getStatusBadgeClass(order.status)}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="order-time">
                                                {new Date(
                                                    getOrderField(order, "createdAt", "created_at")
                                                ).toLocaleString("vi-VN", {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}
                                            </td>
                                            <td>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        alignItems: "center",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        className="btn-view"
                                                        title="View details"
                                                        onClick={() => openOrderDetail(order)}
                                                    >
                                                        <MdVisibility />
                                                    </button>

                                                    {order.status === "paid" && (
                                                        <>
                                                            <button
                                                                className="btn-confirm"
                                                                onClick={() => handleConfirmOrder(order.id)}
                                                                style={{
                                                                    background: "#4caf50",
                                                                    color: "white",
                                                                    padding: "6px 12px",
                                                                    border: "none",
                                                                    borderRadius: "4px",
                                                                    cursor: "pointer",
                                                                    fontSize: "12px",
                                                                }}
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                className="btn-reject"
                                                                onClick={() => openRejectModal(order)}
                                                                style={{
                                                                    background: "#f44336",
                                                                    color: "white",
                                                                    padding: "6px 12px",
                                                                    border: "none",
                                                                    borderRadius: "4px",
                                                                    cursor: "pointer",
                                                                    fontSize: "12px",
                                                                }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {order.status === "confirmed" && (
                                                        <button
                                                            className="btn-prepare"
                                                            onClick={() => handleStartPreparing(order.id)}
                                                            style={{
                                                                background: "#2196f3",
                                                                color: "white",
                                                                padding: "6px 12px",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                            }}
                                                        >
                                                            Start Preparing
                                                        </button>
                                                    )}

                                                    {order.status === "preparing" && (
                                                        <button
                                                            className="btn-ready"
                                                            onClick={() => handleMarkReady(order.id)}
                                                            style={{
                                                                background: "#ff9800",
                                                                color: "white",
                                                                padding: "6px 12px",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                            }}
                                                        >
                                                            Mark Ready
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}

                <OrderDetailModal
                    isOpen={showDetailModal}
                    onClose={closeOrderDetail}
                    order={selectedOrder}
                />

                <OrderRejectModal
                    isOpen={showRejectModal}
                    order={rejectingOrder}
                    onClose={() => {
                        setShowRejectModal(false);
                        setRejectingOrder(null);
                    }}
                    onSubmit={handleRejectSubmit}
                    loading={rejectLoading}
                />
            </div>
        </div>
    );
};

export default Orders;
