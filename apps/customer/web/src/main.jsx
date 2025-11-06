import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider, {
  AuthProvider,
  CartProvider,
  OrderProvider,
} from "customer-shared";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StoreContextProvider>
          <CartProvider>
            <OrderProvider>
              <App />
            </OrderProvider>
          </CartProvider>
        </StoreContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
