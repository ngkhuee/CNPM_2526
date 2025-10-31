import React from 'react';
import "../FoodItem/FoodItem.css";


const RestaurantItem = ({ image, name, desc }) => {
  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={image} alt={name} />
      </div>
      <div className="food-item-info">
        <p className="food-item-name-rating">{name}</p>
        <p className="food-item-desc">{desc}</p>
      </div>
    </div>
  );
};

export default RestaurantItem;
