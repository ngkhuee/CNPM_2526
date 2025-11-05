import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

// Menu Service - quản lý menu và món ăn
export const foodService = {
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.MENUS.BASE, { params });
      // Map backend (snake_case) to frontend (camelCase)
      return response.map((menu) => ({
        id: menu.id || menu.menu_id,
        _id: menu.id || menu.menu_id,
        name: menu.item_name,
        restaurantId: menu.restaurant_id,
        price: menu.price,
        description: menu.description,
        image: menu.image_url,
        isAvailable: menu.is_available,
        category: menu.category,
        createdAt: menu.created_at,
      }));
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(ENDPOINTS.MENUS.BY_ID(id));
      return {
        id: response.id || response.menu_id,
        _id: response.id || response.menu_id,
        name: response.item_name,
        restaurantId: response.restaurant_id,
        price: response.price,
        description: response.description,
        image: response.image_url,
        isAvailable: response.is_available,
        category: response.category,
        createdAt: response.created_at,
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
        id: menu.id || menu.menu_id,
        _id: menu.id || menu.menu_id,
        name: menu.item_name,
        restaurantId: menu.restaurant_id,
        price: menu.price,
        description: menu.description,
        image: menu.image_url,
        isAvailable: menu.is_available,
        category: menu.category,
        createdAt: menu.created_at,
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
      // POST /menus - JSON Server will auto-generate menu_id
      const payload = {
        restaurant_id: menuData.restaurantId,
        item_name: menuData.name,
        price: menuData.price,
        description: menuData.description,
        image_url: menuData.image,
        is_available: menuData.isAvailable !== false,
        category: menuData.category || menuData.categoryId,
        created_at: new Date().toISOString(),
      };

      const response = await apiClient.post(ENDPOINTS.MENUS.BASE, payload);
      // Map back to frontend format
      return {
        ...response,
        id: response.id || response.menu_id,
        name: response.item_name,
        image: response.image_url,
        isAvailable: response.is_available,
        restaurantId: response.restaurant_id,
      };
    } catch (error) {
      throw error;
    }
  },

  async update(id, menuData) {
    try {
      // PUT /menu/:item_id - update món ăn
      const payload = {
        item_name: menuData.name,
        price: menuData.price,
        description: menuData.description,
        image_url: menuData.image,
        is_available: menuData.isAvailable,
        category: menuData.category || menuData.categoryId,
      };

      const response = await apiClient.put(`/menu/${id}`, payload);
      // Map back to frontend format
      return {
        ...response,
        id: response.id || response.menu_id,
        name: response.item_name,
        image: response.image_url,
        isAvailable: response.is_available,
        restaurantId: response.restaurant_id,
      };
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      // DELETE /menu/:item_id
      return await apiClient.delete(`/menu/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
