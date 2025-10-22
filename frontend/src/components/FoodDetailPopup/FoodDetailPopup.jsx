import React, { useState } from "react";
import "./FoodDetailPopup.css";

const FoodDetailPopup = ({ food, onClose, addToCart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!food) return null;

  const handleAddToCart = () => {
    // addToCart supports (itemId, qty)
    addToCart(food.id, quantity);
    onClose();
  };

  const increaseQty = () => setQuantity((prev) => prev + 1);
  const decreaseQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="popup-body">
          <img src={food.image} alt={food.name} className="popup-image" />

          <div className="popup-info">
            <h2 className="popup-title">{food.name}</h2>
            <p className="popup-description">{food.description}</p>
            <p className="popup-price">{(food.price * 1000).toLocaleString()}đ</p>

            <div className="quantity-control">
              <button onClick={decreaseQty}>−</button>
              <span>{quantity}</span>
              <button onClick={increaseQty}>+</button>
            </div>

            <button className="add-btn" onClick={handleAddToCart}>
              🛒 Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailPopup;
