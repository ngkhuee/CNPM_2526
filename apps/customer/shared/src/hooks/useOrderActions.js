import { useCallback, useState } from "react";
import { orderTrackingService, droneService, orderValidationService } from "shared-services";

/**
 * Custom hook for managing order actions
 * Handles order status updates, cancellation, and reviews
 * Shared between web and mobile customer apps
 */
export const useOrderActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Cancel order and release drone if assigned
     */
    const cancelOrder = useCallback(async (order, reason = "") => {
        if (!order) {
            return { success: false, message: "Order not found" };
        }

        if (!orderValidationService.canCancelOrder(order)) {
            return {
                success: false,
                message: "This order cannot be cancelled at this stage",
            };
        }

        try {
            setLoading(true);
            setError(null);
            console.log("🚫 Cancelling order:", order.id);

            // Update order status to cancelled
            const updatedOrder = await orderTrackingService.cancelOrder(order.id, reason);

            // If drone was assigned, release it
            if (order.droneId || order.drone_id) {
                const droneId = order.droneId || order.drone_id;
                console.log("🚁 Releasing drone:", droneId);
                try {
                    await droneService.updateDrone(droneId, {
                        status: "available",
                        assigned_order_id: null,
                    });
                    console.log("Drone released successfully");
                } catch (error) {
                    console.warn("⚠️ Could not release drone:", error);
                    // Continue anyway - order is cancelled
                }
            }

            return {
                success: true,
                message: "Order cancelled successfully!",
                order: updatedOrder,
            };
        } catch (error) {
            console.error("Error cancelling order:", error);
            setError(error.message);
            return {
                success: false,
                message: "Failed to cancel order. Please try again.",
            };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Check if order can be reviewed
     */
    const canReviewOrder = useCallback((order) => {
        return order && orderValidationService.canReviewOrder(order.status);
    }, []);

    /**
     * Check if order can be cancelled
     */
    const canCancelOrder = useCallback((order) => {
        return orderValidationService.canCancelOrder(order);
    }, []);

    /**
     * Get order status label
     */
    const getStatusLabel = useCallback((status) => {
        return orderValidationService.getStatusLabel(status);
    }, []);

    /**
     * Get status badge style
     */
    const getStatusBadgeStyle = useCallback((status) => {
        return orderValidationService.getStatusBadgeStyle(status);
    }, []);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        cancelOrder,
        canReviewOrder,
        canCancelOrder,
        getStatusLabel,
        getStatusBadgeStyle,
        clearError,
    };
};
