import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
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
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
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
