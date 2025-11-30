import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const reviewService = {
  async getAll() {
    try {
      const reviews = await apiClient.get(ENDPOINTS.REVIEWS.BASE);

      // Fetch user info for reviews that don't have user_name
      const reviewsWithUser = await Promise.all(
        reviews.map(async (review) => {
          if (review.user_name) return review;

          let userName = null;
          if (review.user_id) {
            try {
              const user = await apiClient.get(`/users/${review.user_id}`);
              userName = user?.name || user?.full_name;
            } catch (err) {
              console.error(`Failed to fetch user ${review.user_id}:`, err.message);
            }
          }

          return { ...review, user_name: userName };
        })
      );

      return reviewsWithUser;
    } catch (error) {
      throw error;
    }
  },

  async getByFood(foodId) {
    try {
      const reviews = await apiClient.get(ENDPOINTS.REVIEWS.BY_FOOD(foodId));

      // Fetch user info for reviews that don't have user_name
      const reviewsWithUser = await Promise.all(
        reviews.map(async (review) => {
          if (review.user_name) return review;

          let userName = null;
          if (review.user_id) {
            try {
              const user = await apiClient.get(`/users/${review.user_id}`);
              userName = user?.name || user?.full_name;
            } catch (err) {
              console.error(`Failed to fetch user ${review.user_id}:`, err.message);
            }
          }

          return { ...review, user_name: userName };
        })
      );

      return reviewsWithUser;
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
      const reviews = await apiClient.get(ENDPOINTS.REVIEWS.BY_RESTAURANT(restaurantId));

      // Fetch user info for reviews that don't have user_name
      const reviewsWithUser = await Promise.all(
        reviews.map(async (review) => {
          if (review.user_name) return review;

          let userName = null;
          if (review.user_id) {
            try {
              const user = await apiClient.get(`/users/${review.user_id}`);
              userName = user?.name || user?.full_name;
            } catch (err) {
              console.error(`Failed to fetch user ${review.user_id}:`, err.message);
            }
          }

          return { ...review, user_name: userName };
        })
      );

      return reviewsWithUser;
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
