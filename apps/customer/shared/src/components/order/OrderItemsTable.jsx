import React from "react";
import { MdCheckCircle, MdStar, MdStarBorder } from "react-icons/md";
import { formatCurrency } from "shared-utils";
import { ORDER_STATUS } from "shared-constants";

const OrderItemsTable = ({
    items,
    orderStatus,
    reviewedFoods,
    onReviewClick,
}) => {
    // Check if order can be reviewed (only delivered orders can be reviewed)
    const canReviewThisOrder = orderStatus === ORDER_STATUS.DELIVERED;

    if (!items || items.length === 0) return null;

    return (
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    {canReviewThisOrder && <th>Review</th>}
                </tr>
            </thead>
            <tbody>
                {items.map((item, i) => (
                    <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unit_price || item.price || 0)}</td>
                        <td>
                            {formatCurrency(
                                item.subtotal ||
                                (item.unit_price || item.price || 0) * item.quantity
                            )}
                        </td>
                        {canReviewThisOrder && (
                            <td>
                                {reviewedFoods[item.foodId || item.id] ? (
                                    <button
                                        style={{
                                            background: "#6c757d",
                                            color: "white",
                                            border: "none",
                                            padding: "6px 12px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            cursor: "not-allowed",
                                            opacity: 0.6,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                        disabled
                                    >
                                        <MdCheckCircle size={14} /> Reviewed
                                    </button>
                                ) : (
                                    <button
                                        style={{
                                            background: "#ff9800",
                                            color: "white",
                                            border: "none",
                                            padding: "6px 12px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            transition: "all 0.2s ease",
                                        }}
                                        onClick={() => onReviewClick(item)}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = "#f57c00";
                                            e.target.style.transform = "translateY(-1px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = "#ff9800";
                                            e.target.style.transform = "translateY(0)";
                                        }}
                                    >
                                        <MdStar size={14} /> Rate
                                    </button>
                                )}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default OrderItemsTable;
