/**
 * Promotion Helper Functions
 * Utility functions for calculating and applying promotions
 */

/**
 * Calculate discount amount for an order
 * @param {Object} promotion - Promotion object
 * @param {number} orderTotal - Total order amount before discount
 * @returns {number} Discount amount in VND
 */
export const calculateDiscount = (promotion, orderTotal) => {
  // Support both camelCase and snake_case for minOrderValue
  const minOrderValue = promotion.minOrderValue || promotion.min_order_value || 0;

  // Check if order meets minimum value requirement
  if (minOrderValue && orderTotal < minOrderValue) {
    return 0;
  }

  let discountAmount = 0;

  if (promotion.type === "percentage") {
    // Calculate percentage discount
    discountAmount = (orderTotal * promotion.value) / 100;

    // Apply maximum discount cap if specified (support both camelCase and snake_case)
    const maxDiscount = promotion.maxDiscount || promotion.max_discount;
    if (maxDiscount && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }
  } else if (promotion.type === "fixed" || promotion.type === "fixed_amount") {
    // Fixed amount discount
    discountAmount = promotion.value;

    // Discount cannot exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }
  }

  return Math.round(discountAmount);
};

/**
 * Check if promotion is currently valid
 * @param {Object} promotion - Promotion object
 * @returns {boolean} True if promotion is valid
 */
export const isPromotionValid = (promotion) => {
  const now = new Date();
  // Support both camelCase and snake_case
  const startDate = new Date(promotion.startDate || promotion.start_date);
  const endDate = new Date(promotion.endDate || promotion.end_date);

  // Check status
  if (promotion.status !== "active") {
    return false;
  }

  // Check date range
  if (now < startDate || now > endDate) {
    return false;
  }

  // Check usage limit (support both camelCase and snake_case)
  const usageLimit = promotion.usageLimit || promotion.usage_limit;
  const usedCount = promotion.usedCount || promotion.used_count || 0;
  if (usageLimit && usedCount >= usageLimit) {
    return false;
  }

  return true;
};

/**
 * Get applicable promotions for a restaurant
 * @param {Array} allPromotions - All available promotions
 * @param {string} restaurantId - Restaurant ID
 * @returns {Array} Applicable promotions
 */
export const getApplicablePromotions = (allPromotions, restaurantId) => {
  return allPromotions.filter((promo) => {
    // Must be valid
    if (!isPromotionValid(promo)) {
      return false;
    }

    // Support both camelCase and snake_case for restaurantId
    const promoRestaurantId = promo.restaurantId || promo.restaurant_id;

    // Admin promotions (apply to all restaurants)
    if (!promoRestaurantId || promo.applicableRestaurants?.length === 0) {
      return true;
    }

    // Restaurant-specific promotions
    return promoRestaurantId === restaurantId;
  });
};

/**
 * Calculate final order total with promotion applied
 * @param {number} orderTotal - Original order total
 * @param {Object} promotion - Promotion to apply (optional)
 * @returns {Object} { originalTotal, discount, finalTotal }
 */
export const calculateOrderTotal = (orderTotal, promotion = null) => {
  const result = {
    originalTotal: orderTotal,
    discount: 0,
    finalTotal: orderTotal,
  };

  if (promotion && isPromotionValid(promotion)) {
    const discount = calculateDiscount(promotion, orderTotal);
    result.discount = discount;
    result.finalTotal = orderTotal - discount;
  }

  return result;
};

/**
 * Format discount for display
 * @param {Object} promotion - Promotion object
 * @returns {string} Formatted discount text
 */
export const formatDiscountDisplay = (promotion) => {
  if (promotion.type === "percentage") {
    let text = `${promotion.value}% OFF`;
    if (promotion.maxDiscount) {
      text += ` (max ${promotion.maxDiscount.toLocaleString()}₫)`;
    }
    return text;
  } else if (promotion.type === "fixed") {
    return `${promotion.value.toLocaleString()}₫ OFF`;
  }
  return "";
};

/**
 * Format minimum order value for display
 * @param {Object} promotion - Promotion object
 * @returns {string} Formatted min order text
 */
export const formatMinOrderDisplay = (promotion) => {
  if (promotion.minOrderValue && promotion.minOrderValue > 0) {
    return `Min order: ${promotion.minOrderValue.toLocaleString()}₫`;
  }
  return "No minimum order";
};

/**
 * Example usage in customer app:
 *
 * import { calculateOrderTotal, getApplicablePromotions } from '@utils/promotionHelper';
 *
 * // Get available promotions for restaurant
 * const availablePromos = getApplicablePromotions(allPromotions, restaurantId);
 *
 * // Apply selected promotion to order
 * const orderSummary = calculateOrderTotal(cartTotal, selectedPromotion);
 * console.log(`Original: ${orderSummary.originalTotal}₫`);
 * console.log(`Discount: -${orderSummary.discount}₫`);
 * console.log(`Final: ${orderSummary.finalTotal}₫`);
 */
