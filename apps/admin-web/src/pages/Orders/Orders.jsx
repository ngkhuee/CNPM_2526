import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "shared-services";
import { formatCurrency } from "shared-utils";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      await fetchOrders();
    } catch (error) {
      alert("Failed to update order status");
    }
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

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  if (loading) {
    return <div className="orders-page">Loading...</div>;
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2>Order Management</h2>
        <div className="orders-filter">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({orders.length})
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            className={filter === "delivering" ? "active" : ""}
            onClick={() => setFilter("delivering")}
          >
            Delivering ({orders.filter((o) => o.status === "delivering").length}
            )
          </button>
          <button
            className={filter === "delivered" ? "active" : ""}
            onClick={() => setFilter("delivered")}
          >
            Delivered ({orders.filter((o) => o.status === "delivered").length})
          </button>
        </div>
      </div>

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
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">#{order.id}</td>
                <td>
                  <div className="customer-info">
                    <span className="customer-id">{order.user_id}</span>
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
                  {formatCurrency(order.total_amount)}
                </td>
                <td>
                  <span className="payment-method">{order.payment_method}</span>
                </td>
                <td>
                  <span
                    className={`status-badge ${getStatusBadgeClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>
                  {order.drone_id ? (
                    <button
                      className="btn-drone-link"
                      onClick={() =>
                        navigate("/admin/delivery", {
                          state: { droneId: order.drone_id },
                        })
                      }
                    >
                      {order.drone_id}
                    </button>
                  ) : (
                    <span className="no-drone">—</span>
                  )}
                </td>
                <td className="order-time">
                  {new Date(order.created_at).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td>
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-data">No orders found</div>
      )}
    </div>
  );
};

export default Orders;
