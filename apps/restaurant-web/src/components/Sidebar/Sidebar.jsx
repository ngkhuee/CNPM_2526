import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.png";
import { authService } from "@api/services";
import { RestaurantContext } from "../../Context/RestaurantContext";
import {
  MdDashboard,
  MdRestaurantMenu,
  MdShoppingCart,
  MdCardGiftcard,
  MdCategory,
  MdLocalShipping,
  MdRestaurant,
  MdLogout,
} from "react-icons/md";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const { currentRestaurant } = useContext(RestaurantContext);

  const handleLogout = () => {
    // Clear authentication
    authService.logout();

    // Call parent logout handler if provided
    if (onLogout) {
      onLogout();
    }

    // Navigate to login
    navigate("/login");
  };
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" />
          <h2>{currentRestaurant?.name || "Restaurant"}</h2>
        </div>

        {/* Menu */}
        <nav className="sidebar-menu">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdDashboard /> Dashboard
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdCategory /> Categories
          </NavLink>
          <NavLink
            to="/list"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdRestaurantMenu /> Food List
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdShoppingCart /> Orders
          </NavLink>
          <NavLink
            to="/promotions"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdCardGiftcard /> Promotions
          </NavLink>
          <NavLink
            to="/order-status"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdLocalShipping /> Order Status
          </NavLink>
          <NavLink
            to="/restaurant-info"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdRestaurant /> Restaurant Info
          </NavLink>
        </nav>
      </div>

      {/* Footer - Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
