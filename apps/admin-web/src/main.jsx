import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "shared-styles/global.css";
import { BrowserRouter } from "react-router-dom";
import { AdminAuthProvider } from "./Context/AdminAuthContext";
import { OrderProvider } from "./Context/OrderContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
