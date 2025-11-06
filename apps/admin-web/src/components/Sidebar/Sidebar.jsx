import React, { useContext } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AdminAuthContext } from "../../Context/AdminAuthContext";
import {
  MdDashboard,
  MdShoppingCart,
  MdPeople,
  MdLocalShipping,
  MdSettings,
  MdLogout,
  MdPerson,
  MdLocalOffer,
} from "react-icons/md";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AdminAuthContext);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="sidebar">
      {/* Phần trên: logo */}
      <div className="sidebar-top">
        <div className="sidebar-header">
          <img src={assets.logo} alt="Logo" className="sidebar-logo" />
          <h3>Admin Panel</h3>
        </div>

        {/* Menu admin */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdDashboard size={24} />
          <p>Dashboard</p>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdShoppingCart size={24} />
          <p>Orders</p>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdPerson size={24} />
          <p>Users</p>
        </NavLink>

        <NavLink
          to="/admin/partners"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdPeople size={24} />
          <p>Restaurants</p>
        </NavLink>

        <NavLink
          to="/admin/delivery"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdLocalShipping size={24} />
          <p>Delivery Drones</p>
        </NavLink>

        <NavLink
          to="/admin/promotions"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdLocalOffer size={24} />
          <p>Promotions</p>
        </NavLink>
      </div>

      {/* Phần dưới: settings & logout */}
      <div className="sidebar-bottom">
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdSettings size={24} />
          <p>Settings</p>
        </NavLink>

        <button onClick={handleLogout} className="logout-btn">
          <MdLogout size={24} />
          <p>Logout</p>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
