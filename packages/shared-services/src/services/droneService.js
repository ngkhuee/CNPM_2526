import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

/**
 * Fetch all drones
 * @returns {Promise<Array>}
 */
export const getAllDrones = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.DRONES.BASE);
    // Map db.json fields to camelCase
    return (response || []).map((drone) => ({
      id: drone.id,
      identifier: drone.identifier,
      status: drone.status,
      battery_level: drone.battery_level,
      latitude: drone.latitude,
      longitude: drone.longitude,
      current_location: drone.current_location,
      max_weight_kg: drone.max_weight_kg,
      assigned_order_id: drone.assigned_order_id,
      last_maintenance: drone.last_maintenance,
      created_at: drone.created_at,
      updated_at: drone.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching drones:", error);
    throw error;
  }
};

/**
 * Fetch available drones
 * @returns {Promise<Array>}
 */
export const getAvailableDrones = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.DRONES.AVAILABLE);
    return response;
  } catch (error) {
    console.error("Error fetching available drones:", error);
    throw error;
  }
};

/**
 * Fetch drones by status
 * @param {string} status - Drone status (available, delivering, charging, maintenance)
 * @returns {Promise<Array>}
 */
export const getDronesByStatus = async (status) => {
  try {
    const response = await apiClient.get(ENDPOINTS.DRONES.BY_STATUS(status));
    return response;
  } catch (error) {
    console.error(`Error fetching drones with status ${status}:`, error);
    throw error;
  }
};

/**
 * Fetch drone by ID
 * @param {string} id - Drone ID
 * @returns {Promise<Object>}
 */
export const getDroneById = async (id) => {
  try {
    const response = await apiClient.get(ENDPOINTS.DRONES.BY_ID(id));
    return response;
  } catch (error) {
    console.error(`Error fetching drone ${id}:`, error);
    throw error;
  }
};

/**
 * Update drone location
 * @param {string} id - Drone ID
 * @param {Object} location - {lat, lng}
 * @returns {Promise<Object>}
 */
export const updateDroneLocation = async (id, location) => {
  try {
    const response = await apiClient.patch(ENDPOINTS.DRONES.BY_ID(id), {
      latitude: location.lat,
      longitude: location.lng,
      updated_at: new Date().toISOString(),
    });
    return response;
  } catch (error) {
    console.error(`Error updating drone ${id} location:`, error);
    throw error;
  }
};

/**
 * Assign drone to order
 * @param {string} droneId - Drone ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>}
 */
export const assignDroneToOrder = async (droneId, orderId) => {
  try {
    const response = await apiClient.patch(ENDPOINTS.DRONES.BY_ID(droneId), {
      assigned_order_id: orderId,
      status: "busy", // FIX: Use "busy" instead of "delivering"
    });
    return response;
  } catch (error) {
    console.error(
      `Error assigning drone ${droneId} to order ${orderId}:`,
      error
    );
    throw error;
  }
};

/**
 * Create a new drone
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const createDrone = async (payload) => {
  try {
    const body = {
      identifier: payload.identifier,
      status: payload.status || "available",
      battery_level: payload.battery_level || 100,
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
      current_location: payload.current_location || null,
      max_weight_kg: payload.max_weight_kg || null,
      assigned_order_id: payload.assigned_order_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response = await apiClient.post(ENDPOINTS.DRONES.BASE, body);
    return response;
  } catch (error) {
    console.error("Error creating drone:", error);
    throw error;
  }
};

/**
 * Update drone
 */
export const updateDrone = async (id, payload) => {
  try {
    const body = { ...payload, updated_at: new Date().toISOString() };
    const response = await apiClient.patch(ENDPOINTS.DRONES.BY_ID(id), body);
    return response;
  } catch (error) {
    console.error(`Error updating drone ${id}:`, error);
    throw error;
  }
};

/**
 * Delete drone
 */
export const deleteDrone = async (id) => {
  try {
    const response = await apiClient.delete(ENDPOINTS.DRONES.BY_ID(id));
    return response;
  } catch (error) {
    console.error(`Error deleting drone ${id}:`, error);
    throw error;
  }
};

export default {
  getAllDrones,
  getAvailableDrones,
  getDronesByStatus,
  getDroneById,
  updateDroneLocation,
  assignDroneToOrder,
  createDrone,
  updateDrone,
  deleteDrone,
};
