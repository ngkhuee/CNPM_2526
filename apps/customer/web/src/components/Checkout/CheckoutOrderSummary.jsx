import React from "react";
import { formatCurrency } from "shared-utils";

const CheckoutOrderSummary = ({ cart, subtotal, discountAmount, total }) => {
    return (
        <div className="checkout-section">
            <h3>Order Summary</h3>

            {/* Items Table */}
            {cart?.items && cart.items.length > 0 && (
                <table style={{ width: "100%", marginBottom: "20px" }}>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.name || item.food_name}</td>
                                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                <td>{formatCurrency(item.unit_price || item.price || 0)}</td>
                                <td>
                                    {formatCurrency(
                                        (item.unit_price || item.price || 0) * item.quantity
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Totals */}
            <div className="checkout-totals">
                <div className="checkout-total-row">
                    <span>Subtotal:</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                </div>
                {discountAmount > 0 && (
                    <div className="checkout-total-row">
                        <span>Discount:</span>
                        <strong style={{ color: "#28a745" }}>
                            -{formatCurrency(discountAmount)}
                        </strong>
                    </div>
                )}
                <hr />
                <div className="checkout-total-row" style={{ fontSize: "18px" }}>
                    <strong>Total:</strong>
                    <strong style={{ color: "#ff6b35" }}>{formatCurrency(total)}</strong>
                </div>
            </div>
        </div>
    );
};

export default CheckoutOrderSummary;
