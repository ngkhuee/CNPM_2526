import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

// Helper to get storage (supports both web localStorage and mobile AsyncStorage)
const getStorage = () => {
  // Try to get storage from global if initialized by mobile
  if (typeof global !== 'undefined' && global.__storageAdapter) {
    return global.__storageAdapter;
  }
  // Fallback to localStorage for web
  if (typeof localStorage !== 'undefined') {
    return {
      getItem: (key) => localStorage.getItem(key),
      setItem: (key, value) => localStorage.setItem(key, value),
      removeItem: (key) => localStorage.removeItem(key),
      clear: () => localStorage.clear(),
    };
  }
  // Fallback object (for environments without storage)
  return {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
  };
};

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

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(user));

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

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(user));

        // Return with mapped user
        response.user = user;
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
