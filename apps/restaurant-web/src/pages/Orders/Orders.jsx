import React, { useEffect, useState, useContext } from "react";
import "./Orders.css";
import { OrderContext } from "../../Context/OrderContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { AuthContext } from "../../Context/AuthContext";
import { MdRefresh, MdVisibility } from "react-icons/md";
import { OrderDetailModal } from "shared-ui";

const Orders = () => {
  const { orders, updateOrderStatus, fetchRestaurantOrders, loading } =
    useContext(OrderContext);
  const { currentRestaurant } = useContext(RestaurantContext);
  const { currentUser } = useContext(AuthContext);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Handler để refresh orders thủ công
  const handleRefresh = async () => {
    if (currentUser?.restaurantId) {
      await fetchRestaurantOrders(currentUser.restaurantId);
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

        <div className="orders-filter">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({restaurantOrders.length})
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending (
            {restaurantOrders.filter((o) => o.status === "pending").length})
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
                      <select
                        className={`status-select ${getStatusBadgeClass(order.status)}`}
                        onChange={(e) => statusHandler(e, order.id)}
                        value={order.status}
                        disabled={["delivered", "cancelled"].includes(
                          order.status
                        )}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivering">Delivering</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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
                      <button
                        className="btn-view"
                        title="View details"
                        onClick={() => openOrderDetail(order)}
                      >
                        <MdVisibility />
                      </button>
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
      </div>
    </div>
  );
};

export default Orders;
