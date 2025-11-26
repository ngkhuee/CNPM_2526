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
      toast.error("Vui lòng đăng nhập để đặt hàng");
      navigate("/cart");
    } else if (!cart?.items || cart.items.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      navigate("/cart");
    } else {
      // Navigate to checkout-info page
      navigate("/checkout-info");
    }
  }, [user, cart, navigate]);

  return (
    <div className="place-order">
      <p>Đang chuyển đến trang thanh toán...</p>
    </div>
  );
};

export default PlaceOrder;
