/**
 * Tracking Logic Hook
 * Handles order tracking business logic
 * Shared between web and mobile customer apps
 */

import { useState, useEffect, useCallback } from "react";
import { orderTrackingService, droneProgressService, orderService } from "shared-services";

export const useTrackingLogic = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [droneProgress, setDroneProgress] = useState(0);
    const [arrivalTime, setArrivalTime] = useState(null);
    const [droneArrived, setDroneArrived] = useState(false);

    /**
     * Fetch order details
     */
    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            setError(null);

            // Use orderService instead of orderTrackingService to get enriched order with restaurant data
            const data = await orderService.getById(orderId);

            setOrder(data);

            // Calculate progress based on order status
            const progress = droneProgressService.calculateDroneProgress(data);
            setDroneProgress(progress);

            // Check if drone has arrived
            if (
                data.status === "delivering" &&
                data.current_gps &&
                data.dropoff_gps
            ) {
                const arrived = droneProgressService.hasDroneArrived(
                    data.current_gps,
                    data.dropoff_gps
                );
                setDroneArrived(arrived);

                if (arrived && !arrivalTime) {
                    setArrivalTime(Date.now());
                }
            }
        } catch (err) {
            console.error("Error fetching order:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [orderId, arrivalTime]);

    /**
     * Confirm delivery
     */
    const confirmDelivery = useCallback(async () => {
        if (confirming || !order) return;

        try {
            setConfirming(true);
            const updated = await orderTrackingService.confirmDelivery(order.id);
            setOrder(updated);
            setDroneProgress(1);
            setDroneArrived(false);
            setArrivalTime(null);
            console.log("Delivery confirmed successfully");
            return { success: true };
        } catch (error) {
            console.error("Error confirming delivery:", error);
            return { success: false, error: error.message };
        } finally {
            setConfirming(false);
        }
    }, [order, confirming]);

    /**
     * Cancel order
     */
    const cancelOrder = useCallback(
        async (reason = "") => {
            if (!order) return;

            try {
                setConfirming(true);
                const updated = await orderTrackingService.cancelOrder(order.id, reason);
                setOrder(updated);
                console.log("Order cancelled successfully");
                return { success: true };
            } catch (error) {
                console.error("Error cancelling order:", error);
                return { success: false, error: error.message };
            } finally {
                setConfirming(false);
            }
        },
        [order]
    );

    /**
     * Refresh tracking data
     */
    const refreshTracking = useCallback(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // Fetch order on mount or when orderId changes
    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // Auto-confirm delivery after 5 minutes of arrival
    useEffect(() => {
        if (!arrivalTime || !droneArrived || order?.status === "delivered") return;

        const timeout = setTimeout(() => {
            console.log("Auto-confirming delivery after 5 minutes...");
            confirmDelivery();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearTimeout(timeout);
    }, [arrivalTime, droneArrived, order?.status, confirmDelivery]);

    return {
        order,
        loading,
        error,
        confirming,
        droneProgress,
        arrivalTime,
        droneArrived,
        fetchOrderDetails,
        confirmDelivery,
        cancelOrder,
        refreshTracking,
    };
};
