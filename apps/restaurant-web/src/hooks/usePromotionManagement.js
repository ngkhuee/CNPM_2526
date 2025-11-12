import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { promotionService } from "shared-services";
import { PromotionContext } from "../Context/PromotionContext";

export const usePromotionManagement = () => {
    const { setPromotions, promotions } = useContext(PromotionContext);
    const [loading, setLoading] = useState(false);

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

    const getRestaurantPromotions = (restaurantId) => {
        return promotions.filter((promo) => {
            if (!promo.restaurantId) {
                return false;
            }
            return promo.restaurantId === restaurantId;
        });
    };

    const getApplicablePromotions = (restaurantId) => {
        return promotions.filter((promo) => {
            if (promo.status !== "active") return false;
            if (!promo.restaurantId || promo.applicableRestaurants?.length === 0) {
                return true;
            }
            return promo.restaurantId === restaurantId;
        });
    };

    return {
        addPromotion,
        updatePromotion,
        deletePromotion,
        getRestaurantPromotions,
        getApplicablePromotions,
        loading,
    };
};
