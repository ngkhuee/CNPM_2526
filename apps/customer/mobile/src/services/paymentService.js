/**
 * Payment Service for Mobile
 * Uses shared endpoints and mobile API client
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';

export const paymentService = {
    async create(paymentData) {
        try {
            return await apiClient.post(ENDPOINTS.PAYMENTS.BASE, paymentData);
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
            return await apiClient.post(ENDPOINTS.PAYMENTS.PROCESS, paymentData);
        } catch (error) {
            throw error;
        }
    },

    async handleCallback(callbackData) {
        try {
            return await apiClient.post(ENDPOINTS.PAYMENTS.CALLBACK, callbackData);
        } catch (error) {
            throw error;
        }
    },
};

export default paymentService;
