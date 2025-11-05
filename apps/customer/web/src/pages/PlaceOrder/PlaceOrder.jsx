import React, { useContext, useEffect } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const { token, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to cart if not logged in or cart is empty
    if (!token) {
      toast.error("Please sign in to place an order");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    } else {
      // Navigate to checkout-info page
      navigate("/checkout-info");
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <div className="place-order">
      <p>Redirecting to checkout...</p>
    </div>
  );
};

export default PlaceOrder;
