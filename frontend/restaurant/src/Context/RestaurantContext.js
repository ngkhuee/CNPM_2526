// src/Context/RestaurantContext.js
import React, { createContext, useState, useEffect } from "react";
import { restaurantService, authService } from "@api/services";

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current restaurant info based on logged-in user
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === "restaurant" && user.restaurantId) {
      // Validate restaurantId format (should be like r1, r2, r3, not r3-1)
      if (/^r\d+$/.test(user.restaurantId)) {
        fetchRestaurantInfo(user.restaurantId);
      } else {
        console.error("Invalid restaurantId format:", user.restaurantId);
        setError("Invalid restaurant ID. Please login again.");
      }
    }
  }, []);

  // Fetch restaurant details from API
  const fetchRestaurantInfo = async (restaurantId) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching restaurant info for:", restaurantId);
      const restaurant = await restaurantService.getById(restaurantId);
      console.log("Restaurant fetched:", restaurant);
      setCurrentRestaurant(restaurant);
    } catch (err) {
      console.error("Error fetching restaurant info:", err);
      setError(err.message);
      // If 404, might be invalid restaurantId from old cache
      if (err.message.includes("404") || err.message.includes("Not Found")) {
        console.warn("Restaurant not found. Please logout and login again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update restaurant info
  const updateRestaurant = async (restaurantId, data) => {
    try {
      const updated = await restaurantService.update(restaurantId, data);
      setCurrentRestaurant(updated);
      return { success: true, restaurant: updated };
    } catch (err) {
      console.error("Error updating restaurant:", err);
      return { success: false, message: err.message };
    }
  };

  const contextValue = {
    currentRestaurant,
    setCurrentRestaurant,
    fetchRestaurantInfo,
    updateRestaurant,
    loading,
    error,
  };

  return React.createElement(
    RestaurantContext.Provider,
    { value: contextValue },
    children
  );
};
