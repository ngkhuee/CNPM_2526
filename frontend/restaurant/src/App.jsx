import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Dashboard from "./pages/Dashboard/Dashboard";
import Promotions from "./pages/Promotions/Promotions";
import Category from "./pages/Category/Category";
import RestaurantProfile from "./pages/RestaurantProfile/RestaurantProfile";
import Login from "./pages/Login/Login";
import { authService } from "@api/services";
import { RestaurantProvider } from "./Context/RestaurantContext";
import { FoodProvider } from "./Context/FoodContext";
import { OrderProvider } from "./Context/OrderContext";
import { PromotionProvider } from "./Context/PromotionContext";
import { CategoryProvider } from "./Context/CategoryContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [foods, setFoods] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === "restaurant" && user.restaurantId) {
      // Validate restaurantId format
      if (/^r\d+$/.test(user.restaurantId)) {
        setCurrentUser(user);
      } else {
        console.warn("Invalid user data detected, clearing...");
        authService.logout();
        setCurrentUser(null);
      }
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <RestaurantProvider>
      <FoodProvider>
        <OrderProvider>
          <PromotionProvider>
            <CategoryProvider>
              <div className="app">
                {/* Sidebar chỉ hiển thị khi đã login */}
                {currentUser && <Sidebar onLogout={handleLogout} />}

                {/* Main content */}
                <div
                  className={`app-content ${currentUser ? "with-sidebar" : ""}`}
                >
                  <Routes>
                    <Route
                      path="/login"
                      element={
                        currentUser ? (
                          <Navigate to="/dashboard" />
                        ) : (
                          <Login setCurrentUser={setCurrentUser} />
                        )
                      }
                    />

                    {/* Các route bảo vệ */}
                    <Route
                      path="/dashboard"
                      element={
                        currentUser ? <Dashboard /> : <Navigate to="/login" />
                      }
                    />
                    <Route
                      path="/categories"
                      element={
                        currentUser ? <Category /> : <Navigate to="/login" />
                      }
                    />
                    <Route
                      path="/add"
                      element={currentUser ? <Add /> : <Navigate to="/login" />}
                    />
                    <Route
                      path="/list"
                      element={
                        currentUser ? <List /> : <Navigate to="/login" />
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        currentUser ? <Orders /> : <Navigate to="/login" />
                      }
                    />
                    <Route
                      path="/promotions"
                      element={
                        currentUser ? <Promotions /> : <Navigate to="/login" />
                      }
                    />
                    <Route
                      path="/restaurant-info"
                      element={
                        currentUser ? (
                          <RestaurantProfile />
                        ) : (
                          <Navigate to="/login" />
                        )
                      }
                    />

                    {/* Route mặc định */}
                    <Route
                      path="*"
                      element={
                        <Navigate to={currentUser ? "/dashboard" : "/login"} />
                      }
                    />
                  </Routes>
                </div>
              </div>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </CategoryProvider>
          </PromotionProvider>
        </OrderProvider>
      </FoodProvider>
    </RestaurantProvider>
  );
};

export default App;
