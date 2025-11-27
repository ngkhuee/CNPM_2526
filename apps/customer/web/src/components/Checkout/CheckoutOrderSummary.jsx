import React, { useState } from "react";
import { formatCurrency } from "shared-utils";
import { MdClose, MdLocalOffer } from "react-icons/md";

const CheckoutOrderSummary = ({
    cart,
    subtotal,
    discountAmount,
    deliveryFee,
    total,
    appliedPromo,
    promotions,
    loadingPromos,
    onApplyPromo,
    onRemovePromo
}) => {
    const [showPromoCodes, setShowPromoCodes] = useState(false);

    return (
        <div className="checkout-summary">
            <h3>Tóm tắt đơn hàng</h3>

            {/* Items List */}
            {cart?.items && cart.items.length > 0 && (
                <div className="order-list">
                    {cart.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                            <div className="order-item-info">
                                <span className="item-name">{item.name || item.food_name}</span>
                                <span className="item-quantity">SL: {item.quantity}</span>
                            </div>
                            <span className="item-price">
                                {formatCurrency((item.unit_price || item.price || 0) * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Promotion Section */}
            <div style={{ marginBottom: "15px" }}>
                {appliedPromo ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px",
                            background: "#e8f5e9",
                            border: "1px solid #4caf50",
                            borderRadius: "6px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <MdLocalOffer color="#4caf50" />
                            <span style={{ fontSize: "14px", color: "#2e7d32" }}>
                                {appliedPromo.code} - {appliedPromo.name}
                            </span>
                        </div>
                        <MdClose
                            onClick={onRemovePromo}
                            style={{ cursor: "pointer", color: "#666" }}
                            size={20}
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => setShowPromoCodes(!showPromoCodes)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            background: "#fff",
                            border: "1px dashed #ff6b35",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            color: "#ff6b35",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        <MdLocalOffer />
                        {showPromoCodes ? "Ẩn khuyến mãi" : "Áp dụng khuyến mãi"}
                    </button>
                )}

                {/* Promotion List */}
                {showPromoCodes && !appliedPromo && (
                    <div
                        style={{
                            marginTop: "10px",
                            maxHeight: "200px",
                            overflowY: "auto",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            padding: "10px",
                        }}
                    >
                        {loadingPromos ? (
                            <p style={{ textAlign: "center", color: "#999" }}>Đang tải...</p>
                        ) : promotions && promotions.length > 0 ? (
                            promotions.map((promo) => (
                                <div
                                    key={promo.id}
                                    onClick={() => {
                                        onApplyPromo(promo);
                                        setShowPromoCodes(false);
                                    }}
                                    style={{
                                        padding: "10px",
                                        marginBottom: "8px",
                                        border: "1px solid #eee",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#f5f5f5";
                                        e.currentTarget.style.borderColor = "#ff6b35";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.borderColor = "#eee";
                                    }}
                                >
                                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                                        {promo.code}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#666" }}>
                                        {promo.name || promo.description}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                                        {promo.type === "percentage"
                                            ? `${promo.value}% off`
                                            : `${formatCurrency(promo.value)} off`}
                                        {(promo.minOrderValue || promo.min_order_value) > 0 &&
                                            ` • Min order: ${formatCurrency(promo.minOrderValue || promo.min_order_value)}`}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: "center", color: "#999" }}>
                                Không có khuyến mãi
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Totals */}
            <div className="order-total">
                <div className="total-row" style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", color: "#666" }}>Tạm tính:</span>
                    <span style={{ fontSize: "14px" }}>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="total-row" style={{ marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", color: "#4caf50" }}>Giảm giá:</span>
                        <span style={{ fontSize: "14px", color: "#4caf50" }}>
                            -{formatCurrency(discountAmount)}
                        </span>
                    </div>
                )}
                {deliveryFee > 0 && (
                    <div className="total-row" style={{ marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", color: "#666" }}>Phí giao hàng:</span>
                        <span style={{ fontSize: "14px" }}>{formatCurrency(deliveryFee)}</span>
                    </div>
                )}
                <div className="total-row" style={{ marginTop: "12px" }}>
                    <span>Tổng cộng:</span>
                    <span className="total-amount">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};

export default CheckoutOrderSummary;
