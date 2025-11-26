import React from "react";
import { MdWarning, MdClose } from "react-icons/md";
import "./SwitchRestaurantDialog.css";

/**
 * SwitchRestaurantDialog Component
 * 
 * Shows warning when user tries to add item from different restaurant
 * Allows user to:
 * - Go to Checkout: Keep current cart and go to checkout
 * - Switch Restaurant: Clear current cart and add from new restaurant
 * - Cancel: Close dialog and stay on current page
 */
const SwitchRestaurantDialog = ({
    isOpen,
    currentRestaurant,
    newRestaurant,
    onConfirm,
    onCancel,
    onGoToCheckout,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="switch-restaurant-overlay" onClick={onCancel}>
            <div
                className="switch-restaurant-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button className="dialog-close-btn" onClick={onCancel}>
                    <MdClose size={24} />
                </button>

                {/* Warning Icon */}
                <div className="dialog-icon">
                    <MdWarning size={48} color="#ff9800" />
                </div>

                {/* Title & Message */}
                <h2 className="dialog-title">Đổi nhà hàng?</h2>

                <div className="dialog-content">
                    <p className="dialog-message">
                        Giỏ hàng của bạn hiện có các món từ{" "}
                        <strong>{currentRestaurant}</strong>.
                    </p>

                    <p className="dialog-info">
                        Nếu bạn chọn món từ <strong>{newRestaurant}</strong>, giỏ
                        hàng hiện tại sẽ bị xóa.
                    </p>

                    <p className="dialog-warning">
                        <em>Mỗi đơn hàng chỉ có thể chứa món từ một nhà hàng</em>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="dialog-actions" style={{ flexDirection: 'column', gap: '10px' }}>
                    <button
                        className="btn-confirm"
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{ width: '100%' }}
                    >
                        {isLoading ? "Đang đổi..." : "Đổi nhà hàng"}
                    </button>

                    {onGoToCheckout && (
                        <button
                            className="btn-secondary"
                            onClick={onGoToCheckout}
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            Đi đến thanh toán
                        </button>
                    )}

                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={isLoading}
                        style={{ width: '100%' }}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwitchRestaurantDialog;
