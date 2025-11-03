import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const paymentService = {
  async getAll() {
    try {
      return await apiClient.get(ENDPOINTS.PAYMENTS.BASE);
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      return await apiClient.get(ENDPOINTS.PAYMENTS.BY_ID(id));
    } catch (error) {
      throw error;
    }
  },

  async getByOrder(orderId) {
    try {
      return await apiClient.get(ENDPOINTS.PAYMENTS.BY_ORDER(orderId));
    } catch (error) {
      throw error;
    }
  },

  async process(paymentData) {
    try {
      const newPayment = {
        ...paymentData,
        status: "pending",
        gateway: paymentData.method || "momo",
        created_at: new Date().toISOString(),
      };
      return await apiClient.post(ENDPOINTS.PAYMENTS.PROCESS, newPayment);
    } catch (error) {
      throw error;
    }
  },

  async callback(callbackData) {
    try {
      return await apiClient.post(ENDPOINTS.PAYMENTS.CALLBACK, callbackData);
    } catch (error) {
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      return await apiClient.patch(ENDPOINTS.PAYMENTS.BY_ID(id), {
        status,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  },
};
