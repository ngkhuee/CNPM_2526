/**
 * promotionService.js - Mobile version for promotions API
 * Simpler than shared-services version
 */

import apiClient from './apiClient';

/**
 * Check if current time is within applicable time range
 */
const isWithinTimeRange = (timeRange) => {
    if (!timeRange || timeRange === "Cả ngày") {
        return true;
    }

    const match = timeRange.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) {
        return true;
    }

    const [, startHour, startMin, endHour, endMin] = match;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const startTime = parseInt(startHour) * 60 + parseInt(startMin);
    const endTime = parseInt(endHour) * 60 + parseInt(endMin);
    const currentTime = currentHour * 60 + currentMin;

    return currentTime >= startTime && currentTime <= endTime;
};

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
        applicableTimeRange: promo.applicable_time_range || "Cả ngày",
        status: promo.status, // 'active' or 'inactive'
        createdAt: promo.created_at,
        updatedAt: promo.updated_at,
    };
};

const promotionService = {
    /**
     * Get all promotions
     * @param {string} status - Filter by status
     * @param {boolean} filterByTime - Filter by applicable time range
     * @returns {Promise<Array>}
     */
    async getAll(status = null, filterByTime = false) {
        try {
            const url = status ? `/promotions?status=${status}` : '/promotions';
            const response = await apiClient.get(url);
            // apiClient returns array directly
            let promotions = Array.isArray(response)
                ? response.map(mapPromotionToFrontend)
                : [mapPromotionToFrontend(response)];

            // Filter by time range if requested
            if (filterByTime) {
                promotions = promotions.filter(promo => isWithinTimeRange(promo.applicableTimeRange));
            }

            return promotions;
        } catch (error) {
            console.error('[promotionService.getAll] Error:', error);
            throw error;
        }
    },

    /**
     * Validate promotion code
     * @param {string} code - Promo code
     * @param {number} orderValue - Order value
     * @returns {Promise<Object>}
     */
    async validate(code, orderValue) {
        try {
            if (!code || code.trim() === "") {
                return {
                    valid: false,
                    message: "Vui lòng nhập mã khuyến mãi",
                    promotion: null,
                };
            }

            const promotion = await this.getByCode(code);

            if (!promotion) {
                return {
                    valid: false,
                    message: "Mã khuyến mãi không hợp lệ",
                    promotion: null,
                };
            }

            // Check if expired
            const now = new Date();
            const endDate = new Date(promotion.endDate);
            if (now > endDate) {
                return {
                    valid: false,
                    message: "Mã khuyến mãi đã hết hạn",
                    promotion: null,
                };
            }

            // Check applicable time range
            if (!isWithinTimeRange(promotion.applicableTimeRange)) {
                const timeRange = promotion.applicableTimeRange;
                return {
                    valid: false,
                    message: `Mã khuyến mãi chỉ áp dụng trong khung giờ ${timeRange}. Vui lòng kiểm tra lại!`,
                    promotion: null,
                };
            }

            // Check min order value
            if (orderValue < promotion.minOrderValue) {
                return {
                    valid: false,
                    message: `Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString("vi-VN")}đ`,
                    promotion: null,
                };
            }

            // Check usage limit
            if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
                return {
                    valid: false,
                    message: "Mã khuyến mãi đã hết lượt sử dụng",
                    promotion: null,
                };
            }

            return {
                valid: true,
                message: "Áp dụng mã thành công",
                promotion,
            };
        } catch (error) {
            return {
                valid: false,
                message: "Lỗi khi kiểm tra mã khuyến mãi",
                promotion: null,
            };
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
