import apiClient from "../config/apiClient";

// Helper to map snake_case fields from backend to camelCase for frontend
const mapPromotionToFrontend = (promo) => {
  if (!promo) return null;

  return {
    id: promo.id,
    code: promo.code,
    name: promo.name,
    description: promo.description,
    type: promo.type,
    value: promo.value,
    minOrderValue: promo.min_order_value,
    maxDiscount: promo.max_discount,
    startDate: promo.start_date,
    endDate: promo.end_date,
    usageLimit: promo.usage_limit,
    usedCount: promo.used_count,
    scope: promo.scope,
    restaurantId: promo.restaurant_id,
    status: promo.status,
    createdAt: promo.created_at,
    updatedAt: promo.updated_at,
    createdBy: promo.created_by || promo.scope,
    applicableRestaurants: promo.restaurant_id ? [promo.restaurant_id] : [],
  };
};

// Helper to map camelCase fields from frontend to snake_case for backend
const mapPromotionToBackend = (promo) => {
  const payload = {};

  if (promo.code) payload.code = promo.code;
  if (promo.name) payload.name = promo.name;
  if (promo.description) payload.description = promo.description;
  if (promo.type) payload.type = promo.type;
  if (promo.value !== undefined) payload.value = promo.value;
  if (promo.minOrderValue !== undefined)
    payload.min_order_value = promo.minOrderValue;
  if (promo.maxDiscount !== undefined) payload.max_discount = promo.maxDiscount;
  if (promo.startDate) payload.start_date = promo.startDate;
  if (promo.endDate) payload.end_date = promo.endDate;
  if (promo.usageLimit !== undefined) payload.usage_limit = promo.usageLimit;
  if (promo.usedCount !== undefined) payload.used_count = promo.usedCount;
  if (promo.scope) payload.scope = promo.scope;
  if (promo.restaurantId) payload.restaurant_id = promo.restaurantId;
  if (promo.status) payload.status = promo.status;

  return payload;
};

const promotionService = {
  /**
   * Get all promotions (with optional filter)
   * @param {string} status - Optional status filter ('active', 'inactive', or empty for all)
   * @returns {Promise<Array>}
   */
  async getAll(status = null) {
    try {
      const url = status ? `/promotions?status=${status}` : "/promotions";
      const response = await apiClient.get(url);
      // apiClient already returns response.data
      return response.map(mapPromotionToFrontend);
    } catch (error) {
      console.error("Error fetching promotions:", error);
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
      // apiClient already returns response.data (array)
      const promo = response[0] || null;
      return promo ? mapPromotionToFrontend(promo) : null;
    } catch (error) {
      console.error("Error fetching promotion by code:", error);
      throw error;
    }
  },

  /**
   * Validate promotion code
   * @param {string} code - Promo code
   * @param {number} orderValue - Order value
   * @returns {Promise<Object>} {valid: boolean, message: string, promotion: object|null}
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
   * Calculate discount amount from promotion
   * @param {Object} promotion - Promotion object
   * @param {number} orderValue - Order value
   * @returns {number} Discount amount
   */
  calculateDiscount(promotion, orderValue) {
    if (!promotion) return 0;

    let discount = 0;

    if (promotion.type === "percentage") {
      discount = (orderValue * promotion.value) / 100;
      // Cap at maxDiscount
      if (promotion.maxDiscount) {
        discount = Math.min(discount, promotion.maxDiscount);
      }
    } else if (promotion.type === "fixed" || promotion.type === "fixed_amount") {
      discount = promotion.value;
    }

    return Math.min(discount, orderValue); // Discount cannot exceed order value
  },

  /**
   * Get promotion by ID
   * @param {string} id - Promotion ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/promotions/${id}`);
      // apiClient already returns response.data
      return mapPromotionToFrontend(response);
    } catch (error) {
      console.error("Error fetching promotion:", error);
      throw error;
    }
  },

  /**
   * Get promotions by restaurant
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Array>}
   */
  async getByRestaurant(restaurantId) {
    try {
      // Query with backend field name (restaurant_id)
      const response = await apiClient.get(
        `/promotions?status=active&restaurant_id=${restaurantId}`
      );
      // apiClient already returns response.data
      return response.map(mapPromotionToFrontend);
    } catch (error) {
      console.error("Error fetching restaurant promotions:", error);
      throw error;
    }
  },

  /**
   * Create new promotion (for restaurant/admin)
   * @param {Object} promotionData - Promotion data
   * @returns {Promise<Object>}
   */
  async create(promotionData) {
    try {
      // Map frontend camelCase to backend snake_case
      const payload = mapPromotionToBackend(promotionData);

      // Add timestamps
      payload.created_at = new Date().toISOString();
      payload.updated_at = new Date().toISOString();

      const response = await apiClient.post("/promotions", payload);
      // apiClient already returns response.data
      return mapPromotionToFrontend(response);
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw error;
    }
  },

  /**
   * Update promotion
   * @param {string} id - Promotion ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    try {
      // Map frontend camelCase to backend snake_case
      const payload = mapPromotionToBackend(updates);
      payload.updated_at = new Date().toISOString();

      const response = await apiClient.patch(`/promotions/${id}`, payload);
      // apiClient already returns response.data
      return mapPromotionToFrontend(response);
    } catch (error) {
      console.error("Error updating promotion:", error);
      throw error;
    }
  },

  /**
   * Delete promotion
   * @param {string} id - Promotion ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await apiClient.delete(`/promotions/${id}`);
    } catch (error) {
      console.error("Error deleting promotion:", error);
      throw error;
    }
  },
};

export default promotionService;
