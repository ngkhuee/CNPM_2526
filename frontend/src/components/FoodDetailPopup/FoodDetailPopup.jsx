import React, { useState } from "react";
import { createPortal } from "react-dom";
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

  const popup = (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="popup-inner">
          <div className="popup-left">
            <img src={food.image} alt={food.name} className="popup-image" />
          </div>

          <div className="popup-right">
            <h2 className="popup-title">{food.name}</h2>
            <p className="popup-description">{food.description}</p>
            <p className="popup-price">{(food.price * 1000).toLocaleString()}đ</p>

            <div className="quantity-control">
              <button onClick={decreaseQty}>−</button>
              <span>{quantity}</span>
              <button onClick={increaseQty}>+</button>
            </div>

            <button className="popup-cta" onClick={handleAddToCart}>
              GỌI ĐẶT HÀNG - 19006960
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(popup, document.body);
  }

  return popup;
};

export default FoodDetailPopup;
