import React, { createContext, useState, useEffect } from "react";
import { promotionService, authService } from "shared-services";

export const PromotionContext = createContext();

export const PromotionProvider = ({ children }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all promotions from backend on mount
  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await promotionService.getAll();
      setPromotions(data || []);
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setPromotions([]);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get promotions for current restaurant
  const getRestaurantPromotions = (restaurantId) => {
    if (!restaurantId) return [];
    return promotions.filter((p) => p.restaurantId === restaurantId || p.applicable_restaurants?.includes(restaurantId));
  };

  // Add promotion
  const addPromotion = async (promoData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, message: "User not authenticated" };
      }

      const payload = {
        ...promoData,
        restaurantId: currentUser.restaurantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await promotionService.create(payload);
      if (result) {
        await fetchPromotions();
        return { success: true, data: result };
      }
      return { success: false, message: "Failed to create promotion" };
    } catch (error) {
      console.error("Error adding promotion:", error);
      return { success: false, message: error.message };
    }
  };

  // Update promotion
  const updatePromotion = async (promoId, promoData) => {
    try {
      const payload = {
        ...promoData,
        updated_at: new Date().toISOString(),
      };

      const result = await promotionService.update(promoId, payload);
      if (result) {
        await fetchPromotions();
        return { success: true, data: result };
      }
      return { success: false, message: "Failed to update promotion" };
    } catch (error) {
      console.error("Error updating promotion:", error);
      return { success: false, message: error.message };
    }
  };

  // Delete promotion
  const deletePromotion = async (promoId) => {
    try {
      const result = await promotionService.delete(promoId);
      if (result) {
        await fetchPromotions();
        return { success: true };
      }
      return { success: false, message: "Failed to delete promotion" };
    } catch (error) {
      console.error("Error deleting promotion:", error);
      return { success: false, message: error.message };
    }
  };

  const contextValue = {
    promotions,
    setPromotions,
    fetchPromotions,
    getRestaurantPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    loading,
  };

  return React.createElement(
    PromotionContext.Provider,
    { value: contextValue },
    children
  );
};
