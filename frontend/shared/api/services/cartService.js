import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const cartService = {
  async getByUser(userId) {
    try {
      const carts = await apiClient.get(ENDPOINTS.CART.BY_USER(userId));
      return (
        carts[0] || {
          id: null,
          userId,
          items: [],
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      throw error;
    }
  },

  async addItem(userId, foodId, quantity = 1) {
    try {
      return await apiClient.post(ENDPOINTS.CART.ADD_ITEM(userId), {
        foodId,
        quantity,
      });
    } catch (error) {
      throw error;
    }
  },

  async removeItem(userId, foodId) {
    try {
      return await apiClient.delete(ENDPOINTS.CART.REMOVE_ITEM(userId, foodId));
    } catch (error) {
      throw error;
    }
  },

  async clear(userId) {
    try {
      return await apiClient.delete(ENDPOINTS.CART.CLEAR(userId));
    } catch (error) {
      throw error;
    }
  },
};
