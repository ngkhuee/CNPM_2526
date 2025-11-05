import { useState, useEffect, useCallback } from "react";
import { restaurantService } from "shared-services";

/**
 * Hook for managing restaurants (CRUD operations)
 * Used in Admin Partners page
 */
export const useRestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all restaurants
  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restaurantService.getAll();
      setRestaurants(data || []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Add restaurant
  const addRestaurant = useCallback(async (restaurantData) => {
    try {
      setError(null);
      const newRestaurant = await restaurantService.create(restaurantData);
      setRestaurants((prev) => [...prev, newRestaurant]);
      return { success: true, restaurant: newRestaurant };
    } catch (err) {
      console.error("Error adding restaurant:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  // Update restaurant
  const updateRestaurant = useCallback(async (id, restaurantData) => {
    try {
      setError(null);
      const updated = await restaurantService.update(id, restaurantData);
      setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return { success: true, restaurant: updated };
    } catch (err) {
      console.error("Error updating restaurant:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  // Delete restaurant
  const deleteRestaurant = useCallback(async (id) => {
    try {
      setError(null);
      await restaurantService.delete(id);
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    refresh,
  };
};
