import React, { useContext } from "react";
import { FoodDetail } from "shared-ui";
import { AuthContext } from "customer-shared";
import { useUserOrderHistory } from "customer-shared";

/**
 * FoodDetailPopup - Wrapper for FoodDetail component
 * @param {Object} food - Food item data
 * @param {Function} onClose - Close popup callback
 * @param {Function} addToCart - Add to cart callback (optional)
 * @param {Boolean} fromRestaurantDetail - Whether opened from RestaurantDetail page
 */
const FoodDetailPopup = ({ food, onClose, addToCart, fromRestaurantDetail = false }) => {
  const { user } = useContext(AuthContext);
  const { hasPurchased } = useUserOrderHistory(user?.id, food?.id || food?._id);

  if (!food) return null;

  const handleAddToCart = (foodId, quantity) => {
    if (addToCart) {
      // Add item 'quantity' times
      for (let i = 0; i < quantity; i++) {
        addToCart(foodId);
      }
    }
  };

  return (
    <FoodDetail
      food={food}
      onClose={onClose}
      userRole="customer"
      currentUserId={user?.id}
      onAddToCart={fromRestaurantDetail ? handleAddToCart : null}
      canReview={hasPurchased}
    />
  );
};

export default FoodDetailPopup;
