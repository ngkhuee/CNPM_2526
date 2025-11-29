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
                // Filter by time for customer view
                const data = await promotionService.getAll('active', true);
                if (isActive) {
                    console.log('[usePromotions] Loaded promotions:', {
                        total: data.length,
                        promos: data.map(p => ({ code: p.code, status: p.status, scope: p.scope, restaurant_id: p.restaurant_id, timeRange: p.applicableTimeRange }))
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
     * Validate promotion code using promotionService
     * @param {string} code - Promotion code
     * @param {number} orderTotal - Order total
     * @param {string} restaurantId - Current restaurant ID to validate scope
     * @returns {Promise<Object>} {valid, message, promotion}
     */
    const validatePromotion = async (code, orderTotal, restaurantId) => {
        try {
            // Use promotionService.validate which includes time range check
            const result = await promotionService.validate(code, orderTotal);

            if (!result.valid) {
                return result;
            }

            const promo = result.promotion;

            // Additional check: if promotion applies to this restaurant
            if (promo.scope === 'restaurant' && promo.restaurant_id !== restaurantId) {
                return {
                    valid: false,
                    message: 'Mã khuyến mãi không áp dụng cho nhà hàng này',
                    promotion: null
                };
            }

            return result;
        } catch (error) {
            console.error('[usePromotions] Error validating promotion:', error);
            return {
                valid: false,
                message: 'Lỗi khi kiểm tra mã khuyến mãi',
                promotion: null
            };
        }
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
