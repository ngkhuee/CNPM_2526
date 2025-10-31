import React from "react";
import { NavLink, useNavigate  } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.png";

const Sidebar = ({ setCurrentUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
      // Xóa user khỏi state và localStorage
      setCurrentUser(null);
      localStorage.removeItem('loggedInRestaurant');
      // Chuyển về trang login
      navigate("/login");
    };
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" />
          <h2>Restaurant Admin</h2>
        </div>

        {/* Menu */}
        <nav className="sidebar-menu">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/list" className={({ isActive }) => (isActive ? "active" : "")}>
            📋 Food List
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            🛒 Orders
          </NavLink>
          <NavLink to="/promotions" className={({ isActive }) => (isActive ? "active" : "")}>
            🎁 Promotions
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? "active" : "")}>
            🗂️ Categories
          </NavLink>
          <NavLink to="/order-status" className={({ isActive }) => (isActive ? "active" : "")}>
            📦 Order Status
          </NavLink>
          <NavLink to="/restaurant-info" className={({ isActive }) => (isActive ? "active" : "")}>
            🍽️ Restaurant Info
          </NavLink>
        </nav>
      </div>

      {/* Footer - Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
