import React from "react";
import "../FoodItem/FoodItem.css";
import { getImageUrl } from "@utils/imageHelper";

const RestaurantItem = ({ image, name, desc }) => {
  const imageUrl = getImageUrl(image); // Build full URL from backend path

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={imageUrl} alt={name} />
      </div>
      <div className="food-item-info">
        <p className="food-item-name-rating">{name}</p>
        <p className="food-item-desc">{desc}</p>
      </div>
    </div>
  );
};

export default RestaurantItem;
