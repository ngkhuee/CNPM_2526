import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const PromotionContext = createContext();

export const PromotionProvider = ({ children }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:4000";

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Fetch all promotions from backend
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/promotions`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  // Add new promotion
  const addPromotion = async (promotionData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/promotions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(promotionData),
      });

      if (response.ok) {
        const newPromotion = await response.json();
        setPromotions((prev) => [...prev, newPromotion]);
        toast.success("Promotion created successfully!");
        return { success: true, data: newPromotion };
      } else {
        toast.error("Failed to create promotion");
        return { success: false };
      }
    } catch (error) {
      console.error("Error adding promotion:", error);
      toast.error("Error creating promotion");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Update promotion
  const updatePromotion = async (id, updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/promotions/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updated = await response.json();
        setPromotions((prev) =>
          prev.map((promo) => (promo.id === id ? updated : promo))
        );
        toast.success("Promotion updated successfully!");
        return { success: true, data: updated };
      } else {
        toast.error("Failed to update promotion");
        return { success: false };
      }
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Error updating promotion");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Delete promotion
  const deletePromotion = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/promotions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setPromotions((prev) => prev.filter((promo) => promo.id !== id));
        toast.success("Promotion deleted successfully!");
        return { success: true };
      } else {
        toast.error("Failed to delete promotion");
        return { success: false };
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error deleting promotion");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Get promotions for a specific restaurant
  const getRestaurantPromotions = (restaurantId) => {
    return promotions.filter((promo) => {
      // Admin promotions (no restaurantId or empty applicableRestaurants)
      if (!promo.restaurantId) {
        return false; // Don't show admin promotions in restaurant panel
      }
      // Restaurant-specific promotions
      return promo.restaurantId === restaurantId;
    });
  };

  // Get all active promotions for customer (admin + specific restaurant)
  const getApplicablePromotions = (restaurantId) => {
    return promotions.filter((promo) => {
      if (promo.status !== "active") return false;

      // Admin promotions (apply to all)
      if (!promo.restaurantId || promo.applicableRestaurants?.length === 0) {
        return true;
      }

      // Restaurant-specific promotions
      return promo.restaurantId === restaurantId;
    });
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const contextValue = {
    promotions,
    loading,
    fetchPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    getRestaurantPromotions,
    getApplicablePromotions,
  };

  return React.createElement(
    PromotionContext.Provider,
    { value: contextValue },
    children
  );
};
