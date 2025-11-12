import { useMemo } from "react";

/**
 * Custom hook for filtering and sorting orders
 * Splits orders into current and history based on status
 * Shared between web and mobile customer apps
 */
export const useOrderFiltering = (orders) => {
    /**
     * Get current orders (in progress)
     */
    const currentOrders = useMemo(() => {
        const activeStatuses = [
            "pending",
            "paid",
            "confirmed",
            "preparing",
            "ready",
            "delivering",
            "picking_up",
            "picked_up",
        ];

        return orders
            .filter((order) => activeStatuses.includes(order.status))
            .sort(
                (a, b) =>
                    new Date(b.created_at || b.createdAt) -
                    new Date(a.created_at || a.createdAt)
            );
    }, [orders]);

    /**
     * Get order history (completed/cancelled)
     */
    const historyOrders = useMemo(() => {
        const completedStatuses = ["delivered", "cancelled", "rejected"];

        return orders
            .filter((order) => completedStatuses.includes(order.status))
            .sort(
                (a, b) =>
                    new Date(b.created_at || b.createdAt) -
                    new Date(a.created_at || a.createdAt)
            );
    }, [orders]);

    /**
     * Get orders by specific status
     */
    const getOrdersByStatus = (status) => {
        return orders.filter((order) => order.status === status);
    };

    /**
     * Count orders by status
     */
    const countByStatus = useMemo(() => {
        const counts = {};
        orders.forEach((order) => {
            counts[order.status] = (counts[order.status] || 0) + 1;
        });
        return counts;
    }, [orders]);

    return {
        currentOrders,
        historyOrders,
        getOrdersByStatus,
        countByStatus,
    };
};
