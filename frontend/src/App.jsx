import React, { useState } from 'react'
import Home from './pages/Home/Home'
import Menu from './pages/Menu/Menu'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import { users } from './assets/assets';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import { OrderProvider } from './Context/OrderContext';
import { RestaurantProvider } from './Context/RestaurantContext';
import Dashboard from './pages/Restaurant/Dashboard';
import Partners from './pages/Restaurant/Partners';
import Orders from './pages/Restaurant/Orders';
import MenuList from './pages/Restaurant/MenuList';
import MenuAdd from './pages/Restaurant/MenuAdd';
import { accounts } from './assets/assets';



// Xoá orders cũ khi reload (chỉ để test)
localStorage.removeItem("orders");
console.log("Đã xoá localStorage key 'orders'");

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null); // chọn nhà hàng để quản lý
  const navigate = useNavigate();
  
  const handleLogin = (email, password) => {
  const found = accounts.find(u => u.email === email && u.password === password);
  if (found) {
    localStorage.setItem("user", JSON.stringify(found));
    alert(`Đăng nhập thành công với role: ${found.role}`);
    
    if (found.role === "admin") {
      window.location.href = "http://localhost:5174/admin"; // admin app
    } else if (found.role === "restaurant") {
      navigate("/restaurant/dashboard"); // restaurant super-admin
    } else {
      navigate("/"); // user app
    }
  } else {
    alert("Email hoặc mật khẩu không đúng!");
  }
  };


  return (
    <OrderProvider>
      <RestaurantProvider>
        <ToastContainer/>
        {showLogin && <LoginPopup setShowLogin={setShowLogin} handleLogin={handleLogin} />}
        <div className='app'>
          <Navbar setShowLogin={setShowLogin}/>
          <Routes>
            {/* User frontend */}
            <Route path='/' element={<Home />}/>
            <Route path='/menu' element={<Menu />}/>
            <Route path='/cart' element={<Cart />}/>
            <Route path='/order' element={<PlaceOrder />}/>
            <Route path='/myorders' element={<MyOrders />}/>
            <Route path='/verify' element={<Verify />}/>

            {/* Restaurant super-admin */}
            <Route path='/restaurant/dashboard' element={<Dashboard />} />
            <Route path='/restaurant/partners' element={<Partners selectRestaurant={setRestaurantId} />} />
            <Route path='/restaurant/orders' element={<Orders restaurantId={restaurantId} />} />
            <Route path='/restaurant/menulist' element={<MenuList restaurantId={restaurantId} />} />
            <Route path='/restaurant/menuadd' element={<MenuAdd restaurantId={restaurantId} />} />
          </Routes>
        </div>
        <Footer />
      </RestaurantProvider>
    </OrderProvider>
  );
}

export default App;
