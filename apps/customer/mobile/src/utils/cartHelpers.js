/**
 * cartHelpers.js - Cart utility functions for mobile
 * Shared logic between screens
 */

/**
 * Apply promo code to get discount amount
 * @param {number} subtotal - Subtotal amount
 * @param {Object} promotion - Promotion object {type, value, maxDiscount}
 * @returns {number} Discount amount
 */
export const applyPromoCode = (subtotal, promotion) => {
    if (!promotion) return 0;

    let discount = 0;

    if (promotion.type === 'percentage') {
        // Percentage discount
        discount = (subtotal * promotion.value) / 100;
        // Cap at maxDiscount
        if (promotion.maxDiscount || promotion.max_discount) {
            discount = Math.min(discount, promotion.maxDiscount || promotion.max_discount);
        }
    } else if (promotion.type === 'fixed' || promotion.type === 'fixed_amount') {
        // Fixed amount discount
        discount = promotion.value;
    }

    return Math.min(discount, subtotal); // Discount cannot exceed subtotal
};

/**
 * Calculate cart totals with promotion
 * @param {number} subtotal - Items subtotal
 * @param {Object|null} promotion - Applied promotion from API
 * @param {number} deliveryFee - Delivery fee (from settings)
 * @returns {Object} {subtotal, discountAmount, deliveryFee, total}
 */
export const calculateCartTotals = (
    subtotal,
    promotion = null,
    deliveryFee = 2.00
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
