import { useState, useEffect } from "react";
import { orderService } from "shared-services";

/**
 * Hook to check if user has purchased a specific food item
 * @param {string} userId - Current user ID
 * @param {string} foodId - Food ID to check
 * @returns {boolean} - True if user has purchased this food in a delivered order
 */
export const useUserOrderHistory = (userId, foodId) => {
    const [hasPurchased, setHasPurchased] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId || !foodId) {
            setLoading(false);
            return;
        }

        checkPurchaseHistory();
    }, [userId, foodId]);

    const checkPurchaseHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get all orders for this user
            const orders = await orderService.getAll();

            // Filter only delivered orders (completed orders)
            const completedOrders = orders.filter(
                (order) =>
                    order.user_id === userId &&
                    order.status === "delivered"
            );

            // Check if any completed order contains this food
            const purchasedFoodIds = new Set();
            completedOrders.forEach((order) => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item) => {
                        purchasedFoodIds.add(item.food_id || item.foodId);
                    });
                }
            });

            setHasPurchased(purchasedFoodIds.has(foodId));
        } catch (err) {
            console.error("Error checking purchase history:", err);
            setError(err.message);
            setHasPurchased(false);
        } finally {
            setLoading(false);
        }
    };

    return { hasPurchased, loading, error };
};

export default useUserOrderHistory;
