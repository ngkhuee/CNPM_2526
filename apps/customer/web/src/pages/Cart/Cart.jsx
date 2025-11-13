import React, { useContext, useState } from "react";
import "./Cart.css";
import {
  AuthContext,
  CartContext,
  OrderContext,
  calculateCartTotals,
  usePromotions,
  useSettings,
} from "customer-shared";
import { formatCurrency } from "shared-utils";
import { useNavigate } from "react-router-dom";
import { restaurantService } from "shared-services";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cart, removeItem, updateItem, getTotalCartAmount } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const navigate = useNavigate();

  // Use custom hooks
  const { promotions, loading: loadingPromos } = usePromotions();
  const { deliveryFee: deliveryFeeValue } = useSettings();

  const [appliedPromo, setAppliedPromo] = useState(null);

  const subtotal = getTotalCartAmount();
  const { discountAmount, deliveryFee, total } = calculateCartTotals(
    subtotal,
    appliedPromo,
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

    // Check if restaurant is open
    try {
      const restaurant = await restaurantService.getById(cart.restaurant_id);
      if (!restaurant) {
        alert("The restaurant in your cart is no longer available.");
        return;
      }

      // Note: Restaurant openness check should be done at restaurant service level
      // For now, we'll proceed with checkout
      navigate("/checkout-info");
    } catch (err) {
      alert("Error validating restaurant. Please try again.");
      console.error(err);
    }
  };

  // Check if cart is empty
  const isCartEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p> <p>Title</p> <p>Price</p> <p>Quantity</p>{" "}
          <p>Total</p> <p>Remove</p>
        </div>
        <br />
        <hr />
        {isCartEmpty ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#999",
            }}
          >
            <h2>Your Cart is Empty</h2>
            <p>Add your favorite dishes to cart!</p>
            <button
              onClick={() => navigate("/menu")}
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                background: "#ff6b35",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              View Menu
            </button>
          </div>
        ) : (
          cart.items.map((item, index) => {
            return (
              <div key={item.item_id}>
                <div className="cart-items-title cart-items-item">
                  <p>{index + 1}</p>
                  {/* <img src={item.image} alt="" /> */}
                  <p>{item.name || item.food_name}</p>
                  <p>{formatCurrency(item.price)}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateItem(item.item_id, item.quantity - 1, item.note)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.item_id, item.quantity + 1, item.note)}
                    >
                      +
                    </button>
                  </div>
                  <p>{formatCurrency(item.price * item.quantity)}</p>
                  <p
                    className="cart-items-remove-icon"
                    onClick={() => removeItem(item.item_id)}
                    style={{ cursor: "pointer" }}
                  >
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          })
        )}
      </div>

      {!isCartEmpty && (
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
              <p>Loading promotions...</p>
            ) : (
              <div className="promo-list">
                {promotions.map((promo) => (
                  <div key={promo.id} className="promo-item">
                    <span>
                      {promo.code} -{" "}
                      {promo.type === "fixed"
                        ? `Save ${formatCurrency(promo.value)}`
                        : `Save ${promo.value}%`}
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
      )}
    </div>
  );
};

export default Cart;
