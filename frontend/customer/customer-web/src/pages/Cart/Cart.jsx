import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { OrderContext } from "../../Context/OrderContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    user,
    setCartItems,
  } = useContext(StoreContext);
  const { addOrder } = useContext(OrderContext);
  const navigate = useNavigate();

  const promoCodes = [
    { code: "SALE10", discount: 10 },
    { code: "SALE20", discount: 20 },
  ];
  const [appliedPromo, setAppliedPromo] = useState(null);

  const subtotal = getTotalCartAmount();
  const discountAmount = appliedPromo
    ? (subtotal * appliedPromo.discount) / 100
    : 0;
  const deliveryFee = subtotal === 0 ? 0 : 15000;
  const total = subtotal - discountAmount + deliveryFee;

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
                  <p>{item.price.toLocaleString("vi-VN")}đ</p>
                  <div>{cartItems[item._id]}</div>
                  <p>
                    {(item.price * cartItems[item._id]).toLocaleString("vi-VN")}
                    đ
                  </p>
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
              <p>{subtotal.toLocaleString("vi-VN")}đ</p>
            </div>
            {appliedPromo && (
              <div className="cart-total-details">
                <p>Discount ({appliedPromo.code})</p>
                <p>-{discountAmount.toLocaleString("vi-VN")}đ</p>
              </div>
            )}
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{deliveryFee.toLocaleString("vi-VN")}đ</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{total.toLocaleString("vi-VN")}đ</b>
            </div>
          </div>
          <button onClick={() => navigate("/checkout-info")}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <h2>Promo Code</h2>
          <div className="promo-list">
            {promoCodes.map((promo, i) => (
              <div key={i} className="promo-item">
                <span>
                  {promo.code} - Giảm {promo.discount}%
                </span>
                {appliedPromo && appliedPromo.code === promo.code ? (
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
        </div>
      </div>
    </div>
  );
};

export default Cart;
