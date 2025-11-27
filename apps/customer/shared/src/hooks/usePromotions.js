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
        const data = await promotionService.getAll();
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

  // Validate promotion code
  const validatePromotion = (code, orderTotal, restaurantId) => {
    const promo = promotions.find(
      (p) =>
        p.code?.toUpperCase() === code.toUpperCase() && p.status === "active"
    );

    if (!promo) {
      return { valid: false, message: "This promotion is invalid" };
    }

    // Check if promotion applies to this restaurant
    // Note: promotionService maps restaurant_id to restaurantId (camelCase)
    if (promo.scope === "restaurant" && promo.restaurantId !== restaurantId) {
      return { valid: false, message: "This promotion does not apply to this restaurant" };
    }

    // Check minOrderValue (camelCase from promotionService mapping)
    const minOrderValue = promo.minOrderValue || promo.min_order_value || 0;
    if (minOrderValue && orderTotal < minOrderValue) {
      return {
        valid: false,
        message: `Minimum order value ₫${minOrderValue.toLocaleString('vi-VN')}`,
      };
    }

    // Check if promotion is within date range
    // Support both camelCase (startDate/endDate) and snake_case (start_date/end_date)
    const now = new Date();
    const startDate = new Date(promo.startDate || promo.start_date);
    const endDate = new Date(promo.endDate || promo.end_date);

    if (now < startDate) {
      return { valid: false, message: "Promotion has not started yet" };
    }

    if (now > endDate) {
      return { valid: false, message: "Promotion has expired" };
    }

    return { valid: true, promotion: promo };
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
