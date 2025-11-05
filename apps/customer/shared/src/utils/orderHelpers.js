// orderHelpers.js - Order business logic dùng chung cho web và mobile
import { ORDER_STATUS } from "shared-constants";

/**
 * Create order data from cart
 * @param {object} user - Current user
 * @param {array} cartItemsArray - Array of cart items
 * @param {object} totals - Cart totals {subtotal, discountAmount, deliveryFee, total}
 * @param {object} deliveryAddress - Delivery address
 * @param {string} paymentMethod - Payment method
 * @param {object|null} promoCode - Applied promo code
 * @returns {object} Order data
 */
export const createOrderFromCart = (
  user,
  cartItemsArray,
  totals,
  deliveryAddress,
  paymentMethod = "cod",
  promoCode = null
) => {
  return {
    customerId: user.id,
    items: cartItemsArray.map((item) => ({
      foodId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      restaurantId: item.restaurantId,
      restaurant: item.restaurant,
    })),
    subtotal: totals.subtotal,
    discount: totals.discountAmount,
    deliveryFee: totals.deliveryFee,
    total_amount: totals.total,
    promoCode: promoCode?.code || null,
    delivery_address: deliveryAddress,
    payment_method: paymentMethod,
    status: ORDER_STATUS.PENDING,
  };
};

/**
 * Format order data for display
 * @param {object} order - Order object
 * @returns {object} Formatted order
 */
export const formatOrderData = (order) => {
  return {
    ...order,
    formattedDate: new Date(order.createdAt).toLocaleDateString("vi-VN"),
    formattedTime: new Date(order.createdAt).toLocaleTimeString("vi-VN"),
    itemCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
  };
};

/**
 * Group orders by status
 * @param {array} orders - Array of orders
 * @returns {object} {pending: [], preparing: [], delivering: [], delivered: [], cancelled: []}
 */
export const groupOrdersByStatus = (orders) => {
  const grouped = {
    pending: [],
    preparing: [],
    delivering: [],
    delivered: [],
    cancelled: [],
  };

  orders.forEach((order) => {
    const status = order.status.toLowerCase();
    if (grouped[status]) {
      grouped[status].push(order);
    }
  });

  return grouped;
};

/**
 * Check if order can be cancelled
 * @param {object} order - Order object
 * @returns {boolean}
 */
export const canCancelOrder = (order) => {
  const nonCancellableStatuses = [
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.DELIVERING,
    ORDER_STATUS.PICKED_UP,
  ];
  return !nonCancellableStatuses.includes(order.status);
};

/**
 * Check if order can be reviewed
 * @param {object} order - Order object
 * @returns {boolean}
 */
export const canReviewOrder = (order) => {
  return order.status === ORDER_STATUS.DELIVERED && !order.reviewed;
};

/**
 * Get restaurant IDs from order
 * @param {object} order - Order object
 * @returns {array} Array of unique restaurant IDs
 */
export const getRestaurantIdsFromOrder = (order) => {
  if (!order.items) return [];
  return [...new Set(order.items.map((item) => item.restaurantId))];
};
