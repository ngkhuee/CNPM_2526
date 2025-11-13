/**
 * Order Tracking Service
 * Handles order tracking logic, status updates, and confirmation
 * Shared between web and mobile customer apps
 */

import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const orderTrackingService = {
    /**
     * Get order by ID with full details
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} - Order details
     */
    async getOrderDetails(orderId) {
        try {
            const response = await apiClient.get(`${ENDPOINTS.ORDERS.BASE}/${orderId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} newStatus - New status
     * @param {Object} additionalData - Optional additional data
     * @returns {Promise<Object>} - Updated order
     */
    async updateOrderStatus(orderId, newStatus, additionalData = {}) {
        try {
            const updateData = {
                status: newStatus,
                updated_at: new Date().toISOString(),
                ...additionalData,
            };
            const response = await apiClient.patch(
                `${ENDPOINTS.ORDERS.BASE}/${orderId}`,
                updateData
            );
            return response;
        } catch (error) {
            console.error(`Error updating order ${orderId} status:`, error);
            throw error;
        }
    },

    /**
     * Confirm delivery (customer confirms received order)
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} - Updated order
     */
    async confirmDelivery(orderId) {
        try {
            return await this.updateOrderStatus(orderId, "delivered", {
                actual_delivery_time: new Date().toISOString(),
            });
        } catch (error) {
            console.error(`Error confirming delivery for order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Update order GPS position (for drone)
     * @param {string} orderId - Order ID
     * @param {Object} gpsPosition - {lat, lng}
     * @returns {Promise<Object>} - Updated order
     */
    async updateOrderGPSPosition(orderId, gpsPosition) {
        try {
            return await this.updateOrderStatus(orderId, null, {
                current_gps: gpsPosition,
            });
        } catch (error) {
            console.error(`Error updating GPS position for order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Cancel order
     * @param {string} orderId - Order ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} - Updated order
     */
    async cancelOrder(orderId, reason = "") {
        try {
            return await this.updateOrderStatus(orderId, "cancelled", {
                cancellation_reason: reason,
            });
        } catch (error) {
            console.error(`Error cancelling order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Get orders by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Array>} - User's orders
     */
    async getUserOrders(userId) {
        try {
            const response = await apiClient.get(
                `${ENDPOINTS.ORDERS.BASE}?user_id=${userId}`
            );
            return response;
        } catch (error) {
            console.error(`Error fetching orders for user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Get orders by status
     * @param {string} status - Order status
     * @returns {Promise<Array>} - Orders with specified status
     */
    async getOrdersByStatus(status) {
        try {
            const response = await apiClient.get(
                `${ENDPOINTS.ORDERS.BASE}?status=${status}`
            );
            return response;
        } catch (error) {
            console.error(`Error fetching orders with status ${status}:`, error);
            throw error;
        }
    },
};
