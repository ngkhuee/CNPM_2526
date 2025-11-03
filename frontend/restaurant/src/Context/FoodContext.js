// src/Context/FoodContext.js
import React, { createContext, useState, useEffect } from "react";
import { foodService, restaurantService } from "@api/services";

// Tạo context
export const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch foods on mount (only if user is logged in)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    // Only fetch for restaurant accounts with valid restaurantId
    if (
      user.role === "restaurant" &&
      user.restaurantId &&
      /^r\d+$/.test(user.restaurantId)
    ) {
      fetchFoods(user.restaurantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  // Fetch all foods from API
  const fetchFoods = async (restaurantId = null) => {
    try {
      setLoading(true);
      const foods = restaurantId
        ? await foodService.getByRestaurant(restaurantId)
        : await foodService.getAll();
      setFoodList(foods);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new food
  const addFood = async (foodData) => {
    try {
      const newFood = await foodService.create(foodData);
      setFoodList((prev) => [...prev, newFood]);
      return { success: true, food: newFood };
    } catch (error) {
      console.error("Error adding food:", error);
      return { success: false, message: error.message };
    }
  };

  // Update food
  const updateFood = async (foodId, foodData) => {
    try {
      const updatedFood = await foodService.update(foodId, foodData);
      setFoodList((prev) =>
        prev.map((f) => (f.id === foodId ? updatedFood : f))
      );
      return { success: true, food: updatedFood };
    } catch (error) {
      console.error("Error updating food:", error);
      return { success: false, message: error.message };
    }
  };

  // Delete food
  const deleteFood = async (foodId) => {
    try {
      await foodService.delete(foodId);
      setFoodList((prev) => prev.filter((f) => f.id !== foodId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting food:", error);
      return { success: false, message: error.message };
    }
  };

  // Get food by ID
  const getFoodById = (foodId) => {
    return foodList.find((f) => f.id === foodId);
  };

  // Get foods by category
  const getFoodsByCategory = (categoryId) => {
    return foodList.filter((f) => f.category === categoryId);
  };

  // Tạo object chứa state và methods
  const contextValue = {
    foodList,
    setFoodList,
    fetchFoods,
    addFood,
    updateFood,
    deleteFood,
    getFoodById,
    getFoodsByCategory,
    loading,
  };

  return React.createElement(
    FoodContext.Provider,
    { value: contextValue },
    children
  );
};
