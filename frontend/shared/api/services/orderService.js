import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const orderService = {
  async getAll() {
    try {
      return await apiClient.get(ENDPOINTS.ORDERS.BASE);
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      return await apiClient.get(ENDPOINTS.ORDERS.BY_ID(id));
    } catch (error) {
      throw error;
    }
  },

  async getByUser(userId) {
    try {
      return await apiClient.get(ENDPOINTS.ORDERS.BY_USER(userId));
    } catch (error) {
      throw error;
    }
  },

  async getByRestaurant(restaurantId) {
    try {
      return await apiClient.get(ENDPOINTS.ORDERS.BY_RESTAURANT(restaurantId));
    } catch (error) {
      throw error;
    }
  },

  async create(orderData) {
    try {
      const newOrder = {
        ...orderData,
        orderNumber: `ORD-${Date.now()}`,
        status: orderData.status || "pending",
        paymentStatus: orderData.paymentStatus || "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return await apiClient.post(ENDPOINTS.ORDERS.BASE, newOrder);
    } catch (error) {
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      return await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  },

  async update(id, orderData) {
    try {
      return await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(id), {
        ...orderData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  },

  async cancel(id) {
    try {
      return await this.updateStatus(id, "cancelled");
    } catch (error) {
      throw error;
    }
  },
};
