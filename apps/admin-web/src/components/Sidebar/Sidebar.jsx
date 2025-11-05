import React from 'react'
import  './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
        {/* Phần trên có thể để logo hoặc trống */}
        <div className="sidebar-top">
          {/* Ví dụ: logo */}
          <img src={assets.logo} alt="Logo" className="sidebar-logo" />

          {/* Phần dưới: menu admin */}
          <NavLink to='/admin' 
            end
            className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}>
              <img src={assets.parcel_icon} alt="" />
              <p>Dashboard</p>
          </NavLink>

          <NavLink to='/admin/orders' 
            className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}>
              <img src={assets.order_icon} alt="" />
              <p>Orders</p>
          </NavLink>

          <NavLink to='/admin/partners' 
            className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}>
              <img src={assets.profile_image} alt="" />
              <p>Partners</p>
          </NavLink>
          {/* Thêm mục Delivery */}
          <NavLink to='/admin/delivery' 
            className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}>
              <img src={assets.drone_icon} alt="Drone Icon" />
              <p>Delivery</p>
          </NavLink>
        </div>

        {/* Phần dưới: admin */}
        <div className="sidebar-bottom">
          <NavLink to='/admin/settings' 
            className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}>
              <img src={assets.add_icon} alt="" />
              <p>Settings</p>
          </NavLink>

          <NavLink to='/logout' className="sidebar-option">
              <img src={assets.add_icon} alt="" />
              <p>Logout</p>
          </NavLink>
        </div>
    </div>
  );
}

export default Sidebar
