import React, { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext, CartContext } from "customer-shared";
import { MdStorefront } from "react-icons/md";

const Navbar = ({ setShowLogin }) => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const logoutHandler = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img className="logo" src={assets.logo} alt="" />
      </Link>

      <ul className="navbar-menu">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/menu"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Menu
        </NavLink>
        <NavLink
          to="/register-restaurant"
          className={({ isActive }) =>
            isActive ? "active partner-link" : "partner-link"
          }
        >
          <MdStorefront style={{ verticalAlign: "middle" }} /> Become a Partner
        </NavLink>
        <a href="#footer">Contact Us</a>
      </ul>

      <div className="navbar-right">
        <NavLink to="/cart" className="navbar-search-icon">
          <img src={assets.basket_icon} alt="Cart" />
          <div className={cart?.items?.length > 0 ? "dot" : ""}></div>
        </NavLink>

        {!user ? (
          <button onClick={() => setShowLogin(true)}>Login</button>
        ) : (
          <div className="navbar-profile">
            <img
              // ảnh user sau khi login
              src={user.profile_icon || assets.profile_icon}
              alt={user.name || "User"}
            />
            <ul className="navbar-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" /> <p>Orders</p>
              </li>
              <hr />
              <li onClick={logoutHandler}>
                <img src={assets.logout_icon} alt="" /> <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
