import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.png";
import { AuthContext } from "../../Context/AuthContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import {
  MdDashboard,
  MdRestaurantMenu,
  MdShoppingCart,
  MdCardGiftcard,
  MdCategory,
  MdRestaurant,
  MdLogout,
  MdRateReview,
  MdAttachMoney,
  MdInfo,
} from "react-icons/md";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { currentRestaurant } = useContext(RestaurantContext);

  const handleLogout = () => {
    logout();
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
            <MdDashboard /> Bảng điều khiển
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdCategory /> Danh mục
          </NavLink>
          <NavLink
            to="/list"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdRestaurantMenu /> Danh sách món ăn
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdShoppingCart /> Đơn hàng
          </NavLink>
          <NavLink
            to="/reviews"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdRateReview /> Đánh giá
          </NavLink>
          <NavLink
            to="/promotions"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdCardGiftcard /> Khuyến mãi
          </NavLink>
          <NavLink
            to="/restaurant-info"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdInfo /> Thông tin nhà hàng
          </NavLink>
          <NavLink
            to="/payment"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdAttachMoney /> Thanh toán & Rút tiền
          </NavLink>
        </nav>
      </div>

      {/* Footer - Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
