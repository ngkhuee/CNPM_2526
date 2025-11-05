import apiClient from "../config/apiClient";

const categoryService = {
  /**
   * Get all active categories
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await apiClient.get("/categories?status=active");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  /**
   * Get categories by restaurant
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Array>}
   */
  async getByRestaurant(restaurantId) {
    try {
      const response = await apiClient.get(
        `/categories?restaurantId=${restaurantId}&status=active`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching restaurant categories:", error);
      throw error;
    }
  },

  /**
   * Create new category (for restaurant owners)
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>}
   */
  async create(categoryData) {
    try {
      const response = await apiClient.post("/categories", categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    try {
      const response = await apiClient.patch(`/categories/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

export default categoryService;
