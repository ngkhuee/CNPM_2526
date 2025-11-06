import React, { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext, CartContext, StoreContext } from "customer-shared";

const Navbar = ({ setShowLogin }) => {
  const { user, logout } = useContext(AuthContext);
  const { getTotalCartAmount } = useContext(CartContext);
  const { food_list } = useContext(StoreContext);
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
        <a href="#app-download">Mobile App</a>
        <a href="#footer">Contact Us</a>
      </ul>

      <div className="navbar-right">
        <NavLink to="/cart" className="navbar-search-icon">
          <img src={assets.basket_icon} alt="Cart" />
          <div className={getTotalCartAmount(food_list) > 0 ? "dot" : ""}></div>
        </NavLink>

        {!user ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className="navbar-profile">
            <img
              src={user.avatar || assets.profile_icon}
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
