// src/App.jsx (ADMIN)
import React from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from "./pages/Dashboard/Dashboard";
import Orders from "./pages/Orders/Orders";
import Partners from "./pages/Partners/Partners";
import Delivery from "./pages/Delivery/Delivery";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import context
import { OrderProvider } from './Context/OrderContext';

function App() {
  return (
    <OrderProvider>
      <div className="admin-container">
        <Sidebar />   {/* sidebar bên trái */}
        <div className="admin-content">
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/partners" element={<Partners />} />
            <Route path="/admin/delivery" element={<Delivery />} />
          </Routes>
        </div>
        <ToastContainer />
      </div>
    </OrderProvider>
  );
}

export default App;
