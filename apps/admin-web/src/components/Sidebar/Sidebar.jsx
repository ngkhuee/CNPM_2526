import React, { useContext } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AdminAuthContext } from "../../Context/AdminAuthContext";
import { DroneIcon } from "shared-ui";
import {
  MdDashboard,
  MdShoppingCart,
  MdPeople,
  MdSettings,
  MdLogout,
  MdPerson,
  MdLocalOffer,
  MdAttachMoney,
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
          <h3>Bảng quản trị</h3>
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
          <p>Bảng điều khiển</p>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdShoppingCart size={24} />
          <p>Đơn hàng</p>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdPerson size={24} />
          <p>Người dùng</p>
        </NavLink>

        <NavLink
          to="/admin/partners"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdPeople size={24} />
          <p>Đối tác</p>
        </NavLink>

        <NavLink
          to="/admin/delivery"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <DroneIcon size={24} color="currentColor" />
          <p>Drone giao hàng</p>
        </NavLink>

        <NavLink
          to="/admin/promotions"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdLocalOffer size={24} />
          <p>Khuyến mãi</p>
        </NavLink>

        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <MdAttachMoney size={24} />
          <p>Thanh toán</p>
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
          <p>Cài đặt</p>
        </NavLink>

        <button onClick={handleLogout} className="logout-btn">
          <MdLogout size={24} />
          <p>Đăng xuất</p>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
