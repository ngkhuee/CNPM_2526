import { useState, useEffect, useCallback } from "react";
import { orderService } from "shared-services";

export const useOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [autoRefresh, setAutoRefresh] = useState(true);
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

    // Auto-refresh every 5 seconds
    useEffect(() => {
        if (!autoRefresh) return;

        const intervalId = setInterval(() => {
            console.log("Auto-refreshing orders...");
            fetchOrders(true);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [autoRefresh, fetchOrders]);

    const handleManualRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    }, [fetchOrders]);

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            pending: "status-pending",
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
        return orders.filter((order) => order.status === filter);
    }, [orders, filter]);

    const getStatusCount = useCallback((status) => {
        if (status === "all") return orders.length;
        return orders.filter((o) => o.status === status).length;
    }, [orders]);

    return {
        orders,
        loading,
        filter,
        setFilter,
        autoRefresh,
        setAutoRefresh,
        refreshing,
        handleManualRefresh,
        getStatusBadgeClass,
        getFilteredOrders,
        getStatusCount,
    };
};
