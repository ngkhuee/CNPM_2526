import React, { useState } from "react";
import { useDroneTracking } from "../../hooks/useDroneTracking";
import "./Delivery.css";

const Delivery = () => {
  const { drones, orders, loading, getDronesByStatus, getOrdersByStatus } =
    useDroneTracking();

  const [droneFilter, setDroneFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");

  if (loading) {
    return (
      <div className="delivery-page">
        <h2>Delivery Monitoring</h2>
        <p>Loading...</p>
      </div>
    );
  }

  const getFilteredDrones = () => {
    if (droneFilter === "all") return drones;
    return getDronesByStatus(droneFilter);
  };

  const getFilteredOrders = () => {
    if (orderFilter === "all") return orders;
    return getOrdersByStatus(orderFilter);
  };

  const getBatteryClass = (battery) => {
    if (battery >= 70) return "battery-high";
    if (battery >= 30) return "battery-medium";
    return "battery-low";
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      active: "status-active",
      idle: "status-idle",
      charging: "status-charging",
      maintenance: "status-maintenance",
      delivering: "status-delivering",
      delivered: "status-delivered",
    };
    return statusMap[status] || "status-default";
  };

  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <h2>Delivery & Drone Management</h2>
      </div>

      <div className="delivery-stats">
        <div className="stat-card active">
          <div className="stat-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Active Drones</p>
            <p className="stat-value">
              {getDronesByStatus("available").length +
                getDronesByStatus("delivering").length}
            </p>
          </div>
        </div>
        <div className="stat-card delivery">
          <div className="stat-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">In Delivery</p>
            <p className="stat-value">
              {getOrdersByStatus("delivering").length}
            </p>
          </div>
        </div>
        <div className="stat-card total">
          <div className="stat-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Drones</p>
            <p className="stat-value">{drones.length}</p>
          </div>
        </div>
        <div className="stat-card orders">
          <div className="stat-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{orders.length}</p>
          </div>
        </div>
      </div>

      <div className="delivery-content">
        <div className="section drones-section">
          <div className="section-header">
            <h3>Drones Fleet</h3>
            <div className="section-filter">
              <button
                className={droneFilter === "all" ? "active" : ""}
                onClick={() => setDroneFilter("all")}
              >
                All
              </button>
              <button
                className={droneFilter === "available" ? "active" : ""}
                onClick={() => setDroneFilter("available")}
              >
                Available
              </button>
              <button
                className={droneFilter === "delivering" ? "active" : ""}
                onClick={() => setDroneFilter("delivering")}
              >
                Delivering
              </button>
              <button
                className={droneFilter === "charging" ? "active" : ""}
                onClick={() => setDroneFilter("charging")}
              >
                Charging
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Battery</th>
                  <th>Location</th>
                  <th>Assigned Order</th>
                  <th>Max Weight</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredDrones().length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No drones found
                    </td>
                  </tr>
                ) : (
                  getFilteredDrones().map((drone) => (
                    <tr key={drone.id}>
                      <td className="drone-id">{drone.id}</td>
                      <td>{drone.name || `Drone ${drone.id}`}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(drone.status)}`}
                        >
                          {drone.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`battery-indicator ${getBatteryClass(drone.battery)}`}
                        >
                          {drone.battery}% 
                        </span>
                      </td>
                      <td className="location-info">
                        {drone.latitude && drone.longitude
                          ? `${drone.latitude.toFixed(4)}, ${drone.longitude.toFixed(4)}`
                          : "N/A"}
                      </td>
                      <td>
                        {drone.assignedOrderId ? (
                          <span className="order-link">
                            #{drone.assignedOrderId}
                          </span>
                        ) : (
                          <span className="no-order">-</span>
                        )}
                      </td>
                      <td>
                        {drone.maxWeightKg ? `${drone.maxWeightKg} kg` : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section orders-section">
          <div className="section-header">
            <h3>Delivery Orders</h3>
            <div className="section-filter">
              <button
                className={orderFilter === "all" ? "active" : ""}
                onClick={() => setOrderFilter("all")}
              >
                All
              </button>
              <button
                className={orderFilter === "delivering" ? "active" : ""}
                onClick={() => setOrderFilter("delivering")}
              >
                Delivering
              </button>
              <button
                className={orderFilter === "delivered" ? "active" : ""}
                onClick={() => setOrderFilter("delivered")}
              >
                Delivered
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Drone ID</th>
                  <th>Delivery Location</th>
                  <th>Restaurant</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredOrders().length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  getFilteredOrders().map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.droneId ? (
                          <span className="drone-link">
                            Drone {order.droneId}
                          </span>
                        ) : (
                          <span className="no-drone">-</span>
                        )}
                      </td>
                      <td className="location-info">
                        {order.deliveryLocation
                          ? `${order.deliveryLocation.lat}, ${order.deliveryLocation.lng}`
                          : "N/A"}
                      </td>
                      <td>
                        {order.restaurantId
                          ? `Restaurant #${order.restaurantId}`
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
