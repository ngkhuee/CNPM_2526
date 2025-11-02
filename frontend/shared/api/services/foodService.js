import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const foodService = {
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.FOODS.BASE, { params });
      // Map id → _id for frontend consistency
      return response.map((food) => ({ ...food, _id: food.id }));
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(ENDPOINTS.FOODS.BY_ID(id));
      return { ...response, _id: response.id };
    } catch (error) {
      throw error;
    }
  },

  async getByRestaurant(restaurantId) {
    try {
      const response = await apiClient.get(
        ENDPOINTS.FOODS.BY_RESTAURANT(restaurantId)
      );
      return response.map((food) => ({ ...food, _id: food.id }));
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

  async create(foodData) {
    try {
      return await apiClient.post(ENDPOINTS.FOODS.BASE, foodData);
    } catch (error) {
      throw error;
    }
  },

  async update(id, foodData) {
    try {
      return await apiClient.put(ENDPOINTS.FOODS.BY_ID(id), foodData);
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(ENDPOINTS.FOODS.BY_ID(id));
    } catch (error) {
      throw error;
    }
  },
};
