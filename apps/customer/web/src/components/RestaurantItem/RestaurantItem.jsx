import React from "react";
import { useNavigate } from "react-router-dom";
import "../FoodItem/FoodItem.css";
import "./RestaurantItem.css";
import { getImageUrl } from "@utils/imageHelper";
import { formatRating } from "shared-utils";
import { MdStar } from "react-icons/md";

const RestaurantItem = ({
  id,
  image,
  name,
  desc,
  rating,
  isOpen,
}) => {
  const navigate = useNavigate();
  const imageUrl = getImageUrl(image); // Build full URL from backend path

  const handleClick = () => {
    if (id) {
      navigate(`/restaurant/${id}`);
    }
  };

  return (
    <div
      className="restaurant-item"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="restaurant-item-img-container">
        <img className="restaurant-item-image" src={imageUrl} alt={name} />
        {!isOpen && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "#dc3545",
              color: "white",
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Đóng cửa
          </div>
        )}
      </div>
      <div className="restaurant-item-info">
        <p className="restaurant-item-name-rating">{name}</p>
        {rating > 0 && (
          <div
            style={{
              fontSize: "14px",
              color: "#ff6b35",
              margin: "5px 0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <MdStar size={16} />
            {formatRating(rating)}
          </div>
        )}
        <p className="restaurant-item-desc">{desc}</p>
      </div>
    </div>
  );
};

export default RestaurantItem;
