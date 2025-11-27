// cartHelpers.js - Cart business logic dùng chung cho web và mobile
// ⚠️ PROMO_CODES moved to API - fetch from promotionService instead
// ⚠️ DELIVERY_FEE now fetched from settings API via settingsService

// Default delivery fee fallback
export const DEFAULT_DELIVERY_FEE = 15000; // 15k VND (fallback)

/**
 * Apply promo code to get discount amount from API promotion object
 * @param {number} subtotal - Subtotal amount
 * @param {object} promotion - Promotion object from API {type, value, maxDiscount}
 * @returns {number} Discount amount
 */
export const applyPromoCode = (subtotal, promotion) => {
  if (!promotion) return 0;

  let discount = 0;

  if (promotion.type === "percentage") {
    // Percentage discount
    discount = (subtotal * promotion.value) / 100;
    // Cap at maxDiscount
    if (promotion.maxDiscount) {
      discount = Math.min(discount, promotion.maxDiscount);
    }
  } else if (promotion.type === "fixed" || promotion.type === "fixed_amount") {
    // Fixed amount discount
    discount = promotion.value;
  }

  return Math.min(discount, subtotal); // Discount cannot exceed subtotal
};

/**
 * Calculate cart totals with promotion
 * @param {number} subtotal - Items subtotal
 * @param {object|null} promotion - Applied promotion from API
 * @param {number} deliveryFee - Delivery fee (should be fetched from settings API)
 * @returns {object} {subtotal, discountAmount, deliveryFee, total}
 */
export const calculateCartTotals = (
  subtotal,
  promotion = null,
  deliveryFee = DEFAULT_DELIVERY_FEE
) => {
  const discountAmount = applyPromoCode(subtotal, promotion);
  const actualDeliveryFee = subtotal === 0 ? 0 : deliveryFee;
  const total = subtotal - discountAmount + actualDeliveryFee;

  return {
    subtotal,
    discountAmount,
    deliveryFee: actualDeliveryFee,
    total,
  };
};

/**
 * Get cart items array from cartItems object and food_list
 * @param {object} cartItems - {foodId: quantity}
 * @param {array} food_list - List of all foods
 * @returns {array} Array of cart items with details
 */
export const getCartItemsArray = (cartItems, food_list) => {
  return food_list
    .filter((item) => cartItems[item._id] > 0)
    .map((item) => ({
      ...item,
      quantity: cartItems[item._id],
      total: item.price * cartItems[item._id],
    }));
};
