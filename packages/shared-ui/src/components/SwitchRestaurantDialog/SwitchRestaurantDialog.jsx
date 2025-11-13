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
                <h2 className="dialog-title">Switch Restaurant?</h2>

                <div className="dialog-content">
                    <p className="dialog-message">
                        Your cart currently contains items from{" "}
                        <strong>{currentRestaurant}</strong>.
                    </p>

                    <p className="dialog-info">
                        If you select items from <strong>{newRestaurant}</strong>, your
                        current cart will be cleared.
                    </p>

                    <p className="dialog-warning">
                        <em>Each order can only contain items from one restaurant</em>
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
                        {isLoading ? "Switching..." : "Switch Restaurant"}
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
                            Go to Checkout
                        </button>
                    )}

                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={isLoading}
                        style={{ width: '100%' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwitchRestaurantDialog;
