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
  // Check if order meets minimum value requirement
  if (promotion.minOrderValue && orderTotal < promotion.minOrderValue) {
    return 0;
  }

  let discountAmount = 0;

  if (promotion.type === "percentage") {
    // Calculate percentage discount
    discountAmount = (orderTotal * promotion.value) / 100;

    // Apply maximum discount cap if specified
    if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
      discountAmount = promotion.maxDiscount;
    }
  } else if (promotion.type === "fixed") {
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
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);

  // Check status
  if (promotion.status !== "active") {
    return false;
  }

  // Check date range
  if (now < startDate || now > endDate) {
    return false;
  }

  // Check usage limit
  if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
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

    // Admin promotions (apply to all restaurants)
    if (!promo.restaurantId || promo.applicableRestaurants?.length === 0) {
      return true;
    }

    // Restaurant-specific promotions
    return promo.restaurantId === restaurantId;
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
