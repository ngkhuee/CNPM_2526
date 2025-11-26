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
                <h2>Tổng giỏ hàng</h2>
                <div>
                    <div className="cart-total-details">
                        <p>Tạm tính</p>
                        <p>{formatCurrency(subtotal)}</p>
                    </div>
                    {appliedPromo && (
                        <div className="cart-total-details">
                            <p>Giảm giá ({appliedPromo.code})</p>
                            <p>-{formatCurrency(discountAmount)}</p>
                        </div>
                    )}
                    <hr />
                    <div className="cart-total-details">
                        <p>Phí giao hàng</p>
                        <p>{formatCurrency(deliveryFee)}</p>
                    </div>
                    <hr />
                    <div className="cart-total-details">
                        <b>Tổng cộng</b>
                        <b>{formatCurrency(total)}</b>
                    </div>
                </div>
                <button onClick={onCheckout}>TIẾN HÀNH THANH TOÁN</button>
            </div>

            <div className="cart-promocode">
                <h2>Mã khuyến mãi</h2>
                {loadingPromos ? (
                    <p>Đang tải khuyến mãi...</p>
                ) : (
                    <div className="promo-list">
                        {promotions.map((promo) => (
                            <div key={promo.id} className="promo-item">
                                <span>
                                    {promo.code} -{" "}
                                    {promo.type === "fixed_amount" || promo.type === "fixed"
                                        ? `Tiết kiệm ${formatCurrency(promo.value)}`
                                        : `Tiết kiệm ${promo.value}%`}
                                </span>
                                {appliedPromo && appliedPromo.id === promo.id ? (
                                    <button className="remove-btn" onClick={onRemovePromo}>
                                        Bỏ
                                    </button>
                                ) : (
                                    <button
                                        className="apply-btn"
                                        onClick={() => onApplyPromo(promo)}
                                    >
                                        Áp dụng
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
