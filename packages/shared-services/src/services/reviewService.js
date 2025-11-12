import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const reviewService = {
  async getAll() {
    try {
      return await apiClient.get(ENDPOINTS.REVIEWS.BASE);
    } catch (error) {
      throw error;
    }
  },

  async getByFood(foodId) {
    try {
      return await apiClient.get(ENDPOINTS.REVIEWS.BY_FOOD(foodId));
    } catch (error) {
      throw error;
    }
  },

  async getByUser(userId) {
    try {
      return await apiClient.get(ENDPOINTS.REVIEWS.BY_USER(userId));
    } catch (error) {
      throw error;
    }
  },

  async getByRestaurant(restaurantId) {
    try {
      return await apiClient.get(ENDPOINTS.REVIEWS.BY_RESTAURANT(restaurantId));
    } catch (error) {
      throw error;
    }
  },

  async create(reviewData) {
    try {
      // Validate required fields
      if (!reviewData.food_id || !reviewData.user_id || !reviewData.order_id) {
        throw new Error("Missing required fields: food_id, user_id, order_id");
      }

      const newReview = {
        ...reviewData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: reviewData.images || [],
        restaurant_reply: null, // Start with null, restaurant can add later
      };
      return await apiClient.post(ENDPOINTS.REVIEWS.BASE, newReview);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add restaurant reply to a review
   */
  async replyToReview(reviewId, replyText) {
    try {
      if (!replyText || replyText.trim().length === 0) {
        throw new Error("Reply text cannot be empty");
      }

      return await apiClient.patch(`${ENDPOINTS.REVIEWS.BASE}/${reviewId}`, {
        restaurant_reply: replyText,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  },

  async update(id, reviewData) {
    try {
      return await apiClient.patch(`${ENDPOINTS.REVIEWS.BASE}/${id}`, {
        ...reviewData,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(`${ENDPOINTS.REVIEWS.BASE}/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
