import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Dashboard from './pages/Dashboard/Dashboard'; // import Dashboard

const App = () => {
  const [foods, setFoods] = useState([]);
  const [restaurants] = useState([
    "Texas", "Lotteria", "Today With You", "Burger King", "4P's", "Belga"
  ]);

  return (
    <div className="app">
      <div className="app-content">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/add"
              element={<Add foods={foods} setFoods={setFoods} restaurants={restaurants} />}
            />
            <Route
              path="/list"
              element={<List foods={foods} setFoods={setFoods} restaurants={restaurants} />}
            />
            <Route path="/orders" element={<Orders currentRestaurant="Lotteria" />} />
            </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
