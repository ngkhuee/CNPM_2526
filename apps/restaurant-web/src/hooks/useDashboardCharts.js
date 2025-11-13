import { useState, useContext, useCallback } from "react";
import { RestaurantContext } from "../Context/RestaurantContext";

/**
 * Hook for revenue and order analytics
 * Handles date filtering, data aggregation, chart data generation
 */
export const useDashboardCharts = () => {
    const { currentRestaurant } = useContext(RestaurantContext);
    const [chartData, setChartData] = useState({
        revenueChart: [],
        orderChart: [],
        revenueByProduct: [],
    });
    const [dateRange, setDateRange] = useState("7days");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    /**
     * Get date range for filtering
     */
    const getDateRange = useCallback((range) => {
        const today = new Date();
        let startDate;

        switch (range) {
            case "7days":
                startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case "week":
                const dayOfWeek = today.getDay();
                startDate = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return { startDate, endDate: today };
    }, []);

    /**
     * Generate date labels based on range type
     */
    const generateDateLabels = useCallback((range, startDate, endDate) => {
        const labels = [];

        if (range === "7days") {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
                labels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
            }
        } else if (range === "month") {
            const year = startDate.getFullYear();
            const month = startDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                if (day % 5 === 0 || day === daysInMonth) {
                    labels.push(`${month + 1}/${day}`);
                }
            }
        } else if (range === "week") {
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                labels.push(days[date.getDay()]);
            }
        }

        return labels;
    }, []);

    /**
     * Fetch and aggregate revenue data
     */
    const fetchRevenueChart = useCallback(async () => {
        if (!currentRestaurant?.id) return;

        try {
            const { startDate, endDate } = getDateRange(dateRange);
            const response = await fetch(
                `${API_BASE_URL}/orders?restaurant_id=${currentRestaurant.id}&status=delivered`
            );
            const orders = await response.json();

            // Filter orders by date range
            const filteredOrders = orders.filter((order) => {
                const orderDate = new Date(order.completed_at);
                return orderDate >= startDate && orderDate <= endDate;
            });

            // Group by date
            const dateMap = {};
            let daysToShow = 7;

            if (dateRange === "month") {
                daysToShow = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth() + 1,
                    0
                ).getDate();
            } else if (dateRange === "week") {
                daysToShow = 7;
            }

            for (let i = 0; i < daysToShow; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                const dateKey = date.toISOString().split("T")[0];
                dateMap[dateKey] = 0;
            }

            filteredOrders.forEach((order) => {
                const dateKey = new Date(order.completed_at)
                    .toISOString()
                    .split("T")[0];
                if (dateMap.hasOwnProperty(dateKey)) {
                    dateMap[dateKey] += order.total_amount || 0;
                }
            });

            const labels = generateDateLabels(dateRange, startDate, endDate);
            const data = Object.values(dateMap).slice(-labels.length);

            setChartData((prev) => ({
                ...prev,
                revenueChart: data.map((value, idx) => ({
                    name: labels[idx],
                    value: Math.round(value),
                })),
            }));
        } catch (err) {
            console.error("Error fetching revenue chart:", err);
            setError("Failed to load revenue data");
        }
    }, [currentRestaurant?.id, dateRange, getDateRange, generateDateLabels, API_BASE_URL]);

    /**
     * Fetch and aggregate order data
     */
    const fetchOrderChart = useCallback(async () => {
        if (!currentRestaurant?.id) return;

        try {
            const { startDate, endDate } = getDateRange(dateRange);
            const response = await fetch(
                `${API_BASE_URL}/orders?restaurant_id=${currentRestaurant.id}`
            );
            const orders = await response.json();

            // Filter orders by date range
            const filteredOrders = orders.filter((order) => {
                const orderDate = new Date(order.created_at);
                return orderDate >= startDate && orderDate <= endDate;
            });

            // Group by date
            const dateMap = {};
            let daysToShow = 7;

            if (dateRange === "month") {
                daysToShow = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth() + 1,
                    0
                ).getDate();
            } else if (dateRange === "week") {
                daysToShow = 7;
            }

            for (let i = 0; i < daysToShow; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                const dateKey = date.toISOString().split("T")[0];
                dateMap[dateKey] = 0;
            }

            filteredOrders.forEach((order) => {
                const dateKey = new Date(order.created_at)
                    .toISOString()
                    .split("T")[0];
                if (dateMap.hasOwnProperty(dateKey)) {
                    dateMap[dateKey] += 1;
                }
            });

            const labels = generateDateLabels(dateRange, startDate, endDate);
            const data = Object.values(dateMap).slice(-labels.length);

            setChartData((prev) => ({
                ...prev,
                orderChart: data.map((value, idx) => ({
                    name: labels[idx],
                    value,
                })),
            }));
        } catch (err) {
            console.error("Error fetching order chart:", err);
            setError("Failed to load order data");
        }
    }, [currentRestaurant?.id, dateRange, getDateRange, generateDateLabels, API_BASE_URL]);

    /**
     * Fetch revenue by product
     */
    const fetchRevenueByProduct = useCallback(async () => {
        if (!currentRestaurant?.id) return;

        try {
            const { startDate, endDate } = getDateRange(dateRange);
            const response = await fetch(
                `${API_BASE_URL}/orders?restaurant_id=${currentRestaurant.id}&status=delivered`
            );
            const orders = await response.json();

            // Filter by date range
            const filteredOrders = orders.filter((order) => {
                const orderDate = new Date(order.completed_at);
                return orderDate >= startDate && orderDate <= endDate;
            });

            // Group by product
            const productMap = {};
            filteredOrders.forEach((order) => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item) => {
                        const productName = item.name || `Product ${item.id}`;
                        if (!productMap[productName]) {
                            productMap[productName] = { count: 0, revenue: 0 };
                        }
                        productMap[productName].count += item.quantity || 1;
                        productMap[productName].revenue += (item.price || 0) * (item.quantity || 1);
                    });
                }
            });

            // Sort by revenue
            const sorted = Object.entries(productMap)
                .map(([name, data]) => ({
                    name,
                    revenue: data.revenue,
                    quantity: data.count,
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            setChartData((prev) => ({
                ...prev,
                revenueByProduct: sorted,
            }));
        } catch (err) {
            console.error("Error fetching revenue by product:", err);
            setError("Failed to load product data");
        }
    }, [currentRestaurant?.id, dateRange, getDateRange, API_BASE_URL]);

    /**
     * Load all chart data
     */
    const loadChartData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchRevenueChart(),
                fetchOrderChart(),
                fetchRevenueByProduct(),
            ]);
        } catch (err) {
            console.error("Error loading charts:", err);
            setError("Failed to load chart data");
        } finally {
            setLoading(false);
        }
    }, [fetchRevenueChart, fetchOrderChart, fetchRevenueByProduct]);

    return {
        chartData,
        dateRange,
        setDateRange,
        loading,
        error,
        loadChartData,
    };
};
