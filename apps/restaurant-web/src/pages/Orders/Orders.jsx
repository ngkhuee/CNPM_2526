import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import "./Orders.css";
import { OrderContext } from "../../Context/OrderContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { AuthContext } from "../../Context/AuthContext";
import { MdRefresh, MdVisibility, MdNotifications } from "react-icons/md";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import { OrderDetailModal, Pagination } from "shared-ui";
import { orderService } from "shared-services";
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
    const [droneStatuses, setDroneStatuses] = useState({}); // {orderId: {stage, droneInfo}}

    // ✅ Filter restaurant orders FIRST before using in callbacks - use useMemo to prevent infinite loop
    const restaurantOrders = useMemo(() => {
        return orders.filter(
            (order) =>
                order.restaurant_id === currentUser?.restaurantId ||
                order.restaurantId === currentUser?.restaurantId
        );
    }, [orders, currentUser?.restaurantId]);

    // Fetch drone statuses for confirmed/preparing orders
    const fetchDroneStatuses = useCallback(async () => {
        const ordersToCheck = restaurantOrders.filter(
            (o) => o.status === "confirmed" || o.status === "preparing"
        );

        const statusPromises = ordersToCheck.map(async (order) => {
            try {
                const status = await orderService.getDroneStatus(order.id);
                return { orderId: order.id, status };
            } catch (error) {
                console.error(`Failed to fetch drone status for order ${order.id}:`, error);
                return { orderId: order.id, status: null };
            }
        });

        const results = await Promise.all(statusPromises);
        const newStatuses = {};
        results.forEach(({ orderId, status }) => {
            if (status) {
                newStatuses[orderId] = {
                    stage: status.drone_journey_stage,
                    droneId: status.drone_id,
                    droneInfo: status.drone,
                };
            }
        });
        setDroneStatuses(newStatuses);
    }, [orders, currentUser?.restaurantId]);

    useEffect(() => {
        // New orders = status='paid' (customer paid, waiting for restaurant confirmation)
        const paidOrders = restaurantOrders.filter(
            (o) => o.status === "paid"
        );
        setNewOrdersCount(paidOrders.length);
        if (paidOrders.length > 0) {
            console.log(`[Order Alert] ${paidOrders.length} new order(s) waiting for confirmation!`);
        }
    }, [restaurantOrders]); // restaurantOrders is now memoized, safe to use

    // Poll drone statuses every 3 seconds
    useEffect(() => {
        fetchDroneStatuses(); // Initial fetch
        const interval = setInterval(fetchDroneStatuses, 3000);
        return () => clearInterval(interval);
    }, [fetchDroneStatuses]);

    const handleRefresh = async () => {
        if (currentUser?.restaurantId) {
            await refreshOrders();
        }
    };

    const handleConfirmOrder = async (orderId) => {
        try {
            // Backend will automatically assign drone via polling service
            await updateOrderStatus(orderId, "confirmed");
            toast.success("Đã xác nhận đơn hàng! Đang tìm drone...");
        } catch (error) {
            console.error("Error confirming order:", error);
            toast.error("Không thể xác nhận đơn hàng");
        }
    };

    const handleStartPreparing = async (orderId) => {
        const result = await updateOrderStatus(orderId, "preparing");
        if (result?.success !== false) {
            toast.success("Đã bắt đầu chuẩn bị đơn hàng!");
        }
    };

    const handleMarkReady = async (orderId) => {
        try {
            // Validate: drone must be at restaurant
            const droneStatus = droneStatuses[orderId];
            if (!droneStatus || droneStatus.stage !== "at_restaurant") {
                toast.error("Không thể đánh dấu sẵn sàng: Drone chưa đến nhà hàng");
                return;
            }

            await updateOrderStatus(orderId, "ready");
            toast.success("Đơn hàng đã sẵn sàng giao!");

            // Trigger drone delivery simulation via backend endpoint
            try {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
                const response = await fetch(`${API_BASE_URL}/orders/${orderId}/simulate-delivery`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to start delivery');
                }
                console.log('Drone delivery started successfully');
            } catch (error) {
                console.error("Failed to start drone delivery:", error);
                toast.error("Không thể bắt đầu giao hàng: " + error.message);
            }
        } catch (error) {
            console.error("Error marking order as ready:", error);
            toast.error("Không thể đánh dấu đơn hàng sẵn sàng");
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
            arrived: "status-arrived",
            delivered: "status-delivered",
            cancelled: "status-cancelled",
            rejected: "status-rejected",
        };
        return statusMap[status] || "status-default";
    };

    const filteredOrders = restaurantOrders
        .filter((order) => {
            if (filter === "all") return true;
            if (filter === "new") {
                // New orders = paid but not confirmed yet
                return order.status === "paid";
            }
            if (filter === "preparing") {
                // Preparing = confirmed, preparing, ready
                return ["confirmed", "preparing", "ready"].includes(order.status);
            }
            if (filter === "delivering") {
                // Delivering = picking_up, picked_up, delivering
                return ["picking_up", "picked_up", "delivering"].includes(order.status);
            }
            if (filter === "completed") {
                // Completed = delivered
                return order.status === "delivered";
            }
            if (filter === "cancelled") {
                // Cancelled/Rejected
                return ["cancelled", "rejected"].includes(order.status);
            }
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
                <div className="loading">Đang tải đơn hàng...</div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="orders-page">
                <div className="orders-header">
                    <div>
                        <h2>Quản lý Đơn hàng</h2>
                        <p className="restaurant-name">
                            {currentRestaurant?.name || "Restaurant"}
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={orderLoading}
                        className="refresh-btn"
                    >
                        <MdRefresh /> {orderLoading ? "Đang làm mới..." : "Làm mới"}
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
                            <strong>Đơn hàng mới!</strong>
                            <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>
                                Bạn có {newOrdersCount} đơn hàng mới đang chờ xác nhận
                            </p>
                        </div>
                    </div>
                )}

                <div className="orders-filter">
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn hàng..."
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
                        Tất cả ({restaurantOrders.length})
                    </button>
                    <button
                        className={filter === "new" ? "active" : ""}
                        onClick={() => setFilter("new")}
                        style={{
                            background: newOrdersCount > 0 ? "#ff6b35" : "",
                            color: newOrdersCount > 0 ? "white" : "",
                        }}
                    >
                        Mới (
                        {restaurantOrders.filter((o) => o.status === "paid").length})
                    </button>
                    <button
                        className={filter === "preparing" ? "active" : ""}
                        onClick={() => setFilter("preparing")}
                    >
                        Đang chuẩn bị (
                        {restaurantOrders.filter((o) => ["confirmed", "preparing", "ready"].includes(o.status)).length})
                    </button>
                    <button
                        className={filter === "delivering" ? "active" : ""}
                        onClick={() => setFilter("delivering")}
                    >
                        Đang giao (
                        {restaurantOrders.filter((o) => ["picking_up", "picked_up", "delivering"].includes(o.status)).length})
                    </button>
                    <button
                        className={filter === "completed" ? "active" : ""}
                        onClick={() => setFilter("completed")}
                    >
                        Hoàn thành (
                        {restaurantOrders.filter((o) => o.status === "delivered").length})
                    </button>
                    <button
                        className={filter === "cancelled" ? "active" : ""}
                        onClick={() => setFilter("cancelled")}
                    >
                        Đã hủy (
                        {restaurantOrders.filter((o) => ["cancelled", "rejected"].includes(o.status)).length})
                    </button>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="no-data">Không tìm thấy đơn hàng</div>
                ) : (
                    <>
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã đơn hàng</th>
                                        <th>Khách hàng</th>
                                        <th>Sản phẩm</th>
                                        <th>Tổng tiền</th>
                                        <th>Thanh toán</th>
                                        <th>Trạng thái</th>
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
                                                Thời gian
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
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.map((order, index) => (
                                        <tr key={order.id}>
                                            <td>{startIdx + index + 1}</td>
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
                                                            +{order.items.length - 2} món khác
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
                                            <td>
                                                {droneStatuses[order.id] ? (
                                                    <div style={{ fontSize: "12px" }}>
                                                        <span
                                                            className={`status-badge ${droneStatuses[order.id].stage === "at_restaurant"
                                                                ? "status-success"
                                                                : droneStatuses[order.id].stage === "going_to_restaurant"
                                                                    ? "status-info"
                                                                    : "status-warning"
                                                                }`}
                                                            style={{ fontSize: "11px" }}
                                                        >
                                                            {droneStatuses[order.id].stage || "-"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "#999", fontSize: "12px" }}>-</span>
                                                )}
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
                                                        gap: "6px",
                                                        alignItems: "center",
                                                        flexWrap: "nowrap",
                                                        minWidth: "fit-content",
                                                    }}
                                                >
                                                    <button
                                                        className="btn-view"
                                                        title="Xem chi tiết"
                                                        onClick={() => openOrderDetail(order)}
                                                    >
                                                        <MdVisibility />
                                                    </button>

                                                    {order.status === "paid" && (
                                                        <>
                                                            <button
                                                                className="btn-confirm"
                                                                onClick={() => handleConfirmOrder(order.id)}
                                                            >
                                                                Xác nhận
                                                            </button>
                                                            <button
                                                                className="btn-reject"
                                                                onClick={() => openRejectModal(order)}
                                                            >
                                                                Từ chối
                                                            </button>
                                                        </>
                                                    )}

                                                    {order.status === "confirmed" && (
                                                        <button
                                                            className="btn-prepare"
                                                            onClick={() => handleStartPreparing(order.id)}
                                                        >
                                                            Bắt đầu chuẩn bị
                                                        </button>
                                                    )}

                                                    {order.status === "preparing" && (
                                                        <>
                                                            <button
                                                                className="btn-ready"
                                                                onClick={() => handleMarkReady(order.id)}
                                                                disabled={droneStatuses[order.id]?.stage !== "at_restaurant"}
                                                                title={droneStatuses[order.id]?.stage !== "at_restaurant" ? "Đang chờ drone đến..." : "Đánh dấu sẵn sàng"}
                                                            >
                                                                Sẵn sàng
                                                            </button>
                                                            {droneStatuses[order.id]?.stage !== "at_restaurant" && (
                                                                <span className="waiting-drone-text">
                                                                    (Chờ drone)
                                                                </span>
                                                            )}
                                                        </>
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
                    enableAutoRefresh={true}
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
