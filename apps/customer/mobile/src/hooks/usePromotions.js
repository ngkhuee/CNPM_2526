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

        return promotions.filter(promo => {
            if (promo.status !== 'active') return false;

            // System promotions (no restaurant_id) - apply to all
            if (!promo.restaurant_id) {
                return true;
            }

            // Restaurant-specific promotions
            return promo.restaurant_id === restId;
        });
    };

    /**
     * Validate promotion code
     * @param {string} code - Promotion code
     * @param {number} orderTotal - Order total
     * @returns {Object} {valid, message, promotion}
     */
    const validatePromotion = (code, orderTotal) => {
        const promo = promotions.find(
            p => p.code?.toUpperCase() === code.toUpperCase() && p.status === 'active'
        );

        if (!promo) {
            return { valid: false, message: 'Invalid promotion code' };
        }

        if (promo.minOrderValue && orderTotal < promo.minOrderValue) {
            return {
                valid: false,
                message: `Minimum order: $${(promo.minOrderValue / 100).toFixed(2)}`,
            };
        }

        // Check date range
        const now = new Date();
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);

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
            if (promo.maxDiscount && discount > promo.maxDiscount) {
                discount = promo.maxDiscount;
            }
        } else if (promo.type === 'fixed') {
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
