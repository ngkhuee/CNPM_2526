import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./FoodItem.css";
import { getImageUrl } from "@utils/imageHelper";
import { formatCurrency } from "shared-utils";
import { useProductRating } from "shared-hooks";
import { MdStorefront, MdStar, MdLocalFireDepartment } from "react-icons/md";

/**
 * FoodItem Component - Display single food item with dynamic rating
 * @param {Object} props
 * @param {Function} onItemClick - Callback when item is clicked (receives full food object)
 */
const FoodItem = ({
  image,
  name,
  price,
  desc,
  id,
  restaurant,
  rating: initialRating,
  sold,
  restaurantId,
  isRestaurantOpen = true,
  onItemClick = null, // Callback from parent (RestaurantDetail)
}) => {
  const navigate = useNavigate();

  // Fetch dynamic rating from reviews
  const { rating: dynamicRating } = useProductRating(id);

  // Use dynamic rating if available, otherwise use initial rating
  const displayRating = dynamicRating !== null ? dynamicRating : (initialRating || 0);

  const food = useMemo(() => ({
    id,
    image,
    name,
    price,
    description: desc,
    rating: displayRating,
    restaurant,
    restaurantId,
    sold: sold || 0,
  }), [id, image, name, price, desc, displayRating, restaurant, restaurantId, sold]);
  const imageUrl = getImageUrl(image);

  const handleClick = () => {
    if (onItemClick) {
      // Parent callback (RestaurantDetail uses this)
      onItemClick(food);
    } else {
      // Navigate to restaurant detail page (Home/Menu uses this)
      navigate(`/restaurant/${restaurantId}`);
    }
  };

  return (
    <div
      className="food-item"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={imageUrl}
          alt={name}
          style={!isRestaurantOpen ? { opacity: 0.6 } : {}}
        />

        {!isRestaurantOpen ? (
          <div className="closed-overlay">
            <span>Restaurant Closed</span>
          </div>
        ) : null}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          {displayRating !== undefined && displayRating !== null && (
            <span
              style={{
                color: "#ff6b35",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MdStar size={16} />
              {displayRating > 0 ? displayRating.toFixed(1) : "0"}{" "}
              {displayRating > 0 ? "" : ""}
            </span>
          )}
        </div>
        <p className="food-item-desc">{desc}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <p className="food-item-price">{formatCurrency(price)}</p>
          {sold !== undefined && sold !== null && (
            <span
              style={{
                fontSize: "12px",
                color: "#666",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MdLocalFireDepartment size={16} style={{ color: "#ff6b35" }} />
              {sold > 0 ? `${sold} sold` : "0 sold"}
            </span>
          )}
        </div>
        <p
          className="food-item-restaurant"
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <MdStorefront /> {restaurant}
        </p>
      </div>
    </div>
  );
};

export default FoodItem;
