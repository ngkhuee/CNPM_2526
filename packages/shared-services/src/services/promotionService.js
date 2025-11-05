import apiClient from "../config/apiClient";

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
      return response;
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
      return response.data[0] || null;
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
    } else if (promotion.type === "fixed") {
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
      return response.data;
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
      const response = await apiClient.get(
        `/promotions?status=active&applicableRestaurants_like=${restaurantId}`
      );
      return response.data;
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
      const response = await apiClient.post("/promotions", promotionData);
      return response.data;
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
      const response = await apiClient.patch(`/promotions/${id}`, updates);
      return response.data;
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
