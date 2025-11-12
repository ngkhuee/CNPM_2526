/**
 * Helper functions for dashboard statistics calculations
 */

/**
 * Calculate revenue by restaurant from delivered orders
 * @param {Array} deliveredOrders - Filtered delivered orders
 * @param {Array} restaurants - List of active restaurants
 * @returns {Array} Top 10 restaurants by revenue
 */
export const calculateRevenueByRestaurant = (deliveredOrders, restaurants) => {
    const revenueMap = {};

    // Initialize all restaurants with 0 revenue
    restaurants.forEach((restaurant) => {
        revenueMap[restaurant.id] = {
            id: restaurant.id,
            name: restaurant.name,
            revenue: 0,
            orderCount: 0,
            image: restaurant.image,
        };
    });

    // Calculate revenue for each restaurant
    deliveredOrders.forEach((order) => {
        const restaurantId = order.restaurantId || order.restaurant_id;
        if (restaurantId && revenueMap[restaurantId]) {
            const amount = order.totalAmount || order.total_amount || 0;
            revenueMap[restaurantId].revenue += amount;
            revenueMap[restaurantId].orderCount += 1;
        }
    });

    // Convert to array and sort by revenue (highest first)
    return Object.values(revenueMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10 restaurants
};

/**
 * Generate chart data for last 7 days
 * @param {Array} orders - All orders
 * @param {Array} activeRestaurants - List of active restaurants
 * @returns {Array} Array of daily data with date, revenue, orders count
 */
export const generateLast7DaysData = (orders, activeRestaurants) => {
    const today = new Date();
    const last7Days = [];
    const activeRestaurantIds = activeRestaurants.map((r) => r.id);

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const dayOrders = orders.filter((order) => {
            // Only include orders from ACTIVE restaurants
            const restaurantId = order.restaurantId || order.restaurant_id;
            if (!activeRestaurantIds.includes(restaurantId)) {
                return false;
            }

            // Handle both createdAt and created_at fields from db.json
            const orderDateStr = order.created_at || order.createdAt;
            if (!orderDateStr) return false;

            try {
                const orderDate = new Date(orderDateStr);
                if (isNaN(orderDate.getTime())) return false; // Invalid date
                return orderDate.toISOString().split("T")[0] === dateStr;
            } catch (e) {
                return false;
            }
        });

        const dayRevenue = dayOrders
            .filter((o) => o.status === "delivered")
            .reduce(
                (sum, order) =>
                    sum +
                    (order.total_amount ||
                        order.totalAmount ||
                        order.total ||
                        order.amount ||
                        0),
                0
            );

        last7Days.push({
            date: dateStr,
            revenue: dayRevenue,
            orders: dayOrders.length,
        });
    }

    return last7Days;
};
