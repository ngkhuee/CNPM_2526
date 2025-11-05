import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { promotionService } from "@api/services";

export const PromotionContext = createContext();

export const PromotionProvider = ({ children }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all promotions from backend using promotionService
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await promotionService.getAll();
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
      const newPromotion = await promotionService.create(promotionData);
      setPromotions((prev) => [...prev, newPromotion]);
      toast.success("Promotion created successfully!");
      return { success: true, data: newPromotion };
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
      const updated = await promotionService.update(id, updatedData);
      setPromotions((prev) =>
        prev.map((promo) => (promo.id === id ? updated : promo))
      );
      toast.success("Promotion updated successfully!");
      return { success: true, data: updated };
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
      await promotionService.delete(id);
      setPromotions((prev) => prev.filter((promo) => promo.id !== id));
      toast.success("Promotion deleted successfully!");
      return { success: true };
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
