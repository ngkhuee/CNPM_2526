import React, { createContext, useState } from "react";
import { restaurant_list } from "../assets/assets";

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
    const [partners, setPartners] = useState(restaurant_list);
    const [orders, setOrders] = useState(() => {
        // lấy từ localStorage nếu muốn lưu sau reload
        const saved = localStorage.getItem("restaurantOrders");
        return saved ? JSON.parse(saved) : [];
    });
    // Lưu orders vào state + localStorage
    const saveOrders = (newOrders) => {
        setOrders(newOrders);
        localStorage.setItem("restaurantOrders", JSON.stringify(newOrders));
    };

    // Thêm order mới
    const addOrder = (order) => {
        const newOrders = [...orders, order];
        saveOrders(newOrders);
    };
    const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    };

    const updateDroneStatus = (orderId, droneStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, droneStatus } : o));
    };


  return (
    <RestaurantContext.Provider value={{
      partners,
      setPartners,
      orders,
      addOrder,
      updateOrderStatus,
      updateDroneStatus
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};
export default RestaurantProvider;
