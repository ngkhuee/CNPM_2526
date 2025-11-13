import React from "react";
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
import Reviews from "./pages/Reviews/Reviews";
import Payment from "./pages/Payment/Payment";
import { AuthProvider, AuthContext } from "./Context/AuthContext";
import { RestaurantProvider } from "./Context/RestaurantContext";
import { FoodProvider } from "./Context/FoodContext";
import { OrderProvider } from "./Context/OrderContext";
import { PromotionProvider } from "./Context/PromotionContext";
import { CategoryProvider } from "./Context/CategoryContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthValidation } from "./hooks/useAuthValidation";
import { useRestaurantInfo } from "./hooks/useRestaurantInfo";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Component that uses hooks inside provider tree
const AppContent = () => {
  const { isAuthenticated } = React.useContext(AuthContext);
  useAuthValidation();
  useRestaurantInfo();

  return (
    <div className="app">
      {isAuthenticated && <Sidebar />}

      <div className={`app-content ${isAuthenticated ? "with-sidebar" : ""}`}>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Category />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <Add />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <List />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/promotions"
            element={
              <ProtectedRoute>
                <Promotions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-info"
            element={
              <ProtectedRoute>
                <RestaurantProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <FoodProvider>
          <OrderProvider>
            <PromotionProvider>
              <CategoryProvider>
                <AppContent />
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
    </AuthProvider>
  );
};

export default App;
