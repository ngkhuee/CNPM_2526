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
        today.setHours(23, 59, 59, 999); // End of today
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

        startDate.setHours(0, 0, 0, 0); // Start of the day
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
        console.log("=== fetchRevenueChart START ===");
        console.log("currentRestaurant:", currentRestaurant);
        console.log("currentRestaurant?.id:", currentRestaurant?.id);
        if (!currentRestaurant?.id) {
            console.warn("useDashboardCharts - No restaurant ID available");
            return;
        }

        try {
            const { startDate, endDate } = getDateRange(dateRange);
            console.log("Date range:", startDate, "to", endDate);

            const queryUrl = `${API_BASE_URL}/orders?restaurant_id=${currentRestaurant.id}`;
            console.log("Fetching from URL:", queryUrl);

            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await fetch(queryUrl, { headers });
            console.log("Response status:", response.status); const orders = await response.json();
            console.log("=== Orders fetched ===");
            console.log("Orders response type:", typeof orders);
            console.log("Is array:", Array.isArray(orders));
            console.log("Orders response:", orders);

            // Ensure orders is an array
            if (!Array.isArray(orders)) {
                console.warn("Orders response is not an array, received:", orders);
                setChartData((prev) => ({
                    ...prev,
                    revenueChart: [],
                }));
                return;
            }

            console.log("Total orders:", orders.length);
            if (orders.length > 0) {
                console.log("First order:", JSON.stringify(orders[0], null, 2));
            } else {
                console.warn("No orders found for restaurant:", currentRestaurant.id);
            }

            // Helper to format date as YYYY-MM-DD using local time (not UTC)
            const formatDateLocal = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            // Filter orders by date range
            const filteredOrders = orders.filter((order) => {
                const orderDate = new Date(order.updated_at || order.created_at);
                return orderDate >= startDate && orderDate <= endDate;
            });
            console.log("fetchRevenueChart - Filtered orders:", filteredOrders.length);

            // Group by date
            const dateMap = {};
            let daysToShow = 7;

            if (dateRange === "month") {
                daysToShow = 30;
            } else if (dateRange === "week") {
                daysToShow = 7;
            }

            for (let i = 0; i < daysToShow; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                const dateKey = formatDateLocal(date);
                dateMap[dateKey] = 0;
            }

            console.log("fetchRevenueChart - dateMap keys:", Object.keys(dateMap));

            filteredOrders.forEach((order) => {
                const orderDate = new Date(order.updated_at || order.created_at);
                const dateKey = formatDateLocal(orderDate);
                const amount = order.total_amount || 0;
                console.log("fetchRevenueChart - Order id:", order.id, "orderDate:", orderDate.toString(), "dateKey:", dateKey, "inMap:", dateMap.hasOwnProperty(dateKey), "amount:", amount);
                if (dateMap.hasOwnProperty(dateKey)) {
                    dateMap[dateKey] += amount;
                }
            });

            const labels = generateDateLabels(dateRange, startDate, endDate);
            const data = Object.values(dateMap).slice(-labels.length);

            console.log("fetchRevenueChart - Chart data:", data);

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
    }, [currentRestaurant?.id, dateRange, getDateRange, generateDateLabels, API_BASE_URL]);    /**
     * Fetch and aggregate order data
     */
    const fetchOrderChart = useCallback(async () => {
        if (!currentRestaurant?.id) {
            console.warn("useDashboardCharts - No restaurant ID available for orders");
            return;
        }

        try {
            const { startDate, endDate } = getDateRange(dateRange);
            console.log("fetchOrderChart - Date range:", startDate, "to", endDate);

            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await fetch(
                `${API_BASE_URL}/orders?restaurant_id=${currentRestaurant.id}`,
                { headers }
            );
            const orders = await response.json();
            console.log("fetchOrderChart - Fetched orders type:", typeof orders);
            console.log("fetchOrderChart - Is array:", Array.isArray(orders));

            // Ensure orders is an array
            if (!Array.isArray(orders)) {
                console.warn("Orders response is not an array, received:", orders);
                setChartData((prev) => ({
                    ...prev,
                    orderChart: [],
                }));
                return;
            }

            console.log("fetchOrderChart - Fetched orders:", orders.length);
            if (orders.length > 0) {
                console.log("fetchOrderChart - First order sample:", orders[0]);
            }

            // Helper to format date as YYYY-MM-DD using local time (not UTC)
            const formatDateLocal = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            // Filter orders by date range
            const filteredOrders = orders.filter((order) => {
                const orderDate = new Date(order.updated_at || order.created_at);
                return orderDate >= startDate && orderDate <= endDate;
            });

            console.log("fetchOrderChart - Filtered orders:", filteredOrders.length);

            // Group by date
            const dateMap = {};
            let daysToShow = 7;

            if (dateRange === "month") {
                daysToShow = 30;
            } else if (dateRange === "week") {
                daysToShow = 7;
            }

            for (let i = 0; i < daysToShow; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                const dateKey = formatDateLocal(date);
                dateMap[dateKey] = 0;
            }

            console.log("fetchOrderChart - dateMap keys:", Object.keys(dateMap));

            filteredOrders.forEach((order) => {
                const orderDate = new Date(order.created_at);
                const dateKey = formatDateLocal(orderDate);
                console.log("fetchOrderChart - Order id:", order.id, "orderDate:", orderDate.toString(), "dateKey:", dateKey, "inMap:", dateMap.hasOwnProperty(dateKey));
                if (dateMap.hasOwnProperty(dateKey)) {
                    dateMap[dateKey] += 1;
                }
            });

            const labels = generateDateLabels(dateRange, startDate, endDate);
            const data = Object.values(dateMap).slice(-labels.length);

            console.log("fetchOrderChart - Chart data:", data);

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
            console.log("fetchRevenueByProduct - Date range:", startDate, "to", endDate);

            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await fetch(
                `${API_BASE_URL}/orders?restaurant_id=${currentRestaurant.id}`,
                { headers }
            );
            const orders = await response.json();
            console.log("fetchRevenueByProduct - Fetched orders type:", typeof orders);
            console.log("fetchRevenueByProduct - Is array:", Array.isArray(orders));

            // Ensure orders is an array
            if (!Array.isArray(orders)) {
                console.warn("Orders response is not an array, received:", orders);
                setChartData((prev) => ({
                    ...prev,
                    revenueByProduct: [],
                }));
                return;
            }

            console.log("fetchRevenueByProduct - Total orders fetched:", orders.length);

            // Helper to format date as YYYY-MM-DD using local time (not UTC)
            const formatDateLocal = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            // Filter by selected date range
            const filteredOrders = orders.filter((order) => {
                const orderDate = new Date(order.updated_at || order.created_at);
                return orderDate >= startDate && orderDate <= endDate;
            });
            console.log("fetchRevenueByProduct - Filtered orders:", filteredOrders.length);

            // Group by product
            const productMap = {};
            filteredOrders.forEach((order) => {
                console.log("fetchRevenueByProduct - Processing order:", order.id, "items:", order.items?.length || 0);
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item) => {
                        const productName = item.name || `Product ${item.id}`;
                        if (!productMap[productName]) {
                            productMap[productName] = { count: 0, revenue: 0 };
                        }
                        const qty = item.quantity || 1;
                        productMap[productName].count += qty;
                        // Use subtotal if available, otherwise unit_price * quantity
                        const rev = (item.subtotal || (item.unit_price || 0) * qty);
                        productMap[productName].revenue += rev;
                        console.log("fetchRevenueByProduct - Item:", productName, "qty:", qty, "revenue:", rev);
                    });
                }
            });

            console.log("fetchRevenueByProduct - productMap:", productMap);

            // Sort by revenue
            const sorted = Object.entries(productMap)
                .map(([name, data]) => ({
                    name,
                    revenue: data.revenue,
                    quantity: data.count,
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            console.log("fetchRevenueByProduct - Final sorted data:", sorted);

            setChartData((prev) => ({
                ...prev,
                revenueByProduct: sorted,
            }));
        } catch (err) {
            console.error("Error fetching revenue by product:", err);
            setError("Failed to load product data");
        }
    }, [currentRestaurant?.id, dateRange, getDateRange, API_BASE_URL]);    /**
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
