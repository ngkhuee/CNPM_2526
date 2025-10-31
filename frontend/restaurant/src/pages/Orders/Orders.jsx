import React, { useEffect, useState } from "react";
import "./Orders.css";
import { assets } from "../../assets/assets";

const Orders = ({ currentRestaurant }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const restaurantOrders = storedOrders.filter(
      (order) => order.restaurantName === currentRestaurant
    );
    setOrders(restaurantOrders);
  }, [currentRestaurant]);

  const statusHandler = (event, orderId) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: event.target.value } : order
    );

    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]").map(o =>
      o.id === orderId ? { ...o, status: event.target.value } : o
    );

    localStorage.setItem("orders", JSON.stringify(allOrders));
    setOrders(updatedOrders);
  };

  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  return (
    <div className="order add">
      <h3>Orders for {currentRestaurant}</h3>

      {orders.length === 0 ? (
        <p>No orders yet for this restaurant.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="order-item">
              <img src={assets.parcel_icon} alt="parcel" />
              <div className="order-details">
                <p className="order-item-food">
                  {order.items.map((item, index) =>
                    index === order.items.length - 1
                      ? `${item.name} x${item.quantity}`
                      : `${item.name} x${item.quantity}, `
                  )}
                </p>
                <p className="order-item-name">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <div className="order-item-address">
                  <p>{order.address.street}, {order.address.city}</p>
                  <p>{order.address.state}, {order.address.country}</p>
                  <p>{order.address.phone}</p>
                </div>
              </div>

              <div className="order-summary">
                <p>{formatVND(order.amount)}</p>
                <p>{order.items.length} món</p>
                <select
                  onChange={(e) => statusHandler(e, order.id)}
                  value={order.status}
                >
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
