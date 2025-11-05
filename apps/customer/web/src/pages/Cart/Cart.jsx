import React, { useContext, useState } from "react";
import "./Cart.css";
import {
  AuthContext,
  CartContext,
  StoreContext,
  OrderContext,
  calculateCartTotals,
  usePromotions,
  useSettings,
} from "customer-shared";
import { formatCurrency } from "shared-utils";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, removeFromCart, getTotalCartAmount, setCartItems } =
    useContext(CartContext);
  const { food_list } = useContext(StoreContext);
  const { addOrder } = useContext(OrderContext);
  const navigate = useNavigate();

  // Use custom hooks
  const { promotions, loading: loadingPromos } = usePromotions();
  const { deliveryFee: deliveryFeeValue } = useSettings();

  const [appliedPromo, setAppliedPromo] = useState(null);

  const subtotal = getTotalCartAmount(food_list);
  const { discountAmount, deliveryFee, total } = calculateCartTotals(
    subtotal,
    appliedPromo,
    deliveryFeeValue
  );

  const handleCheckout = () => {
    if (!user) {
      alert("Vui lòng đăng nhập trước khi đặt hàng.");
      return;
    }

    if (subtotal === 0) {
      alert("Giỏ hàng đang trống.");
      return;
    }

    const newOrder = {
      id: Date.now(),
      user: user.name,
      items: food_list
        .filter((item) => cartItems[item._id] > 0)
        .map((item) => ({
          name: item.name,
          restaurant: item.restaurant,
          quantity: cartItems[item._id],
          price: item.price, // Price already in VND from DB
          total: item.price * cartItems[item._id],
        })),
      status: "Pending",
      createdAt: new Date().toLocaleString(),
    };

    addOrder(newOrder);
    setCartItems({});
    navigate("/myorders");
  };

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p>{" "}
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img src={item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{formatCurrency(item.price)}</p>
                  <div>{cartItems[item._id]}</div>
                  <p>{formatCurrency(item.price * cartItems[item._id])}</p>
                  <p
                    className="cart-items-remove-icon"
                    onClick={() => removeFromCart(item._id)}
                  >
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{formatCurrency(subtotal)}</p>
            </div>
            {appliedPromo && (
              <div className="cart-total-details">
                <p>Discount ({appliedPromo.code})</p>
                <p>-{formatCurrency(discountAmount)}</p>
              </div>
            )}
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{formatCurrency(deliveryFee)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{formatCurrency(total)}</b>
            </div>
          </div>
          <button onClick={() => navigate("/checkout-info")}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <h2>Promo Code</h2>
          {loadingPromos ? (
            <p>Đang tải mã khuyến mãi...</p>
          ) : (
            <div className="promo-list">
              {promotions.map((promo) => (
                <div key={promo.id} className="promo-item">
                  <span>
                    {promo.code} -{" "}
                    {promo.type === "fixed"
                      ? `Giảm ${formatCurrency(promo.value)}`
                      : `Giảm ${promo.value}%`}
                  </span>
                  {appliedPromo && appliedPromo.id === promo.id ? (
                    <button
                      className="remove-btn"
                      onClick={() => setAppliedPromo(null)}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      className="apply-btn"
                      onClick={() => setAppliedPromo(promo)}
                    >
                      Apply
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
