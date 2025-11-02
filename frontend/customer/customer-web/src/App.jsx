import React, { useState } from "react";
import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes, useNavigate } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import MyOrders from "./pages/MyOrders/MyOrders";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./pages/Verify/Verify";
import { OrderProvider } from "./Context/OrderContext";
import { RestaurantProvider } from "./Context/RestaurantContext";
import Dashboard from "./pages/Restaurant/Dashboard";
import Partners from "./pages/Restaurant/Partners";
import Orders from "./pages/Restaurant/Orders";
import MenuList from "./pages/Restaurant/MenuList";
import MenuAdd from "./pages/Restaurant/MenuAdd";
import CheckoutInfo from "./pages/CheckOutInfo/CheckOutInfo";
import Tracking from "./pages/Tracking/Tracking";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const navigate = useNavigate();

  // handleLogin is now handled in LoginPopup via authService

  return (
    <OrderProvider>
      <RestaurantProvider>
        <ToastContainer />
        {showLogin && (
          <LoginPopup setShowLogin={setShowLogin} handleLogin={handleLogin} />
        )}
        <div className="app">
          <Navbar setShowLogin={setShowLogin} />
          <Routes>
            {/* User customer */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/checkout-info" element={<CheckoutInfo />} />
            <Route path="/tracking/:id" element={<Tracking />} />

            {/* Restaurant super-admin */}
            <Route path="/restaurant/dashboard" element={<Dashboard />} />
            <Route
              path="/restaurant/partners"
              element={<Partners selectRestaurant={setRestaurantId} />}
            />
            <Route
              path="/restaurant/orders"
              element={<Orders restaurantId={restaurantId} />}
            />
            <Route
              path="/restaurant/menulist"
              element={<MenuList restaurantId={restaurantId} />}
            />
            <Route
              path="/restaurant/menuadd"
              element={<MenuAdd restaurantId={restaurantId} />}
            />
          </Routes>
        </div>
        <Footer />
      </RestaurantProvider>
    </OrderProvider>
  );
};

export default App;
