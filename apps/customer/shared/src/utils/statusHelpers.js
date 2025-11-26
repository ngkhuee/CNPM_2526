/**
 * Helper functions for order status display
 * Provides consistent status styling across web and mobile
 * Shared between web and mobile customer apps
 */

/**
 * Get background color for order status
 */
export const getStatusColor = (status) => {
    const colors = {
        delivered: "#d4edda", // Green
        cancelled: "#f8d7da", // Red
        rejected: "#f8d7da", // Red
        delivering: "#cce5ff", // Blue
        picking_up: "#cce5ff", // Blue
        picked_up: "#cce5ff", // Blue
        ready: "#d4edda", // Green
        preparing: "#d1ecf1", // Light blue
        confirmed: "#cfe2ff", // Lighter blue
        paid: "#fff3cd", // Yellow
        pending: "#fff3cd", // Yellow
    };
    return colors[status] || "#f0f0f0"; // Default gray
};

/**
 * Get text color for order status
 */
export const getStatusTextColor = (status) => {
    const colors = {
        delivered: "#155724", // Dark green
        cancelled: "#721c24", // Dark red
        rejected: "#721c24", // Dark red
        delivering: "#004085", // Dark blue
        picking_up: "#004085", // Dark blue
        picked_up: "#004085", // Dark blue
        ready: "#155724", // Dark green
        preparing: "#0c5460", // Teal
        confirmed: "#084298", // Darker blue
        paid: "#856404", // Dark yellow
        pending: "#856404", // Dark yellow
    };
    return colors[status] || "#333"; // Default dark
};

/**
 * Get badge style object for order status
 */
export const getStatusBadgeStyle = (status) => {
    return {
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: "600",
        textTransform: "capitalize",
        background: getStatusColor(status),
        color: getStatusTextColor(status),
    };
};

/**
 * Get human-readable status text
 */
export const formatOrderStatus = (status) => {
    const statusMap = {
        pending: "Pending",
        paid: "Paid",
        confirmed: "Confirmed",
        preparing: "Preparing",
        ready: "Ready",
        delivering: "Delivering",
        picking_up: "Picking Up",
        picked_up: "Picked Up",
        delivered: "Delivered",
        cancelled: "Cancelled",
        rejected: "Rejected",
    };
    return statusMap[status] || status;
};

/**
 * Check if order can be cancelled by status
 * (use canCancelOrder from orderHelpers for order object)
 */
export const canCancelOrderByStatus = (status) => {
    // Can cancel if payment completed but not yet preparing
    const cancellableStatuses = ["pending", "confirmed"];
    return cancellableStatuses.includes(status);
};

/**
 * Check if order can be tracked
 */
export const canTrackOrder = (status) => {
    // Can't track if payment not completed or order not confirmed
    const untrackableStatuses = ["pending"];
    return untrackableStatuses.includes(status);
};

/**
 * Check if order items can be reviewed by status
 * (use canReviewOrder from orderHelpers for order object)
 */
export const canReviewOrderByStatus = (status) => {
    return status === "delivered";
};

/**
 * Get status icon name (for icon libraries like react-icons)
 */
export const getStatusIcon = (status) => {
    const iconMap = {
        pending: "MdHourglassEmpty",
        paid: "MdPayment",
        confirmed: "MdCheckCircle",
        preparing: "MdLocalFireDepartment",
        ready: "MdCheckCircle",
        delivering: "MdLocalShipping",
        picking_up: "MdCarRental",
        picked_up: "MdCarRental",
        delivered: "MdCheckCircle",
        cancelled: "MdCancel",
        rejected: "MdError",
    };
    return iconMap[status] || "MdMoreHoriz";
};

/**
 * Get description for each status
 */
export const getStatusDescription = (status) => {
    const descriptions = {
        pending: "Waiting for payment confirmation",
        paid: "Waiting for restaurant confirmation",
        confirmed: "Restaurant confirmed your order",
        preparing: "Restaurant is preparing your order",
        ready: "Your order is ready for delivery",
        delivering: "Your order is on the way",
        picking_up: "Drone is picking up your order",
        picked_up: "Drone has picked up your order",
        delivered: "Your order has been delivered",
        cancelled: "Your order has been cancelled",
        rejected: "Your order was rejected",
    };
    return descriptions[status] || "Order status: " + status;
};
