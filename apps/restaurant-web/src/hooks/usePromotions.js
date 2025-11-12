import { useState, useEffect } from "react";
import { promotionService, authService } from "shared-services";
import { toast } from "react-toastify";

/**
 * Custom hook for managing restaurant promotions
 * Fetches promotions and provides CRUD operations
 */
export const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await promotionService.getAll();
      setPromotions(data);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError(err.message || "Failed to load promotions");
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Add new promotion
  const addPromotion = async (promotionData) => {
    try {
      setLoading(true);
      const newPromotion = await promotionService.create(promotionData);
      setPromotions((prev) => [...prev, newPromotion]);
      toast.success("Promotion created successfully!");
      return { success: true, data: newPromotion };
    } catch (err) {
      console.error("Error adding promotion:", err);
      toast.error("Error creating promotion");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update promotion
  const updatePromotion = async (id, updatedData) => {
    try {
      setLoading(true);
      const updated = await promotionService.update(id, updatedData);
      setPromotions((prev) =>
        prev.map((promo) => (promo.id === id ? updated : promo))
      );
      toast.success("Promotion updated successfully!");
      return { success: true, data: updated };
    } catch (err) {
      console.error("Error updating promotion:", err);
      toast.error("Error updating promotion");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete promotion
  const deletePromotion = async (id) => {
    try {
      setLoading(true);
      await promotionService.delete(id);
      setPromotions((prev) => prev.filter((promo) => promo.id !== id));
      toast.success("Promotion deleted successfully!");
      return { success: true };
    } catch (err) {
      console.error("Error deleting promotion:", err);
      toast.error("Error deleting promotion");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get promotions for specific restaurant
  const getRestaurantPromotions = (restaurantId) => {
    return promotions.filter((promo) => {
      // Only show restaurant-specific promotions (not admin promotions)
      return promo.restaurantId === restaurantId;
    });
  };

  // Get all active promotions applicable to a restaurant (admin + restaurant-specific)
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

  // Get current restaurant's promotions
  const getCurrentRestaurantPromotions = () => {
    const user = authService.getCurrentUser();
    if (!user || !user.restaurantId) {
      return [];
    }
    return getRestaurantPromotions(user.restaurantId);
  };

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    getRestaurantPromotions,
    getApplicablePromotions,
    getCurrentRestaurantPromotions,
  };
};
