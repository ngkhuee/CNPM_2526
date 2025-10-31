import React, { useContext } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'

const Navbar = ({ setShowLogin }) => {
  const { getTotalCartAmount, user, logout } = useContext(StoreContext);
  const navigate = useNavigate();

  const logoutHandler = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='navbar'>
      <Link to='/'><img className='logo' src={assets.logo} alt="" /></Link>

      <ul className="navbar-menu">
        {user?.role === "restaurant" ? (
          <>
            <NavLink to="/restaurant/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
              Dashboard
            </NavLink>
            <NavLink to="/restaurant/partners" className={({ isActive }) => isActive ? "active" : ""}>
              Partners
            </NavLink>
            <NavLink to="/restaurant/orders" className={({ isActive }) => isActive ? "active" : ""}>
              Orders
            </NavLink>
            <NavLink to="/restaurant/menulist" className={({ isActive }) => isActive ? "active" : ""}>
              Menu
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
              Home
            </NavLink>
            <NavLink to="/menu" className={({ isActive }) => isActive ? "active" : ""}>
              Menu
            </NavLink>
            <a href='#app-download'>Mobile App</a>
            <a href='#footer'>Contact Us</a>
          </>
        )}
      </ul>

      <div className="navbar-right">
        {user?.role !== "restaurant" && (
          <NavLink to='/cart' className="navbar-search-icon">
            <img src={assets.basket_icon} alt="Cart" />
            <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
          </NavLink>
        )}

        {!user ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className='navbar-profile'>
            <img src={user.avatar || assets.profile_icon} alt={user.name || "User"} />
            <ul className='navbar-profile-dropdown'>
              {user.role === "restaurant" ? (
                <>
                  <li onClick={() => navigate('/restaurant/dashboard')}>
                    <p>Dashboard</p>
                  </li>
                  <hr />
                  <li onClick={logoutHandler}>
                    <p>Logout</p>
                  </li>
                </>
              ) : (
                <>
                  <li onClick={() => navigate('/myorders')}>
                    <img src={assets.bag_icon} alt="" /> <p>Orders</p>
                  </li>
                  <hr />
                  <li onClick={logoutHandler}>
                    <img src={assets.logout_icon} alt="" /> <p>Logout</p>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
