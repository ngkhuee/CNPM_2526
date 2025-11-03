import React, { useEffect, useState, useContext } from "react";
import "./Orders.css";
import { assets } from "../../assets/assets";
import { OrderContext } from "../../Context/OrderContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { authService } from "@api/services";

const Orders = () => {
  const { orders, updateOrderStatus, fetchRestaurantOrders, loading } =
    useContext(OrderContext);
  const { currentRestaurant } = useContext(RestaurantContext);
  const user = authService.getCurrentUser();

  // Handler để refresh orders thủ công
  const handleRefresh = async () => {
    if (user?.restaurantId) {
      await fetchRestaurantOrders(user.restaurantId);
    }
  };

  // Filter orders for current restaurant
  const restaurantOrders = orders.filter(
    (order) => order.restaurantId === user?.restaurantId
  );

  const statusHandler = async (event, orderId) => {
    await updateOrderStatus(orderId, event.target.value);
  };

  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="order add">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h3>Orders for {currentRestaurant?.name || "Restaurant"}</h3>
            <p
              style={{
                fontSize: "12px",
                color: "#4CAF50",
                margin: "5px 0 0 0",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#4CAF50",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              Auto-refreshing every 10s
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {loading ? "Refreshing..." : "Manual Refresh"}
          </button>
        </div>

        {restaurantOrders.length === 0 ? (
          <p>No orders yet for this restaurant.</p>
        ) : (
          <div className="order-list">
            {restaurantOrders.map((order) => (
              <div key={order.id} className="order-item">
                <img src={assets.parcel_icon} alt="parcel" />
                <div className="order-details">
                  <p className="order-item-food">
                    {order.items?.map((item, index) =>
                      index === order.items.length - 1
                        ? `${item.name} x${item.quantity}`
                        : `${item.name} x${item.quantity}, `
                    )}
                  </p>
                  <p className="order-item-name">
                    {order.address?.firstName} {order.address?.lastName}
                  </p>
                  <div className="order-item-address">
                    <p>
                      {order.address?.street}, {order.address?.city}
                    </p>
                    <p>
                      {order.address?.state}, {order.address?.country}
                    </p>
                    <p>{order.address?.phone}</p>
                  </div>
                </div>

                <div className="order-summary">
                  <p>{formatVND(order.total || order.amount)}</p>
                  <p>{order.items?.length || 0} món</p>
                  <select
                    onChange={(e) => statusHandler(e, order.id)}
                    value={order.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="in_delivery">In Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
