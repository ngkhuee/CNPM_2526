import React, { createContext, useState } from 'react';

export const OrderContext = createContext(null);

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);

    const createOrder = (order) => {
        setOrders([...orders, order]);
    };

    return (
        <OrderContext.Provider value={{ orders, createOrder }}>
            {children}
        </OrderContext.Provider>
    );
}
