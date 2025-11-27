/**
 * promotionService.js - Mobile version for promotions API
 * Simpler than shared-services version
 */

import apiClient from './apiClient';

/**
 * Map backend snake_case to frontend camelCase
 */
const mapPromotionToFrontend = (promo) => {
    if (!promo) return null;

    return {
        id: promo.id,
        code: promo.code,
        name: promo.name,
        description: promo.description,
        type: promo.type, // 'percentage', 'fixed', or 'fixed_amount'
        value: promo.value,
        minOrderValue: promo.min_order_value,
        maxDiscount: promo.max_discount,
        startDate: promo.start_date,
        endDate: promo.end_date,
        usageLimit: promo.usage_limit,
        usedCount: promo.used_count,
        scope: promo.scope, // 'system' or 'restaurant'
        restaurantId: promo.restaurant_id, // camelCase for consistency
        restaurant_id: promo.restaurant_id, // keep snake_case for backward compatibility
        status: promo.status, // 'active' or 'inactive'
        createdAt: promo.created_at,
        updatedAt: promo.updated_at,
    };
};

const promotionService = {
    /**
     * Get all promotions
     * @returns {Promise<Array>}
     */
    async getAll(status = null) {
        try {
            const url = status ? `/promotions?status=${status}` : '/promotions';
            const response = await apiClient.get(url);
            // apiClient returns array directly
            return Array.isArray(response)
                ? response.map(mapPromotionToFrontend)
                : [mapPromotionToFrontend(response)];
        } catch (error) {
            console.error('[promotionService.getAll] Error:', error);
            throw error;
        }
    },

    /**
     * Get promotion by code
     * @param {string} code - Promo code
     * @returns {Promise<Object|null>}
     */
    async getByCode(code) {
        try {
            const response = await apiClient.get(
                `/promotions?code=${code.toUpperCase()}&status=active`
            );
            const promo = Array.isArray(response) ? response[0] : response;
            return promo ? mapPromotionToFrontend(promo) : null;
        } catch (error) {
            console.error('[promotionService.getByCode] Error:', error);
            throw error;
        }
    },

    /**
     * Get promotions for specific restaurant
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<Array>}
     */
    async getByRestaurant(restaurantId) {
        try {
            const response = await apiClient.get(
                `/promotions?restaurant_id=${restaurantId}&status=active`
            );
            return Array.isArray(response)
                ? response.map(mapPromotionToFrontend)
                : [mapPromotionToFrontend(response)];
        } catch (error) {
            console.error('[promotionService.getByRestaurant] Error:', error);
            throw error;
        }
    },
};

export { promotionService };
