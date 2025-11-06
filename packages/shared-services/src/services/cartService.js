import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const cartService = {
  // Get cart by user (returns existing or creates new)
  async getByUser(userId) {
    try {
      const carts = await apiClient.get(ENDPOINTS.CART.BY_USER(userId));

      if (carts.length > 0) {
        return carts[0];
      }

      // Create new cart if not exists
      const newCart = {
        user_id: userId,
        items: [],
        updated_at: new Date().toISOString(),
      };
      const created = await apiClient.post(ENDPOINTS.CART.BASE, newCart);
      return created;
    } catch (error) {
      console.error("Error getting cart:", error);
      throw error;
    }
  },

  // Update entire cart (upsert)
  async updateCart(userId, items) {
    try {
      // Get existing cart
      const carts = await apiClient.get(ENDPOINTS.CART.BY_USER(userId));

      const cartData = {
        user_id: userId,
        items,
        updated_at: new Date().toISOString(),
      };

      if (carts.length > 0) {
        // Update existing cart
        return await apiClient.patch(
          `${ENDPOINTS.CART.BASE}/${carts[0].id}`,
          cartData
        );
      } else {
        // Create new cart
        return await apiClient.post(ENDPOINTS.CART.BASE, cartData);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  },

  // Add item to cart
  async addItem(userId, foodId, quantity = 1) {
    try {
      const cart = await this.getByUser(userId);
      const items = cart.items || [];

      // Find existing item
      const existingIndex = items.findIndex((item) => item.foodId === foodId);

      if (existingIndex >= 0) {
        // Update quantity
        items[existingIndex].quantity += quantity;
      } else {
        // Add new item
        items.push({ foodId, quantity });
      }

      return await this.updateCart(userId, items);
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  },

  // Remove item from cart
  async removeItem(userId, foodId) {
    try {
      const cart = await this.getByUser(userId);
      const items = (cart.items || []).filter((item) => item.foodId !== foodId);
      return await this.updateCart(userId, items);
    } catch (error) {
      console.error("Error removing item:", error);
      throw error;
    }
  },

  // Clear cart
  async clear(userId) {
    try {
      return await this.updateCart(userId, []);
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },
};
