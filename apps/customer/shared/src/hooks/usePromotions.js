import { useState, useEffect } from "react";
import { promotionService } from "@api/services";

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

      // Admin/global promotions (apply to all)
      if (!promo.restaurantId || promo.applicableRestaurants?.length === 0) {
        return true;
      }

      // Restaurant-specific promotions
      return (
        promo.restaurantId === restId ||
        promo.applicableRestaurants?.includes(restId)
      );
    });
  };

  // Validate promotion code
  const validatePromotion = (code, orderTotal) => {
    const promo = promotions.find(
      (p) =>
        p.code?.toUpperCase() === code.toUpperCase() && p.status === "active"
    );

    if (!promo) {
      return { valid: false, message: "Mã khuyến mãi không hợp lệ" };
    }

    if (promo.minOrderValue && orderTotal < promo.minOrderValue) {
      return {
        valid: false,
        message: `Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString()}₫`,
      };
    }

    // Check if promotion is within date range
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (now < startDate) {
      return { valid: false, message: "Khuyến mãi chưa bắt đầu" };
    }

    if (now > endDate) {
      return { valid: false, message: "Khuyến mãi đã hết hạn" };
    }

    return { valid: true, promotion: promo };
  };

  // Calculate discount amount
  const calculateDiscount = (promo, subtotal) => {
    if (!promo) return 0;

    let discount = 0;
    if (promo.type === "percentage") {
      discount = subtotal * (promo.value / 100);
      // Apply max discount if set
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else if (promo.type === "fixed") {
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
