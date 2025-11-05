// src/Context/CategoryContext.js
import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { categoryService } from "@api/services";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories for specific restaurant
  const fetchCategories = async (restaurantId = null) => {
    setLoading(true);
    try {
      const data = restaurantId
        ? await categoryService.getByRestaurant(restaurantId)
        : await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const addCategory = async (categoryData) => {
    setLoading(true);
    try {
      const newCategory = await categoryService.create(categoryData);
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Category created successfully!");
      return { success: true, data: newCategory };
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error creating category");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, updatedData) => {
    setLoading(true);
    try {
      const updated = await categoryService.update(id, updatedData);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat))
      );
      toast.success("Category updated successfully!");
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success("Category deleted successfully!");
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get category by ID
  const getCategoryById = (id) => {
    return categories.find((cat) => cat.id === id);
  };

  // Fetch categories on mount (with restaurantId from localStorage)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    // Only fetch if user has valid restaurantId and role
    if (
      user.role === "restaurant" &&
      user.restaurantId &&
      /^r\d+$/.test(user.restaurantId)
    ) {
      fetchCategories(user.restaurantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  const contextValue = {
    categories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    loading,
  };

  return React.createElement(
    CategoryContext.Provider,
    { value: contextValue },
    children
  );
};
