import { createContext, useState, useEffect } from "react";
export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  const addOrder = (order) => {
    const newOrder = { ...order, _id: Date.now().toString(), status: "Food Processing" };
    const updated = [...orders, newOrder];
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };
  
  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
