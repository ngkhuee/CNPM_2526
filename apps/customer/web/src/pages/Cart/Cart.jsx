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
import { formatCurrency } from "shared-utils";
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

  // Validate and apply promotion with min order check
  const handleApplyPromotion = (promo) => {
    const minOrderValue = promo.minOrderValue || promo.min_order_value || 0;

    // Check minimum order value
    if (minOrderValue > 0 && subtotal < minOrderValue) {
      alert(`Đơn tối thiểu: ${formatCurrency(minOrderValue)}. Đơn hiện tại: ${formatCurrency(subtotal)}`);
      return;
    }

    // Check date range
    const now = new Date();
    const startDate = new Date(promo.startDate || promo.start_date);
    const endDate = new Date(promo.endDate || promo.end_date);

    if (now < startDate) {
      alert('Khuyến mãi chưa bắt đầu');
      return;
    }

    if (now > endDate) {
      alert('Khuyến mãi đã hết hạn');
      return;
    }

    // All validations passed
    setAppliedPromotion(promo);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập trước khi đặt hàng.");
      return;
    }

    if (subtotal === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }

    try {
      const restaurant = await restaurantService.getById(cart.restaurant_id);
      if (!restaurant) {
        alert("Nhà hàng trong giỏ hàng không còn hoạt động.");
        return;
      }

      navigate("/checkout-info");
    } catch (err) {
      alert("Lỗi kiểm tra nhà hàng. Vui lòng thử lại.");
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
          onApplyPromo={handleApplyPromotion}
          onRemovePromo={() => setAppliedPromotion(null)}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
};

export default Cart;
