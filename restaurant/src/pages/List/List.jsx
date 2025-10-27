import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './List.css';

const List = ({ foods, setFoods }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const storedFoods = JSON.parse(localStorage.getItem('foods') || '[]');
    setFoods(storedFoods);
  }, [setFoods]);

  const updateFoods = (newFoods) => {
    setFoods(newFoods);
    localStorage.setItem('foods', JSON.stringify(newFoods));
  };

  const removeFood = (id) => updateFoods(foods.filter((f) => f.id !== id));

  const formatVND = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0);

  const categories = ['All', ...new Set(foods.map((f) => f.category || 'Uncategorized'))];

  const filteredFoods = foods.filter((item) => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchName && matchCategory;
  });

  return (
    <div className="main-content">
      <div className="list-header">
        <h2>All Foods List</h2>
        <button className="add-btn" onClick={() => navigate('/add')}>
          + Add New Food
        </button>
      </div>

      <div className="list-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="cards-wrapper">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <div className="food-card" key={food.id}>
              <div className="food-img-wrapper">
                {food.image ? <img src={food.image} alt={food.name} /> : <p>No image</p>}
              </div>
              <div className="food-info">
                <h4>{food.name}</h4>
                <p>{food.restaurantName}</p>
                <p>{formatVND(food.price)}</p>
              </div>
              <div className="card-actions">
                <button className="remove-btn" onClick={() => removeFood(food.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-foods">No foods available</p>
        )}
      </div>
    </div>
  );
};

export default List;
