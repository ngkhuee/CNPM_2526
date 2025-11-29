import { useState, useEffect } from "react";
import { promotionService } from "shared-services";

/**
 * Custom hook for managing promotions in customer app
 * Fetches all promotions and filters applicable ones for restaurants
 */
export const usePromotions = (restaurantId = null) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
        // Filter by time for customer view
        const data = await promotionService.getAll("active", true);
        if (isActive) {
          setPromotions(data);
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching promotions:", err);
          setError(err.message || "Failed to fetch promotions");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchPromotions();

    return () => {
      isActive = false;
    };
  }, []);

  // Get promotions applicable to a specific restaurant
  const getApplicablePromotions = (targetRestaurantId) => {
    const restId = targetRestaurantId || restaurantId;
    if (!restId) return promotions.filter((p) => p.status === "active");

    return promotions.filter((promo) => {
      if (promo.status !== "active") return false;

      // Note: promotionService maps restaurant_id to restaurantId (camelCase)
      const promoRestaurantId = promo.restaurantId || promo.restaurant_id;

      // Admin/system promotions (scope = "system", restaurantId = null) - apply to all restaurants
      if (promo.scope === "system" && !promoRestaurantId) {
        return true;
      }

      // Restaurant-specific promotions (scope = "restaurant") - only for that restaurant
      if (promo.scope === "restaurant" && promoRestaurantId === restId) {
        return true;
      }

      return false;
    });
  };

  // Validate promotion code using promotionService
  const validatePromotion = async (code, orderTotal, restaurantId) => {
    try {
      // Use promotionService.validate which includes time range check
      const result = await promotionService.validate(code, orderTotal);

      if (!result.valid) {
        return result;
      }

      const promo = result.promotion;

      // Additional check: if promotion applies to this restaurant
      if (promo.scope === "restaurant" && promo.restaurantId !== restaurantId) {
        return {
          valid: false,
          message: "Mã khuyến mãi không áp dụng cho nhà hàng này",
          promotion: null
        };
      }

      return result;
    } catch (error) {
      console.error("Error validating promotion:", error);
      return {
        valid: false,
        message: "Lỗi khi kiểm tra mã khuyến mãi",
        promotion: null
      };
    }
  };

  // Calculate discount amount
  const calculateDiscount = (promo, subtotal) => {
    if (!promo) return 0;

    let discount = 0;
    if (promo.type === "percentage") {
      discount = subtotal * (promo.value / 100);
      // Apply max discount if set (support both camelCase and snake_case)
      const maxDiscount = promo.maxDiscount || promo.max_discount;
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (promo.type === "fixed" || promo.type === "fixed_amount") {
      discount = promo.value;
    }

    return Math.min(discount, subtotal); // Discount cannot exceed subtotal
  };

  return {
    promotions,
    loading,
    error,
    getApplicablePromotions,
    validatePromotion,
    calculateDiscount,
  };
};
