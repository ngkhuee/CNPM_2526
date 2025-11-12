// src/Context/RestaurantContext.js
import React, { createContext, useState } from "react";
import { restaurantService } from "shared-services";

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch restaurant info
  const fetchRestaurantInfo = async (restaurantId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await restaurantService.getById(restaurantId);
      if (result) {
        setCurrentRestaurant(result);
        return { success: true, data: result };
      }
      return { success: false, message: "Failed to fetch restaurant" };
    } catch (err) {
      const errorMsg = err.message || "Error fetching restaurant";
      setError(errorMsg);
      console.error("Error in fetchRestaurantInfo:", err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update restaurant info
  const updateRestaurant = async (restaurantId, data) => {
    try {
      setLoading(true);
      setError(null);

      console.log("=== updateRestaurant called ===");
      console.log("restaurantId:", restaurantId);
      console.log("data:", data);
      console.log("token from localStorage:", localStorage.getItem("token"));

      const result = await restaurantService.update(restaurantId, data);

      console.log("Update result:", result);

      if (result) {
        setCurrentRestaurant(result);
        return { success: true, data: result };
      }
      return { success: false, message: "Failed to update restaurant" };
    } catch (err) {
      const errorMsg = err.message || "Error updating restaurant";
      setError(errorMsg);
      console.error("=== Error in updateRestaurant ===");
      console.error("Error message:", errorMsg);
      console.error("Full error:", err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    currentRestaurant,
    setCurrentRestaurant,
    loading,
    setLoading,
    error,
    setError,
    fetchRestaurantInfo,
    updateRestaurant,
  };

  return React.createElement(
    RestaurantContext.Provider,
    { value: contextValue },
    children
  );
};
