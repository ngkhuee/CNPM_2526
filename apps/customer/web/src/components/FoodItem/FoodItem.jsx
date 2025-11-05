import React, { useContext, useState } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { CartContext } from "customer-shared";
import FoodDetailPopup from "../FoodDetailPopup/FoodDetailPopup";
import { getImageUrl } from "@utils/imageHelper";
import { formatCurrency } from "shared-utils";
import { MdStorefront } from "react-icons/md";

const FoodItem = ({ image, name, price, desc, id, restaurant }) => {
  const [showPopup, setShowPopup] = useState(false);

  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);

  const food = { id, image, name, price, description: desc };
  const imageUrl = getImageUrl(image); // Build full URL from backend path

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={imageUrl}
          alt={name}
          onClick={openPopup}
        />

        {!cartItems[id] ? (
          // Nếu chưa có trong giỏ thì hiện nút thêm
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="add"
          />
        ) : (
          // Nếu có rồi thì hiện bộ đếm tăng/giảm
          <div className="food-item-counter">
            <img
              src={assets.remove_icon_red}
              onClick={() => removeFromCart(id)}
              alt="remove"
            />
            <p>{cartItems[id]}</p>
            <img
              src={assets.add_icon_green}
              onClick={() => addToCart(id)}
              alt="add"
            />
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p> <img src={assets.rating_starts} alt="" />
        </div>
        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">{formatCurrency(price)}</p>
        <p
          className="food-item-restaurant"
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <MdStorefront /> {restaurant}
        </p>
      </div>
      {showPopup && (
        <FoodDetailPopup
          food={food}
          onClose={closePopup}
          addToCart={(itemId, qty) => {
            addToCart(itemId, qty);
          }}
        />
      )}
    </div>
  );
};

export default FoodItem;
