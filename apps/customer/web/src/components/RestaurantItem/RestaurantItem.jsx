import React from "react";
import { useNavigate } from "react-router-dom";
import "../FoodItem/FoodItem.css";
import { getImageUrl } from "@utils/imageHelper";
import { MdStar, MdAccessTime } from "react-icons/md";

const RestaurantItem = ({
  id,
  image,
  name,
  desc,
  rating,
  deliveryTime,
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
      className="food-item"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="food-item-img-container">
        <img className="food-item-image" src={imageUrl} alt={name} />
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
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Closed
          </div>
        )}
      </div>
      <div className="food-item-info">
        <p className="food-item-name-rating">{name}</p>
        {rating > 0 && (
          <div
            style={{
              fontSize: "14px",
              color: "#ff6b35",
              marginBottom: "5px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <MdStar size={16} />
            {rating.toFixed(1)}
            {deliveryTime && (
              <>
                <span style={{ color: "#999" }}>•</span>
                <MdAccessTime size={16} />
                {deliveryTime} mins
              </>
            )}
          </div>
        )}
        <p className="food-item-desc">{desc}</p>
      </div>
    </div>
  );
};

export default RestaurantItem;
