// src/Context/CategoryContext.js
import React, { createContext, useState, useEffect } from "react";
import { categoryService, authService } from "shared-services";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories for current restaurant on mount
  useEffect(() => {
    const initializeCategories = async () => {
      try {
        const user = await authService.getCurrentUser();
        console.log("CategoryContext - user loaded:", user);
        if (user?.role === "restaurant" && user?.restaurantId && /^r\d+$/.test(user.restaurantId)) {
          console.log("CategoryContext - fetching categories for:", user.restaurantId);
          await fetchCategories(user.restaurantId);
        }
      } catch (err) {
        console.error("Error initializing categories:", err);
      }
    };
    initializeCategories();
  }, []);

  // Fetch categories
  const fetchCategories = async (restaurantId = null) => {
    setLoading(true);
    try {
      const data = restaurantId
        ? await categoryService.getByRestaurant(restaurantId)
        : await categoryService.getAll();
      setCategories(data || []);
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Add category
  const addCategory = async (categoryData) => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, message: "User not authenticated" };
      }

      const payload = {
        ...categoryData,
        restaurantId: currentUser.restaurantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await categoryService.create(payload);
      if (result) {
        await fetchCategories(currentUser.restaurantId);
        return { success: true, data: result };
      }
      return { success: false, message: "Failed to create category" };
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false, message: error.message };
    }
  };

  // Update category
  const updateCategory = async (categoryId, categoryData) => {
    try {
      const currentUser = await authService.getCurrentUser();
      const payload = {
        ...categoryData,
        updated_at: new Date().toISOString(),
      };

      const result = await categoryService.update(categoryId, payload);
      if (result) {
        await fetchCategories(currentUser?.restaurantId);
        return { success: true, data: result };
      }
      return { success: false, message: "Failed to update category" };
    } catch (error) {
      console.error("Error updating category:", error);
      return { success: false, message: error.message };
    }
  };

  // Delete category
  const deleteCategory = async (categoryId) => {
    try {
      const currentUser = await authService.getCurrentUser();
      const result = await categoryService.delete(categoryId);
      if (result) {
        await fetchCategories(currentUser?.restaurantId);
        return { success: true };
      }
      return { success: false, message: "Failed to delete category" };
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, message: error.message };
    }
  };

  const contextValue = {
    categories,
    setCategories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loading,
  };

  return React.createElement(
    CategoryContext.Provider,
    { value: contextValue },
    children
  );
};
