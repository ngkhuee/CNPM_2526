import React, { useState } from 'react';
import { Route, Routes,Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Dashboard from './pages/Dashboard/Dashboard'; // import Dashboard
import Promotions from './pages/Promotions/Promotions';
import Category from './pages/Category/Category';
import RestaurantProfile from './pages/RestaurantProfile/RestaurantProfile';
import Login from './pages/Login/Login';

const App = () => {
  const [foods, setFoods] = useState([]);
  const [restaurants] = useState([
    "Texas", "Lotteria", "Today With You", "Burger King", "4P's", "Belga"
  ]);
   const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('loggedInRestaurant')) || null
  );

  // return (
  //   <div className="app">
  //     <div className="app-content">
  //       <Sidebar />
  //       <div className="main-content">
  //         <Routes>
  //           <Route path="/" element={<Navigate to="/login" />} />
  //           <Route path="/login" element={<Login />} /> 
  //           <Route path="/dashboard" element={<Dashboard />} />
  //           <Route path="/add" element={<Add foods={foods} setFoods={setFoods} restaurants={restaurants} />} />
  //           <Route path="/list" element={<List foods={foods} setFoods={setFoods} restaurants={restaurants} />} />
  //           <Route path="/orders" element={<Orders currentRestaurant="Lotteria" />} />
  //           <Route path="/promotions" element={<Promotions />} />
  //           <Route path="/categories" element={<Category />} />
  //           <Route path="/restaurant-info" element={<RestaurantProfile />} />
  //         </Routes>
  //       </div>
  //     </div>
  //   </div>
  // );

  // return (
  //   <div className="app">
  //     {currentUser && <Sidebar />}
  //     <div className="app-content">
  //       <Routes>
  //         <Route 
  //           path="/login" 
  //           element={currentUser ? <Navigate to="/dashboard" /> : <Login setCurrentUser={setCurrentUser} />} 
  //         />
          
  //         {/* Các route bảo vệ */}
  //         <Route 
  //           path="/dashboard" 
  //           element={currentUser ? <Dashboard /> : <Navigate to="/login" />} 
  //         />
  //         <Route 
  //           path="/add" 
  //           element={currentUser ? <Add foods={foods} setFoods={setFoods} restaurants={restaurants} /> : <Navigate to="/login" />} 
  //         />
  //         <Route 
  //           path="/list" 
  //           element={currentUser ? <List foods={foods} setFoods={setFoods} restaurants={restaurants} /> : <Navigate to="/login" />} 
  //         />
  //         <Route 
  //           path="/orders" 
  //           element={currentUser ? <Orders currentRestaurant={currentUser} /> : <Navigate to="/login" />} 
  //         />
  //         <Route 
  //           path="/promotions" 
  //           element={currentUser ? <Promotions /> : <Navigate to="/login" />} 
  //         />
  //         <Route 
  //           path="/categories" 
  //           element={currentUser ? <Category /> : <Navigate to="/login" />} 
  //         />
  //         <Route 
  //           path="/restaurant-info" 
  //           element={currentUser ? <RestaurantProfile /> : <Navigate to="/login" />} 
  //         />

  //         {/* Route mặc định */}
  //         <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
  //       </Routes>
  //     </div>
  //   </div>
  // );

  return (
    <div className="app">
      {/* Sidebar chỉ hiển thị khi đã login */}
      {currentUser && <Sidebar setCurrentUser={setCurrentUser}/>}

      {/* Main content */}
      <div className={`app-content ${currentUser ? 'with-sidebar' : ''}`}>
        <Routes>
          <Route 
            path="/login" 
            element={currentUser ? <Navigate to="/dashboard" /> : <Login setCurrentUser={setCurrentUser} />} 
          />

          {/* Các route bảo vệ */}
          <Route 
            path="/dashboard" 
            element={currentUser ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/add" 
            element={currentUser ? <Add foods={foods} setFoods={setFoods} restaurants={restaurants} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/list" 
            element={currentUser ? <List foods={foods} setFoods={setFoods} restaurants={restaurants} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/orders" 
            element={currentUser ? <Orders currentRestaurant={currentUser} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/promotions" 
            element={currentUser ? <Promotions /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/categories" 
            element={currentUser ? <Category /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/restaurant-info" 
            element={currentUser ? <RestaurantProfile /> : <Navigate to="/login" />} 
          />

          {/* Route mặc định */}
          <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
