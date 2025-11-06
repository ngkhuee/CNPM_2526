import React, { useContext } from "react";
import { FoodDetail } from "shared-ui";
import { AuthContext } from "customer-shared";

const FoodDetailPopup = ({ food, onClose, addToCart }) => {
  const { user } = useContext(AuthContext);

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
      onAddToCart={handleAddToCart}
    />
  );
};

export default FoodDetailPopup;
