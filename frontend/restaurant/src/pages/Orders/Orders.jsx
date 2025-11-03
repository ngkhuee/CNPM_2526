import React, { useEffect, useState, useContext } from "react";
import "./Orders.css";
import { assets } from "../../assets/assets";
import { OrderContext } from "../../Context/OrderContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { authService } from "@api/services";

const Orders = () => {
  const { orders, updateOrderStatus, loading } = useContext(OrderContext);
  const { currentRestaurant } = useContext(RestaurantContext);
  const user = authService.getCurrentUser();

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
        <h3>Orders for {currentRestaurant?.name || "Restaurant"}</h3>

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
