/**
 * Order Validation Service
 * Handles order validation, constraints checking
 * Shared between web and mobile customer apps
 */

/**
 * Check if order can be cancelled
 * Order can be cancelled if status is: paid, pending, confirmed, preparing
 * @param {Object} order - Order object
 * @returns {boolean}
 */
export const canCancelOrder = (order) => {
    if (!order) return false;

    const cancellableStatuses = [
        "pending",
        "paid",
        "confirmed",
        "preparing",
    ];

    return cancellableStatuses.includes(order.status);
};

/**
 * Check if order can be reviewed
 * Order can be reviewed if status is: delivered or ready (for some platforms)
 * @param {string} orderStatus - Order status
 * @returns {boolean}
 */
export const canReviewOrder = (orderStatus) => {
    const reviewableStatuses = ["delivered", "ready"];
    return reviewableStatuses.includes(orderStatus);
};

/**
 * Check if order is active (not completed or cancelled)
 * @param {Object} order - Order object
 * @returns {boolean}
 */
export const isOrderActive = (order) => {
    if (!order) return false;

    const inactiveStatuses = ["delivered", "cancelled", "rejected"];
    return !inactiveStatuses.includes(order.status);
};

/**
 * Check if order is currently being delivered
 * @param {string} orderStatus - Order status
 * @returns {boolean}
 */
export const isOrderDelivering = (orderStatus) => {
    const deliveringStatuses = [
        "ready",
        "picking_up",
        "picked_up",
        "delivering",
    ];
    return deliveringStatuses.includes(orderStatus);
};

/**
 * Get readable status label
 * @param {string} status - Order status
 * @returns {string} - Readable status label
 */
export const getStatusLabel = (status) => {
    const statusLabels = {
        pending: "Pending",
        paid: "Paid",
        confirmed: "Confirmed",
        preparing: "Preparing",
        ready: "Ready",
        picking_up: "Picking Up",
        picked_up: "Picked Up",
        delivering: "Delivering",
        delivered: "Delivered",
        cancelled: "Cancelled",
        rejected: "Rejected",
    };

    return statusLabels[status] || status;
};

/**
 * Get status badge style
 * @param {string} status - Order status
 * @returns {Object} - CSS style object
 */
export const getStatusBadgeStyle = (status) => {
    const styles = {
        padding: "4px 12px",
        borderRadius: "15px",
        fontSize: "14px",
        fontWeight: "600",
        color: "white",
        display: "inline-block",
        backgroundColor:
            status === "delivered"
                ? "#4caf50"
                : status === "arrived"
                    ? "#ffc107"
                    : status === "delivering" ||
                        status === "picking_up" ||
                        status === "picked_up"
                        ? "#2196f3"
                        : status === "preparing" || status === "ready"
                            ? "#ff9800"
                            : status === "confirmed"
                                ? "#8bc34a"
                                : status === "pending"
                                    ? "#9c27b0"
                                    : status === "cancelled"
                                        ? "#f44336"
                                        : status === "rejected"
                                            ? "#d32f2f"
                                            : "#757575",
    };

    return styles;
};

/**
 * Validate order items
 * @param {Array} items - Order items
 * @returns {Object} - {valid: boolean, errors: Array}
 */
export const validateOrderItems = (items) => {
    const errors = [];

    if (!Array.isArray(items) || items.length === 0) {
        errors.push("Order must have at least one item");
        return { valid: false, errors };
    }

    items.forEach((item, index) => {
        if (!item.food_id && !item.foodId) {
            errors.push(`Item ${index + 1}: Missing food ID`);
        }
        if (!item.quantity || item.quantity < 1) {
            errors.push(`Item ${index + 1}: Invalid quantity`);
        }
        if (item.price === undefined || item.price < 0) {
            errors.push(`Item ${index + 1}: Invalid price`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Validate checkout data
 * @param {Object} checkoutData - {customer, items, address}
 * @returns {Object} - {valid: boolean, errors: Array}
 */
export const validateCheckoutData = (checkoutData) => {
    const errors = [];

    // Validate customer info
    if (!checkoutData.customer) {
        errors.push("Customer information is required");
    } else {
        if (!checkoutData.customer.name || checkoutData.customer.name.trim() === "") {
            errors.push("Customer name is required");
        }
        if (!checkoutData.customer.phone || checkoutData.customer.phone.trim() === "") {
            errors.push("Customer phone is required");
        }
        if (!checkoutData.customer.address || checkoutData.customer.address.trim() === "") {
            errors.push("Delivery address is required");
        }
    }

    // Validate items
    if (Array.isArray(checkoutData.items) && checkoutData.items.length > 0) {
        const itemValidation = validateOrderItems(checkoutData.items);
        if (!itemValidation.valid) {
            errors.push(...itemValidation.errors);
        }
    } else {
        errors.push("Cart is empty");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Check minimum order value (if applicable)
 * @param {number} totalAmount - Total order amount
 * @param {number} minimumAmount - Minimum required amount
 * @returns {Object} - {valid: boolean, message: string}
 */
export const validateMinimumOrderValue = (totalAmount, minimumAmount = 50000) => {
    if (totalAmount < minimumAmount) {
        return {
            valid: false,
            message: `Minimum order amount is ${minimumAmount}. Current total: ${totalAmount}`,
        };
    }

    return {
        valid: true,
        message: "",
    };
};

export const orderValidationService = {
    canCancelOrder,
    canReviewOrder,
    isOrderActive,
    isOrderDelivering,
    getStatusLabel,
    getStatusBadgeStyle,
    validateOrderItems,
    validateCheckoutData,
    validateMinimumOrderValue,
};
