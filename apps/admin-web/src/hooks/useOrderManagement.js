import { useState, useEffect, useCallback } from "react";
import { orderService } from "shared-services";

export const useOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await orderService.getAll();
            console.log("Fetched orders:", response.length, "orders");
            setOrders(response || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleManualRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    }, [fetchOrders]);

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            pending: "status-pending",
            paid: "status-paid",
            confirmed: "status-confirmed",
            preparing: "status-preparing",
            ready: "status-ready",
            delivering: "status-delivering",
            delivered: "status-delivered",
            cancelled: "status-cancelled",
        };
        return statusMap[status] || "status-default";
    };

    const getFilteredOrders = useCallback(() => {
        if (filter === "all") return orders;
        if (filter === "delivering") {
            // Delivering = all except delivered, cancelled, and rejected
            return orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled" && order.status !== "rejected");
        }
        if (filter === "cancelled") {
            // Cancelled = both cancelled and rejected statuses
            return orders.filter((order) => order.status === "cancelled" || order.status === "rejected");
        }
        return orders.filter((order) => order.status === filter);
    }, [orders, filter]);

    const getStatusCount = useCallback((status) => {
        if (status === "all") return orders.length;
        if (status === "delivering") {
            // Delivering = all except delivered, cancelled, and rejected
            return orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "rejected").length;
        }
        if (status === "cancelled") {
            // Cancelled = both cancelled and rejected statuses
            return orders.filter((o) => o.status === "cancelled" || o.status === "rejected").length;
        }
        return orders.filter((o) => o.status === status).length;
    }, [orders]);

    return {
        orders,
        loading,
        filter,
        setFilter,
        refreshing,
        handleManualRefresh,
        getStatusBadgeClass,
        getFilteredOrders,
        getStatusCount,
    };
};
