import apiClient from "../config/apiClient";

// Helper to map snake_case fields from backend to camelCase for frontend
const mapCategoryToFrontend = (category) => {
  if (!category) return null;

  return {
    id: category.id,
    restaurantId: category.restaurant_id,
    name: category.name,
    description: category.description,
    displayOrder: category.display_order,
    status: category.status,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
};

// Helper to map camelCase fields from frontend to snake_case for backend
const mapCategoryToBackend = (category) => {
  const payload = {
    name: category.name,
    description: category.description,
    status: category.status || "active",
  };

  // Only include if provided
  if (category.restaurantId) payload.restaurant_id = category.restaurantId;
  if (category.displayOrder !== undefined)
    payload.display_order = category.displayOrder;

  return payload;
};

const categoryService = {
  /**
   * Get all active categories
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await apiClient.get("/categories?status=active");
      // apiClient already returns response.data
      return response.map(mapCategoryToFrontend);
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
      // apiClient already returns response.data
      return mapCategoryToFrontend(response);
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
      // Query with backend field name (restaurant_id)
      const response = await apiClient.get(
        `/categories?restaurant_id=${restaurantId}&status=active`
      );
      // apiClient already returns response.data
      return response.map(mapCategoryToFrontend);
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
      // Map frontend camelCase to backend snake_case
      const payload = mapCategoryToBackend(categoryData);

      // Add timestamps
      payload.created_at = new Date().toISOString();
      payload.updated_at = new Date().toISOString();

      const response = await apiClient.post("/categories", payload);
      // apiClient already returns response.data
      return mapCategoryToFrontend(response);
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
      // Map frontend camelCase to backend snake_case
      const payload = mapCategoryToBackend(updates);
      payload.updated_at = new Date().toISOString();

      const response = await apiClient.patch(`/categories/${id}`, payload);
      // apiClient already returns response.data
      return mapCategoryToFrontend(response);
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
