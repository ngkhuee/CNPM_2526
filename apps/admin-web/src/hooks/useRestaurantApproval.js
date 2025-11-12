import { useCallback } from "react";
import { restaurantService, authService } from "shared-services";

/**
 * Hook for restaurant approval workflow (approve, block, unblock, delete)
 * Used in Admin Partners page
 */
export const useRestaurantApproval = (onSuccess) => {
    // Approve pending restaurant
    const handleApprove = useCallback(
        async (restaurantId, restaurant) => {
            try {
                // Update restaurant status
                const result = await restaurantService.update(restaurantId, {
                    status: "active",
                    isOpen: true,
                });

                if (result) {
                    // Also update owner user status if owner_id exists
                    if (restaurant?.owner_id) {
                        try {
                            await authService.updateUserStatus(restaurant.owner_id, "active");
                        } catch (err) {
                            console.error("Error updating user status:", err);
                        }
                    }

                    onSuccess?.();
                    return { success: true };
                }
            } catch (err) {
                console.error("Error approving restaurant:", err);
                return { success: false, message: err.message };
            }
        },
        [onSuccess]
    );

    // Block active restaurant
    const handleBlock = useCallback(
        async (restaurantId, restaurant) => {
            try {
                // Update restaurant status
                const result = await restaurantService.update(restaurantId, {
                    status: "blocked",
                    isOpen: false,
                });

                if (result) {
                    // Also update owner user status if owner_id exists
                    if (restaurant?.owner_id) {
                        try {
                            await authService.updateUserStatus(restaurant.owner_id, "blocked");
                        } catch (err) {
                            console.error("Error updating user status:", err);
                        }
                    }

                    onSuccess?.();
                    return { success: true };
                }
            } catch (err) {
                console.error("Error blocking restaurant:", err);
                return { success: false, message: err.message };
            }
        },
        [onSuccess]
    );

    // Unblock blocked restaurant
    const handleUnblock = useCallback(
        async (restaurantId, restaurant) => {
            try {
                // Update restaurant status
                const result = await restaurantService.update(restaurantId, {
                    status: "active",
                    isOpen: true,
                });

                if (result) {
                    // Also update owner user status if owner_id exists
                    if (restaurant?.owner_id) {
                        try {
                            await authService.updateUserStatus(restaurant.owner_id, "active");
                        } catch (err) {
                            console.error("Error updating user status:", err);
                        }
                    }

                    onSuccess?.();
                    return { success: true };
                }
            } catch (err) {
                console.error("Error unblocking restaurant:", err);
                return { success: false, message: err.message };
            }
        },
        [onSuccess]
    );

    // Delete restaurant
    const handleDelete = useCallback(
        async (restaurantId) => {
            try {
                await restaurantService.delete(restaurantId);
                onSuccess?.();
                return { success: true };
            } catch (err) {
                console.error("Error deleting restaurant:", err);
                return { success: false, message: err.message };
            }
        },
        [onSuccess]
    );

    return {
        handleApprove,
        handleBlock,
        handleUnblock,
        handleDelete,
    };
};
