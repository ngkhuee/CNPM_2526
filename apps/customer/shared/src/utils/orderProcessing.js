/**
 * Helper functions for order processing and preparation
 * Shared between web and mobile customer apps
 */

/**
 * Group order items by restaurant ID
 * Returns object with restaurantId as key and array of items as value
 */
export const groupOrdersByRestaurant = (orderItems) => {
    const grouped = {};

    orderItems.forEach((item) => {
        if (!grouped[item.restaurantId]) {
            grouped[item.restaurantId] = [];
        }
        grouped[item.restaurantId].push(item);
    });

    return grouped;
};

/**
 * Calculate order totals for a set of items
 * Returns subtotal and total for all items
 */
export const calculateOrderTotals = (items) => {
    let subtotal = 0;

    items.forEach((item) => {
        subtotal += (item.price || 0) * (item.quantity || 0);
    });

    return {
        subtotal: subtotal,
        total: subtotal,
    };
};

/**
 * Transform order items to API format
 * Ensures all required fields are present and properly formatted
 */
export const prepareOrderItems = (items, foodList) => {
    return items
        .map((item) => {
            // Find full food details from foodList if available
            const foodDetails = foodList?.find(
                (food) =>
                    String(food.id) === String(item.id) ||
                    String(food._id) === String(item._id)
            );

            return {
                foodId: item._id || item.id,
                name: item.name,
                price: item.price || (foodDetails?.price || 0),
                quantity: item.quantity || 1,
                restaurantId: item.restaurantId || (foodDetails?.restaurantId || null),
                description: item.description || (foodDetails?.description || ""),
                image: item.image || (foodDetails?.image || ""),
            };
        })
        .filter((item) => item.quantity > 0);
};

/**
 * Validate order data before submission
 * Returns validation result with any errors
 */
export const validateOrderData = (orderData) => {
    const errors = [];

    if (!orderData.customerId) {
        errors.push("Customer ID is required");
    }

    if (!orderData.restaurantId) {
        errors.push("Restaurant ID is required");
    }

    if (!orderData.items || orderData.items.length === 0) {
        errors.push("Order must contain at least one item");
    }

    if (!orderData.customer || !orderData.customer.name) {
        errors.push("Customer name is required");
    }

    if (!orderData.customer || !orderData.customer.phone) {
        errors.push("Customer phone is required");
    }

    if (!orderData.customer || !orderData.customer.address) {
        errors.push("Customer address is required");
    }

    if (!orderData.total_amount || orderData.total_amount <= 0) {
        errors.push("Order total must be greater than 0");
    }

    return {
        valid: errors.length === 0,
        errors: errors,
    };
};

/**
 * Calculate delivery fee based on distance and settings
 * This is a placeholder - actual implementation depends on backend
 */
export const calculateDeliveryFee = (distance, settings) => {
    // Default delivery fee if distance-based calculation is not available
    if (!distance || !settings) {
        return settings?.deliveryFee || 15000; // 15k VND default
    }

    // Example: 5000 VND per km + base fee
    const baseFee = settings?.deliveryFeeBase || 10000;
    const perKmFee = settings?.deliveryFeePerKm || 5000;
    const calculatedFee = baseFee + distance * perKmFee;

    return Math.min(calculatedFee, settings?.maxDeliveryFee || 50000);
};

/**
 * Get order summary for display
 * Calculates totals including discounts and fees
 */
export const calculateOrderSummary = (subtotal, promo, deliveryFee) => {
    let discountAmount = 0;

    if (promo) {
        if (promo.type === "percentage") {
            discountAmount = subtotal * (promo.value / 100);
            if (promo.maxDiscount) {
                discountAmount = Math.min(discountAmount, promo.maxDiscount);
            }
        } else if (promo.type === "fixed") {
            discountAmount = promo.value;
        }
        discountAmount = Math.min(discountAmount, subtotal);
    }

    const actualDeliveryFee = subtotal === 0 ? 0 : (deliveryFee || 0);
    const total = subtotal - discountAmount + actualDeliveryFee;

    return {
        subtotal,
        discountAmount,
        deliveryFee: actualDeliveryFee,
        total: Math.max(total, 0), // Ensure total is never negative
    };
};

/**
 * Format order for display
 * Adds computed fields like formatted date, status display text
 */
export const formatOrderForDisplay = (order) => {
    return {
        ...order,
        displayDate: new Date(order.createdAt || order.created_at).toLocaleString(
            "vi-VN",
            {
                dateStyle: "short",
                timeStyle: "short",
            }
        ),
        displayTotal:
            order.total_amount || order.totalAmount || order.total || 0,
    };
};

/**
 * Get orders statistics
 * Returns counts and summaries of different order statuses
 */
export const getOrderStats = (orders) => {
    const stats = {
        total: orders.length,
        pending: 0,
        processing: 0,
        delivering: 0,
        delivered: 0,
        cancelled: 0,
        rejected: 0,
    };

    orders.forEach((order) => {
        if (["pending", "paid"].includes(order.status)) {
            stats.pending++;
        } else if (["confirmed", "preparing", "ready"].includes(order.status)) {
            stats.processing++;
        } else if (
            ["delivering", "picking_up", "picked_up"].includes(order.status)
        ) {
            stats.delivering++;
        } else if (order.status === "delivered") {
            stats.delivered++;
        } else if (order.status === "cancelled") {
            stats.cancelled++;
        } else if (order.status === "rejected") {
            stats.rejected++;
        }
    });

    return stats;
};
