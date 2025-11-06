import React, { useEffect, useState, useContext } from "react";
import "./Orders.css";
import { OrderContext } from "../../Context/OrderContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { AuthContext } from "../../Context/AuthContext";
import { MdRefresh, MdVisibility } from "react-icons/md";
import { OrderDetailModal } from "shared-ui";
import { droneSimulation, droneService, orderService } from "shared-services";

const Orders = () => {
  const { orders, updateOrderStatus, fetchRestaurantOrders, loading } =
    useContext(OrderContext);
  const { currentRestaurant } = useContext(RestaurantContext);
  const { currentUser } = useContext(AuthContext);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Check for new paid orders on mount and when orders change
  useEffect(() => {
    const paidOrders = restaurantOrders.filter((o) => o.status === "paid");
    setNewOrdersCount(paidOrders.length);

    if (paidOrders.length > 0) {
      // Show notification for new orders
      const notification = new Audio(); // You can add a notification sound here
      console.log(
        `🔔 ${paidOrders.length} new order(s) waiting for confirmation!`
      );
    }
  }, [orders]);

  // Handler để refresh orders thủ công
  const handleRefresh = async () => {
    if (currentUser?.restaurantId) {
      await fetchRestaurantOrders(currentUser.restaurantId);
    }
  };

  // Quick action handlers
  const handleConfirmOrder = async (orderId) => {
    try {
      // Step 1: Update order status to confirmed
      await updateOrderStatus(orderId, "confirmed");

      // Step 2: Find available drone and assign to order
      console.log("🚁 Finding available drone for order:", orderId);
      const availableDrones = await droneService.getAvailableDrones();

      if (availableDrones && availableDrones.length > 0) {
        // Pick random drone
        const randomDrone =
          availableDrones[Math.floor(Math.random() * availableDrones.length)];
        console.log("✅ Found available drone:", randomDrone.identifier);

        // Assign drone to order - status "busy" means đang có đơn hàng
        await droneService.updateDrone(randomDrone.id, {
          status: "busy",
          assigned_order_id: orderId,
        });

        // Update order with drone_id
        await orderService.update(orderId, {
          drone_id: randomDrone.id,
        });

        console.log("✅ Drone assigned successfully!");
        alert(`Order confirmed and assigned to ${randomDrone.identifier}!`);
      } else {
        console.warn("⚠️ No available drones found");
        alert("Order confirmed! Warning: No drones available at the moment.");
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Failed to confirm order");
    }
  };

  const handleStartPreparing = async (orderId) => {
    await updateOrderStatus(orderId, "preparing");
    alert("Started preparing order!");
  };

  const handleMarkReady = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "ready");
      alert("Order is ready for delivery! Drone will start delivery soon...");

      // Auto-trigger drone delivery simulation
      console.log(`🚁 Triggering drone delivery for order ${orderId}`);
      droneSimulation.autoTriggerDelivery(orderId).catch((error) => {
        console.error("Failed to start drone delivery:", error);
      });
    } catch (error) {
      console.error("Error marking order as ready:", error);
      alert("Failed to mark order as ready");
    }
  };

  const openRejectModal = (order) => {
    setRejectingOrder(order);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setRejectingOrder(null);
    setRejectReason("");
    setShowRejectModal(false);
  };

  const handleRejectOrder = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await updateOrderStatus(rejectingOrder.id, "rejected", {
        rejection_reason: rejectReason,
      });
      alert("Order rejected successfully");
      closeRejectModal();
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert("Failed to reject order");
    }
  };

  // Filter orders for current restaurant
  const restaurantOrders = orders.filter(
    (order) =>
      order.restaurant_id === currentUser?.restaurantId ||
      order.restaurantId === currentUser?.restaurantId
  );

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    await updateOrderStatus(orderId, newStatus);
  };

  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Helper function to get field value (support both camelCase and snake_case)
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
    };
    return statusMap[status] || "status-default";
  };

  const filteredOrders = restaurantOrders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setShowDetailModal(false);
  };

  if (loading) {
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
            disabled={loading}
            className="refresh-btn"
          >
            <MdRefresh /> {loading ? "Refreshing..." : "Refresh"}
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
            <span style={{ fontSize: "24px" }}>🔔</span>
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
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
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
                        }}
                      >
                        <button
                          className="btn-view"
                          title="View details"
                          onClick={() => openOrderDetail(order)}
                        >
                          <MdVisibility />
                        </button>

                        {/* Action buttons based on status */}
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
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={showDetailModal}
          onClose={closeOrderDetail}
          order={selectedOrder}
        />

        {/* Reject Order Modal */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={closeRejectModal}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                maxWidth: "500px",
                width: "90%",
              }}
            >
              <h3 style={{ marginBottom: "20px", color: "#333" }}>
                Reject Order #{rejectingOrder?.id}
              </h3>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Reason for rejection:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">-- Select a reason --</option>
                  <option value="out_of_ingredients">Hết nguyên liệu</option>
                  <option value="too_busy">Quá tải đơn hàng</option>
                  <option value="closed">Ngoài giờ hoạt động</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>

              {rejectReason === "other" && (
                <div style={{ marginBottom: "20px" }}>
                  <textarea
                    placeholder="Please specify the reason..."
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={closeRejectModal}
                  style={{
                    padding: "10px 20px",
                    background: "#e0e0e0",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectOrder}
                  style={{
                    padding: "10px 20px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Reject Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
