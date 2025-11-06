import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

// Menu Service - quản lý menu và món ăn
export const foodService = {
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.MENUS.BASE, { params });
      // Map backend (snake_case) to frontend (camelCase)
      return response.map((menu) => ({
        id: menu.id,
        _id: menu.id,
        name: menu.name,
        restaurantId: menu.restaurant_id,
        categoryId: menu.category_id,
        price: menu.price,
        description: menu.description,
        image: menu.image,
        isAvailable: menu.is_available,
        preparationTime: menu.preparation_time_minutes,
        createdAt: menu.created_at,
        updatedAt: menu.updated_at,
      }));
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(ENDPOINTS.MENUS.BY_ID(id));
      return {
        id: response.id,
        _id: response.id,
        name: response.name,
        restaurantId: response.restaurant_id,
        categoryId: response.category_id,
        price: response.price,
        description: response.description,
        image: response.image,
        isAvailable: response.is_available,
        preparationTime: response.preparation_time_minutes,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    } catch (error) {
      throw error;
    }
  },

  async getByRestaurant(restaurantId) {
    try {
      // GET /restaurants/:id/menu
      const response = await apiClient.get(`/restaurants/${restaurantId}/menu`);
      return response.map((menu) => ({
        id: menu.id,
        _id: menu.id,
        name: menu.name,
        restaurantId: menu.restaurant_id,
        categoryId: menu.category_id,
        price: menu.price,
        description: menu.description,
        image: menu.image,
        isAvailable: menu.is_available,
        preparationTime: menu.preparation_time_minutes,
        createdAt: menu.created_at,
        updatedAt: menu.updated_at,
      }));
    } catch (error) {
      throw error;
    }
  },

  async getByCategory(categoryId) {
    try {
      const response = await apiClient.get(
        ENDPOINTS.FOODS.BY_CATEGORY(categoryId)
      );
      return response.map((food) => ({ ...food, _id: food.id }));
    } catch (error) {
      throw error;
    }
  },

  async search(query) {
    try {
      const response = await apiClient.get(ENDPOINTS.FOODS.SEARCH(query));
      return response.map((food) => ({ ...food, _id: food.id }));
    } catch (error) {
      throw error;
    }
  },

  async create(menuData) {
    try {
      // POST /menus - JSON Server will auto-generate id
      const payload = {
        restaurant_id: menuData.restaurantId,
        category_id: menuData.categoryId,
        name: menuData.name,
        price: menuData.price,
        description: menuData.description,
        image: menuData.image,
        is_available: menuData.isAvailable !== false,
        preparation_time_minutes: menuData.preparationTime || 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await apiClient.post(ENDPOINTS.MENUS.BASE, payload);
      // Map back to frontend format
      return {
        id: response.id,
        _id: response.id,
        name: response.name,
        image: response.image,
        isAvailable: response.is_available,
        restaurantId: response.restaurant_id,
        categoryId: response.category_id,
        price: response.price,
        description: response.description,
        preparationTime: response.preparation_time_minutes,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    } catch (error) {
      throw error;
    }
  },

  async update(id, menuData) {
    try {
      // PATCH /menus/:id - update món ăn
      const payload = {
        name: menuData.name,
        price: menuData.price,
        description: menuData.description,
        image: menuData.image,
        is_available: menuData.isAvailable,
        category_id: menuData.categoryId,
        preparation_time_minutes: menuData.preparationTime,
        updated_at: new Date().toISOString(),
      };

      const response = await apiClient.patch(`/menus/${id}`, payload);
      // Map back to frontend format
      return {
        id: response.id,
        _id: response.id,
        name: response.name,
        image: response.image,
        isAvailable: response.is_available,
        restaurantId: response.restaurant_id,
        categoryId: response.category_id,
        price: response.price,
        description: response.description,
        preparationTime: response.preparation_time_minutes,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      // DELETE /menus/:id
      return await apiClient.delete(`/menus/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
