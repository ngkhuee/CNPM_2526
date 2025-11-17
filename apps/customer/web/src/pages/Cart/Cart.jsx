import React, { useContext } from "react";
import "./Cart.css";
import {
  AuthContext,
  CartContext,
  OrderContext,
  calculateCartTotals,
  usePromotions,
  useSettings,
} from "customer-shared";
import { useNavigate } from "react-router-dom";
import { restaurantService } from "shared-services";
import { CartItems, CartSummary } from "../../components/Cart";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cart, removeItem, updateItem, getTotalCartAmount, appliedPromotion, setAppliedPromotion } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const navigate = useNavigate();

  // Use custom hooks - pass restaurant_id to filter promotions
  const { promotions, loading: loadingPromos, getApplicablePromotions } = usePromotions(cart?.restaurant_id);
  const { deliveryFee: deliveryFeeValue } = useSettings();

  // Get promotions applicable to current cart's restaurant
  const applicablePromotions = cart?.restaurant_id
    ? getApplicablePromotions(cart.restaurant_id)
    : promotions.filter(p => p.status === "active");

  const subtotal = getTotalCartAmount();
  const { discountAmount, deliveryFee, total } = calculateCartTotals(
    subtotal,
    appliedPromotion,
    deliveryFeeValue
  );

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login before placing an order.");
      return;
    }

    if (subtotal === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const restaurant = await restaurantService.getById(cart.restaurant_id);
      if (!restaurant) {
        alert("The restaurant in your cart is no longer available.");
        return;
      }

      navigate("/checkout-info");
    } catch (err) {
      alert("Error validating restaurant. Please try again.");
      console.error(err);
    }
  };

  const isCartEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="cart">
      <CartItems
        items={cart?.items || []}
        isEmpty={isCartEmpty}
        onUpdateQuantity={updateItem}
        onRemoveItem={removeItem}
        onViewMenu={() => navigate("/menu")}
      />

      {!isCartEmpty && (
        <CartSummary
          subtotal={subtotal}
          discountAmount={discountAmount}
          deliveryFee={deliveryFee}
          total={total}
          appliedPromo={appliedPromotion}
          promotions={applicablePromotions}
          loadingPromos={loadingPromos}
          onApplyPromo={setAppliedPromotion}
          onRemovePromo={() => setAppliedPromotion(null)}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
};

export default Cart;
