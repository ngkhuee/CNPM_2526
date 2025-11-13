import React from "react";
import { MdWarning, MdClose } from "react-icons/md";
import "./SwitchRestaurantDialog.css";

/**
 * SwitchRestaurantDialog Component
 * 
 * Shows warning when user tries to add item from different restaurant
 * Allows user to:
 * - Cancel: Keep current cart
 * - Confirm: Clear current cart and add from new restaurant
 */
const SwitchRestaurantDialog = ({
    isOpen,
    currentRestaurant,
    newRestaurant,
    onConfirm,
    onCancel,
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
                        ⚠️ <em>Each order can only contain items from one restaurant</em>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="dialog-actions">
                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Keep Current Cart
                    </button>

                    <button
                        className="btn-confirm"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Switching..." : "Switch Restaurant"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwitchRestaurantDialog;
