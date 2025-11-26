import React from "react";
import { formatCurrency } from "shared-utils";

const CartItems = ({
    items,
    isEmpty,
    onUpdateQuantity,
    onRemoveItem,
    onViewMenu,
}) => {
    return (
        <div className="cart-items">
            <div className="cart-items-title">
                <p>STT</p> <p>Tên món</p> <p>Giá</p> <p>Số lượng</p>{" "}
                <p>Tổng</p> <p>Xóa</p>
            </div>
            <br />
            <hr />
            {isEmpty ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#999",
                    }}
                >
                    <h2>Giỏ hàng trống</h2>
                    <p>Thêm món ăn yêu thích vào giỏ hàng!</p>
                    <button
                        onClick={onViewMenu}
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
                        Xem thực đơn
                    </button>
                </div>
            ) : (
                items.map((item, index) => (
                    <div key={item.item_id}>
                        <div className="cart-items-title cart-items-item">
                            <p>{index + 1}</p>
                            <p>{item.name || item.food_name}</p>
                            <p>{formatCurrency(item.price)}</p>
                            <div className="quantity-controls">
                                <button
                                    onClick={() =>
                                        onUpdateQuantity(item.item_id, item.quantity - 1, item.note)
                                    }
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() =>
                                        onUpdateQuantity(item.item_id, item.quantity + 1, item.note)
                                    }
                                >
                                    +
                                </button>
                            </div>
                            <p>{formatCurrency(item.price * item.quantity)}</p>
                            <p
                                className="cart-items-remove-icon"
                                onClick={() => onRemoveItem(item.item_id)}
                                style={{ cursor: "pointer" }}
                            >
                                x
                            </p>
                        </div>
                        <hr />
                    </div>
                ))
            )}
        </div>
    );
};

export default CartItems;
