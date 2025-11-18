/**
 * settingsService.js - Mobile version for settings API
 * Fetch system settings like delivery fee
 */

import apiClient from './apiClient';

const settingsService = {
    /**
     * Get all settings
     * @returns {Promise<Object|Array>}
     */
    async getAllSettings() {
        try {
            const response = await apiClient.get('/settings');
            return response;
        } catch (error) {
            console.error('[settingsService.getAllSettings] Error:', error);
            throw error;
        }
    },

    /**
     * Get setting by key
     * @param {string} key - Setting key
     * @returns {Promise<any>}
     */
    async getSettingByKey(key) {
        try {
            const response = await apiClient.get(`/settings?key=${key}`);
            // json-server returns array
            if (Array.isArray(response) && response.length > 0) {
                return response[0].value;
            }
            return null;
        } catch (error) {
            console.error('[settingsService.getSettingByKey] Error:', error);
            throw error;
        }
    },

    /**
     * Get delivery fee
     * @returns {Promise<number>} Delivery fee in USD (default 2.00)
     */
    async getDeliveryFee() {
        try {
            const response = await apiClient.get('/settings?key=delivery_fee');
            // json-server returns array
            if (Array.isArray(response) && response.length > 0) {
                return response[0].value || 2.00;
            }
            return 2.00; // Default fallback
        } catch (error) {
            console.error('[settingsService.getDeliveryFee] Error:', error);
            // Return default on error
            return 2.00;
        }
    },
};

export { settingsService };
