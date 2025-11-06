import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

/**
 * Fetch all settings
 * @returns {Promise<Array>}
 */
export const getAllSettings = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.SETTINGS.BASE);
    return response;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

/**
 * Fetch setting by key
 * @param {string} key - Setting key
 * @returns {Promise<Object>}
 */
export const getSettingByKey = async (key) => {
  try {
    const response = await apiClient.get(ENDPOINTS.SETTINGS.BY_KEY(key));
    // json-server returns array, get first item
    return Array.isArray(response) ? response[0] : response;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    throw error;
  }
};

/**
 * Fetch settings by category
 * @param {string} category - Setting category
 * @returns {Promise<Array>}
 */
export const getSettingsByCategory = async (category) => {
  try {
    const response = await apiClient.get(
      ENDPOINTS.SETTINGS.BY_CATEGORY(category)
    );
    return response;
  } catch (error) {
    console.error(`Error fetching settings for category ${category}:`, error);
    throw error;
  }
};

/**
 * Fetch delivery fee setting
 * @returns {Promise<number>} Delivery fee value
 */
export const getDeliveryFee = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.SETTINGS.DELIVERY_FEE);
    // json-server returns array, get first item's value
    if (Array.isArray(response) && response.length > 0) {
      return response[0].value;
    }
    return 15000; // fallback default
  } catch (error) {
    console.error("Error fetching delivery fee:", error);
    // Return default delivery fee on error
    return 15000;
  }
};

/**
 * Update setting value
 * @param {string} id - Setting ID
 * @param {any} value - New value
 * @returns {Promise<Object>}
 */
export const updateSetting = async (id, value) => {
  try {
    const response = await apiClient.patch(`${ENDPOINTS.SETTINGS.BASE}/${id}`, {
      value,
      updated_at: new Date().toISOString(),
    });
    return response;
  } catch (error) {
    console.error(`Error updating setting ${id}:`, error);
    throw error;
  }
};

export default {
  getAllSettings,
  getSettingByKey,
  getSettingsByCategory,
  getDeliveryFee,
  updateSetting,
};
