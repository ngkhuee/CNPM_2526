// src/Context/CategoryContext.js
import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_URL = "http://localhost:4000";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Fetch categories for specific restaurant
  const fetchCategories = async (restaurantId = null) => {
    setLoading(true);
    try {
      let url = `${API_URL}/categories`;
      if (restaurantId) {
        url += `?restaurantId=${restaurantId}`;
      }
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
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
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        toast.success("Category created successfully!");
        return { success: true, data: newCategory };
      } else {
        toast.error("Failed to create category");
        return { success: false };
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error creating category");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updated = await response.json();
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? updated : cat))
        );
        toast.success("Category updated successfully!");
        return { success: true, data: updated };
      } else {
        toast.error("Failed to update category");
        return { success: false };
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        toast.success("Category deleted successfully!");
        return { success: true };
      } else {
        toast.error("Failed to delete category");
        return { success: false };
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
      return { success: false };
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
