import { useCallback } from "react";
import { orderService, droneService } from "shared-services";

/**
 * Custom hook for managing order actions
 * Handles order status updates, cancellation, and drone release
 * Shared between web and mobile customer apps
 */
export const useOrderActions = () => {
    /**
     * Cancel order and release drone if assigned
     */
    const cancelOrder = useCallback(async (order) => {
        // Check if order can be cancelled (only specific statuses)
        const cancellableStatuses = ["paid", "confirmed", "preparing"];
        if (!cancellableStatuses.includes(order.status)) {
            return {
                success: false,
                message: "This order cannot be cancelled at this stage",
            };
        }

        try {
            console.log("🚫 Cancelling order:", order.id);

            // Step 1: Update order status to cancelled
            await orderService.updateStatus(order.id, "cancelled");

            // Step 2: If drone was assigned, release it
            if (order.droneId || order.drone_id) {
                const droneId = order.droneId || order.drone_id;
                console.log("🚁 Releasing drone:", droneId);
                try {
                    await droneService.updateDrone(droneId, {
                        status: "available",
                        assigned_order_id: null,
                    });
                    console.log("✅ Drone released successfully");
                } catch (error) {
                    console.warn("⚠️ Could not release drone:", error);
                    // Continue anyway - order is cancelled
                }
            }

            return {
                success: true,
                message: "Order cancelled successfully!",
            };
        } catch (error) {
            console.error("Error cancelling order:", error);
            return {
                success: false,
                message: "Failed to cancel order. Please try again.",
            };
        }
    }, []);

    /**
     * Update order status
     */
    const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        try {
            const updatedOrder = await orderService.updateStatus(orderId, newStatus);
            return {
                success: true,
                order: updatedOrder,
            };
        } catch (error) {
            console.error("Error updating order status:", error);
            return {
                success: false,
                message: error.message,
            };
        }
    }, []);

    return {
        cancelOrder,
        updateOrderStatus,
    };
};
