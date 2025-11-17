// src/Context/FoodContext.js
import React, { createContext, useState, useEffect } from "react";
import { foodService, authService } from "shared-services";

export const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch foods on mount (only if user is logged in)
  useEffect(() => {
    const initializeFoods = async () => {
      try {
        const user = await authService.getCurrentUser();
        console.log("FoodContext - user loaded:", user);
        if (user?.role === "restaurant" && user?.restaurantId && /^r\d+$/.test(user.restaurantId)) {
          console.log("FoodContext - fetching foods for:", user.restaurantId);
          await fetchFoods(user.restaurantId);
        }
      } catch (err) {
        console.error("Error initializing foods:", err);
      }
    };
    initializeFoods();
  }, []);

  // Fetch all foods from API
  const fetchFoods = async (restaurantId = null) => {
    try {
      setLoading(true);
      const foods = restaurantId
        ? await foodService.getByRestaurant(restaurantId)
        : await foodService.getAll();
      setFoodList(foods);
      return { success: true, data: foods };
    } catch (error) {
      console.error("Error fetching foods:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Add new food
  const addFood = async (foodData) => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, message: "User not authenticated" };
      }

      const payload = {
        ...foodData,
        restaurantId: currentUser.restaurantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await foodService.create(payload);
      if (result) {
        await fetchFoods(currentUser.restaurantId);
        return { success: true, data: result };
      }
      return { success: false, message: "Failed to create food" };
    } catch (error) {
      console.error("Error adding food:", error);
      return { success: false, message: error.message };
    }
  };

  // Update food
  const updateFood = async (foodId, foodData) => {
    try {
      const currentUser = await authService.getCurrentUser();
      const payload = {
        ...foodData,
        updated_at: new Date().toISOString(),
      };

      const result = await foodService.update(foodId, payload);
      if (result) {
        await fetchFoods(currentUser?.restaurantId);
        return { success: true, data: result };
      }
      return { success: false, message: "Failed to update food" };
    } catch (error) {
      console.error("Error updating food:", error);
      return { success: false, message: error.message };
    }
  };

  // Delete food
  const deleteFood = async (foodId) => {
    try {
      const currentUser = await authService.getCurrentUser();
      const result = await foodService.delete(foodId);
      if (result) {
        await fetchFoods(currentUser?.restaurantId);
        return { success: true };
      }
      return { success: false, message: "Failed to delete food" };
    } catch (error) {
      console.error("Error deleting food:", error);
      return { success: false, message: error.message };
    }
  };

  const contextValue = {
    foodList,
    setFoodList,
    fetchFoods,
    addFood,
    updateFood,
    deleteFood,
    loading,
  };

  return React.createElement(
    FoodContext.Provider,
    { value: contextValue },
    children
  );
};
