import React from "react";
import { formatCurrency } from "shared-utils";

const CartSummary = ({
    subtotal,
    discountAmount,
    deliveryFee,
    total,
    appliedPromo,
    promotions,
    loadingPromos,
    onApplyPromo,
    onRemovePromo,
    onCheckout,
}) => {
    return (
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
                <button onClick={onCheckout}>PROCEED TO CHECKOUT</button>
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
                                    <button className="remove-btn" onClick={onRemovePromo}>
                                        Remove
                                    </button>
                                ) : (
                                    <button
                                        className="apply-btn"
                                        onClick={() => onApplyPromo(promo)}
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
    );
};

export default CartSummary;
