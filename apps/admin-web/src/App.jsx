import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import Orders from "./pages/Orders/Orders";
import Partners from "./pages/Partners/Partners";
import Delivery from "./pages/Delivery/Delivery";
import Users from "./pages/Users/Users";
import Promotions from "./pages/Promotions/Promotions";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AdminAuthProvider,
  AdminAuthContext,
} from "./Context/AdminAuthContext";
import { OrderProvider } from "./Context/OrderContext";
import { SystemStatsProvider } from "./Context/SystemStatsContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AdminAuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <AdminAuthProvider>
      <OrderProvider>
        <SystemStatsProvider>
          <AppContent />
          <ToastContainer />
        </SystemStatsProvider>
      </OrderProvider>
    </AdminAuthProvider>
  );
}

const AppContent = () => {
  const { isAuthenticated } = React.useContext(AdminAuthContext);

  return (
    <div className="admin-container">
      {isAuthenticated && <Sidebar />}
      <div className="admin-content">
        <Routes>
          <Route
            path="/admin/login"
            element={isAuthenticated ? <Navigate to="/admin" /> : <Login />}
          />

          {/* Protected routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/partners"
            element={
              <ProtectedRoute>
                <Partners />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/delivery"
            element={
              <ProtectedRoute>
                <Delivery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promotions"
            element={
              <ProtectedRoute>
                <Promotions />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/admin" : "/admin/login"} />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
