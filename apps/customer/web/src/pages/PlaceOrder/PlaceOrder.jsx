import React, { useContext, useEffect } from "react";
import "./PlaceOrder.css";
import { AuthContext, CartContext } from "customer-shared";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const { user } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to cart if not logged in or cart is empty
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/cart");
    } else if (!cart?.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    } else {
      // Navigate to checkout-info page
      navigate("/checkout-info");
    }
  }, [user, cart, navigate]);

  return (
    <div className="place-order">
      <p>Redirecting to checkout...</p>
    </div>
  );
};

export default PlaceOrder;
