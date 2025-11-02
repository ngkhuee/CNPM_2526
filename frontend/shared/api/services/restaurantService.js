import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const restaurantService = {
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BASE, {
        params,
      });
      // Map id → _id for frontend consistency
      return response.map((restaurant) => ({
        ...restaurant,
        _id: restaurant.id,
      }));
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BY_ID(id));
      return { ...response, _id: response.id };
    } catch (error) {
      throw error;
    }
  },

  async getFoods(id) {
    try {
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.FOODS(id));
      return response.map((food) => ({ ...food, _id: food.id }));
    } catch (error) {
      throw error;
    }
  },

  async getOrders(id) {
    try {
      return await apiClient.get(ENDPOINTS.RESTAURANTS.ORDERS(id));
    } catch (error) {
      throw error;
    }
  },

  async create(restaurantData) {
    try {
      return await apiClient.post(ENDPOINTS.RESTAURANTS.BASE, restaurantData);
    } catch (error) {
      throw error;
    }
  },

  async update(id, restaurantData) {
    try {
      return await apiClient.put(
        ENDPOINTS.RESTAURANTS.BY_ID(id),
        restaurantData
      );
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(ENDPOINTS.RESTAURANTS.BY_ID(id));
    } catch (error) {
      throw error;
    }
  },
};
