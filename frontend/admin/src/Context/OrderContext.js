// src/Context/OrderContext.js
import React, { createContext, useState, useEffect } from "react";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  
  const [orders, setOrders] = useState(() => {
    // Lấy từ localStorage (user thêm đơn vào đây)
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });
  // Khi user tạo đơn, lưu vào localStorage
  const addOrder = (order) => {
    const updated = [...orders, order];
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  const updateOrderStatus = (id, status) => {
    const updated = orders.map(o => o._id === id ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  // Lắng nghe thay đổi từ tab khác (admin app)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "orders") {
        const newOrders = e.newValue ? JSON.parse(e.newValue) : [];
        setOrders(newOrders);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

    // Nếu user thêm đơn mới thì admin tự động sync lại

    // useEffect(() => {
    //   const syncOrders = () => {
    //     const saved = localStorage.getItem("orders");
    //     setOrders(saved ? JSON.parse(saved) : []);
    //   };

    //   window.addEventListener("storage", syncOrders);
    //   return () => window.removeEventListener("storage", syncOrders);
    // }, []);

    // Hàm cập nhật trạng thái đơn hàng

    // const updateOrderStatus = (orderId, newStatus) => {
    //   const updated = orders.map((order) =>
    //     order._id === orderId ? { ...order, status: newStatus } : order
    //   );
    //   setOrders(updated);
    //   localStorage.setItem("orders", JSON.stringify(updated)); // lưu lại để đồng bộ
    // };

    // Dùng React.createElement thay cho JSX
  return React.createElement(
    OrderContext.Provider,
    { value: { orders, setOrders, updateOrderStatus } },
    children
  );
};