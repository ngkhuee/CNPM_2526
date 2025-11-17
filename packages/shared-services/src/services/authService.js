import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import { storage } from "../utils/storage";

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      if (response.success && response.token) {
        // Map snake_case fields to camelCase for frontend
        const user = response.user;

        // Map restaurant_id → restaurantId
        if (user.restaurant_id) {
          user.restaurantId = user.restaurant_id;
          delete user.restaurant_id;
        }

        // Map full_name → fullName
        if (user.full_name) {
          user.fullName = user.full_name;
          delete user.full_name;
        }

        // Map roles array → role string for compatibility
        if (user.roles && Array.isArray(user.roles)) {
          // Convert roles array to single role string
          if (user.roles.includes("restaurant_owner")) {
            user.role = "restaurant";
          } else if (user.roles.includes("admin")) {
            user.role = "admin";
          } else if (user.roles.includes("customer")) {
            user.role = "customer";
          } else {
            user.role = user.roles[0]; // fallback to first role
          }
        }

        await storage.setItem("token", response.token);
        await storage.setItem("user", JSON.stringify(user));

        // Return with mapped user
        response.user = user;
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);

      if (response.success && response.token) {
        // Map snake_case fields to camelCase for frontend
        const user = response.user;

        // Map restaurant_id → restaurantId
        if (user.restaurant_id) {
          user.restaurantId = user.restaurant_id;
          delete user.restaurant_id;
        }

        // Map full_name → fullName
        if (user.full_name) {
          user.fullName = user.full_name;
          delete user.full_name;
        }

        // Map roles array → role string for compatibility
        if (user.roles && Array.isArray(user.roles)) {
          // Convert roles array to single role string
          if (user.roles.includes("restaurant_owner")) {
            user.role = "restaurant";
          } else if (user.roles.includes("admin")) {
            user.role = "admin";
          } else if (user.roles.includes("customer")) {
            user.role = "customer";
          } else {
            user.role = user.roles[0]; // fallback to first role
          }
        }

        await storage.setItem("token", response.token);
        await storage.setItem("user", JSON.stringify(user));

        // Return with mapped user
        response.user = user;
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    await storage.removeItem("token");
    await storage.removeItem("user");
    await storage.removeItem("cartItems");
  },

  async getCurrentUser() {
    const userStr = await storage.getItem("user");
    if (!userStr) return null;

    const user = JSON.parse(userStr);

    // Ensure mappings are applied (in case stored user has old format)
    if (user.restaurant_id && !user.restaurantId) {
      user.restaurantId = user.restaurant_id;
    }
    if (user.full_name && !user.fullName) {
      user.fullName = user.full_name;
    }

    // Ensure role mapping is applied
    if (user.roles && Array.isArray(user.roles) && !user.role) {
      if (user.roles.includes("restaurant_owner")) {
        user.role = "restaurant";
      } else if (user.roles.includes("admin")) {
        user.role = "admin";
      } else if (user.roles.includes("customer")) {
        user.role = "customer";
      } else {
        user.role = user.roles[0];
      }
    }

    return user;
  },

  async isAuthenticated() {
    const token = await storage.getItem("token");
    return !!token;
  },

  // Admin: Get all users
  async getAllUsers() {
    try {
      // Add timestamp to prevent caching
      const response = await apiClient.get(`/users?_t=${Date.now()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Update user status
  async updateUserStatus(userId, status) {
    try {
      const response = await apiClient.patch(`/users/${userId}`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Delete user
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
