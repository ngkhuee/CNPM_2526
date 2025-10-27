import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.png"; // 👈 Thay bằng logo thật của bạn

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" />
        <h2>Restaurant Admin</h2>
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          🏠 Dashboard
        </NavLink>
        {/* <NavLink to="/add" className={({ isActive }) => isActive ? "active" : ""}>
          ➕ Add Food
        </NavLink> */}
        <NavLink to="/list" className={({ isActive }) => isActive ? "active" : ""}>
          📋 Food List
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => isActive ? "active" : ""}>
          🛒 Orders
        </NavLink>
      </nav>

      {/* Logout ở cuối */}
      <div className="sidebar-footer">
        <button className="logout-btn">🚪 Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
