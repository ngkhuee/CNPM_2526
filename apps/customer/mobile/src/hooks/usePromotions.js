/**
 * usePromotions.js - Mobile version of promotions hook
 * Fetches promotions and filters applicable ones for restaurants
 */

import { useState, useEffect } from 'react';
import { promotionService } from '../services/promotionService';

export const usePromotions = (restaurantId = null) => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isActive = true;

        const fetchPromotions = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await promotionService.getAll();
                if (isActive) {
                    console.log('[usePromotions] Loaded promotions:', {
                        total: data.length,
                        promos: data.map(p => ({ code: p.code, status: p.status, scope: p.scope, restaurant_id: p.restaurant_id }))
                    });
                    setPromotions(data);
                }
            } catch (err) {
                if (isActive) {
                    console.error('[usePromotions] Error fetching promotions:', err);
                    setError(err.message || 'Failed to fetch promotions');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchPromotions();

        return () => {
            isActive = false;
        };
    }, []);

    /**
     * Get promotions applicable to a specific restaurant
     * @param {string} targetRestaurantId - Restaurant ID to filter promotions
     * @returns {Array} Applicable promotions
     */
    const getApplicablePromotions = (targetRestaurantId) => {
        const restId = targetRestaurantId || restaurantId;
        if (!restId) {
            return promotions.filter(p => p.status === 'active');
        }

        const result = promotions.filter(promo => {
            if (promo.status !== 'active') {
                console.log(`[usePromotions] Filtered out ${promo.code} - status: ${promo.status}`);
                return false;
            }

            // Admin/system promotions (scope = "system", restaurant_id = null) - apply to all restaurants
            if (promo.scope === 'system' && !promo.restaurant_id) {
                console.log(`[usePromotions] Included ${promo.code} - system/all restaurants`);
                return true;
            }

            // Restaurant-specific promotions (scope = "restaurant") - only for that restaurant
            if (promo.scope === 'restaurant' && promo.restaurant_id === restId) {
                console.log(`[usePromotions] Included ${promo.code} - for restaurant ${restId}`);
                return true;
            }

            console.log(`[usePromotions] Filtered out ${promo.code} - scope=${promo.scope}, rest_id=${promo.restaurant_id}, needed=${restId}`);
            return false;
        });

        console.log(`[usePromotions.getApplicablePromotions] Total: ${result.length} from ${promotions.length} for rest ${restId}`);
        return result;
    };

    /**
     * Validate promotion code
     * @param {string} code - Promotion code
     * @param {number} orderTotal - Order total
     * @param {string} restaurantId - Current restaurant ID to validate scope
     * @returns {Object} {valid, message, promotion}
     */
    const validatePromotion = (code, orderTotal, restaurantId) => {
        const promo = promotions.find(
            p => p.code?.toUpperCase() === code.toUpperCase() && p.status === 'active'
        );

        if (!promo) {
            return { valid: false, message: 'Invalid promotion code' };
        }

        // Check if promotion applies to this restaurant
        if (promo.scope === 'restaurant' && promo.restaurant_id !== restaurantId) {
            return { valid: false, message: 'This promotion is not available for this restaurant' };
        }

        // Check minimum order value (support both camelCase and snake_case)
        const minOrderValue = promo.minOrderValue || promo.min_order_value || 0;
        if (minOrderValue > 0 && orderTotal < minOrderValue) {
            return {
                valid: false,
                message: `Đơn tối thiểu: ₫${minOrderValue.toLocaleString('vi-VN')}`,
            };
        }

        // Check date range
        const now = new Date();
        const startDate = new Date(promo.startDate || promo.start_date);
        const endDate = new Date(promo.endDate || promo.end_date);

        if (now < startDate) {
            return { valid: false, message: 'Promotion not started yet' };
        }

        if (now > endDate) {
            return { valid: false, message: 'Promotion expired' };
        }

        return { valid: true, promotion: promo };
    };

    /**
     * Calculate discount amount for a promotion
     * @param {Object} promo - Promotion object
     * @param {number} subtotal - Subtotal amount
     * @returns {number} Discount amount
     */
    const calculateDiscount = (promo, subtotal) => {
        if (!promo) return 0;

        let discount = 0;
        if (promo.type === 'percentage') {
            discount = (subtotal * promo.value) / 100;
            // Apply max discount if set
            if (promo.max_discount && discount > promo.max_discount) {
                discount = promo.max_discount;
            }
        } else if (promo.type === 'fixed' || promo.type === 'fixed_amount') {
            discount = promo.value;
        }

        return Math.min(discount, subtotal); // Discount cannot exceed subtotal
    };

    return {
        promotions,
        loading,
        error,
        getApplicablePromotions,
        validatePromotion,
        calculateDiscount,
    };
};
