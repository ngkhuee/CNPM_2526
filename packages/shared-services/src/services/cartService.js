import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

/**
 * Cart Service - Handles all API calls for cart management
 * Separates HTTP logic from component/hook logic
 * 
 * Cart Structure:
 * {
 *   id: string
 *   user_id: string
 *   restaurant_id: string (NEW: Single restaurant constraint)
 *   items: [{
 *     id: string
 *     food_id: string
 *     name: string
 *     price: number
 *     quantity: number
 *     note: string
 *     subtotal: number
 *   }]
 *   total: number
 *   created_at: string
 *   updated_at: string
 * }
 */
export const cartService = {
  /**
   * Get current user's cart
   * @returns {Object|null} Cart object or null if no cart
   */
  async getCart() {
    try {
      const response = await apiClient.get("/cart");
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No cart exists yet
      }
      throw error;
    }
  },

  /**
   * Add item to cart (or create cart if doesn't exist)
   * 
   * @param {Object} params
   * @param {string} params.restaurant_id - Restaurant ID
   * @param {string} params.food_id - Food ID
   * @param {number} params.quantity - Quantity to add
   * @param {string} params.note - Optional note/request
   * @returns {Object} Updated cart
   * 
   * @throws {Error} If trying to add from different restaurant
   */
  async addItem({ restaurant_id, food_id, quantity = 1, note = "" }) {
    try {
      const response = await apiClient.post("/cart/add", {
        restaurant_id,
        food_id,
        quantity,
        note,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update cart item (quantity, note)
   * 
   * @param {Object} params
   * @param {string} params.item_id - Cart item ID
   * @param {number} params.quantity - New quantity
   * @param {string} params.note - Updated note
   * @returns {Object} Updated cart
   */
  async updateItem({ item_id, quantity, note }) {
    try {
      const response = await apiClient.patch(`/cart/item/${item_id}`, {
        quantity,
        note,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove item from cart
   * 
   * @param {string} item_id - Cart item ID to remove
   * @returns {Object} Updated cart
   */
  async removeItem(item_id) {
    try {
      const response = await apiClient.delete(`/cart/item/${item_id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear entire cart (used when switching restaurants)
   * 
   * @returns {Object} Empty cart or success message
   */
  async clearCart() {
    try {
      const response = await apiClient.delete("/cart/clear");
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if can add item from different restaurant
   * Returns the current restaurant_id if cart exists
   * 
   * @returns {string|null} Current restaurant_id or null if no cart
   */
  async getCurrentRestaurantId() {
    try {
      const cart = await this.getCart();
      return cart?.restaurant_id || null;
    } catch (error) {
      return null;
    }
  },
};

export default cartService;
