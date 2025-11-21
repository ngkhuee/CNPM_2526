import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatCurrency, formatRating } from "@utils/formatters";
import { useRestaurantRating } from "shared-hooks";
import { orderService, restaurantService } from "shared-services";
import {
    MdArrowBack,
    MdStar,
    MdTrendingUp,
    MdLocalShipping,
    MdShoppingCart,
} from "react-icons/md";
import "./RestaurantDetail.css";

const RestaurantDetail = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [balance, setBalance] = useState(null);

    // Use hook to get dynamic rating
    const { rating, totalReviews } = useRestaurantRating(restaurantId);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    useEffect(() => {
        loadRestaurantDetail();
    }, [restaurantId]);

    const loadRestaurantDetail = async () => {
        setLoading(true);
        try {
            // Get restaurant info using service (includes auth token)
            const restaurantData = await restaurantService.getById(restaurantId);
            setRestaurant(restaurantData);

            if (!restaurantData) {
                setLoading(false);
                return;
            }

            // Get orders for this restaurant using orderService (includes auth token)
            const ordersData = await orderService.getByRestaurant(restaurantId);
            setOrders(ordersData || []);

            // Get balance info with auth token
            const token = localStorage.getItem("token");
            const balanceRes = await fetch(
                `${API_BASE_URL}/restaurant_balances?restaurant_id=${restaurantId}`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );
            let balanceData = await balanceRes.ok ? await balanceRes.json() : [];
            // Handle both array and object responses
            if (!Array.isArray(balanceData)) {
                balanceData = balanceData.value || [];
            }
            if (balanceData.length > 0) {
                setBalance(balanceData[0]);
            }

            // Calculate stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayOrders = ordersData.filter((o) => {
                const orderDate = new Date(o.created_at || o.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });

            const thisWeekOrders = ordersData.filter((o) => {
                const orderDate = new Date(o.created_at || o.createdAt);
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                return orderDate >= weekStart;
            });

            const completedOrders = ordersData.filter((o) => o.status === "delivered");

            const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || o.totalAmount || 0), 0);
            const todayRevenue = todayOrders
                .filter((o) => o.status === "delivered")
                .reduce((sum, o) => sum + (o.total_amount || o.totalAmount || 0), 0);
            const weekRevenue = thisWeekOrders
                .filter((o) => o.status === "delivered")
                .reduce((sum, o) => sum + (o.total_amount || o.totalAmount || 0), 0);

            setStats({
                totalOrders: ordersData.length,
                completedOrders: completedOrders.length,
                todayOrders: todayOrders.length,
                thisWeekOrders: thisWeekOrders.length,
                totalRevenue,
                todayRevenue,
                weekRevenue,
            });

            // Get top products
            const productMap = {};
            completedOrders.forEach((order) => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item) => {
                        const productName = item.name || `Product ${item.menu_id}`;
                        if (!productMap[productName]) {
                            productMap[productName] = { count: 0, revenue: 0 };
                        }
                        productMap[productName].count += item.quantity || 1;
                        // Use unit_price or price - json-server stores as unit_price
                        const price = item.unit_price || item.price || 0;
                        productMap[productName].revenue += price * (item.quantity || 1);
                    });
                }
            });

            const products = Object.entries(productMap)
                .map(([name, data]) => ({
                    name,
                    quantity: data.count,
                    revenue: data.revenue,
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            setTopProducts(products);
        } catch (error) {
            console.error("Error loading restaurant detail:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading">Loading restaurant details...</div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="main-content">
                <div className="error">Restaurant not found</div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="restaurant-detail">
                {/* Header */}
                <div className="detail-header">
                    <button className="back-btn" onClick={() => navigate("/admin/partners")}>
                        <MdArrowBack /> Back to Restaurants
                    </button>
                    <h2>{restaurant.name}</h2>
                </div>

                {/* Restaurant Info */}
                <div className="info-section">
                    <div className="info-card">
                        <h3>Restaurant Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Address:</span>
                                <span className="info-value">{restaurant.address}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Rating:</span>
                                <span className="info-value">
                                    <MdStar /> {formatRating(rating !== null ? rating : restaurant.rating)} ({totalReviews} reviews)
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Status:</span>
                                <span className={`status-badge status-${restaurant.status}`}>
                                    {restaurant.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{restaurant.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon orders">
                            <MdShoppingCart />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Orders</div>
                            <div className="stat-value">{stats?.totalOrders || 0}</div>
                            <div className="stat-detail">
                                Completed: {stats?.completedOrders || 0}
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon revenue">
                            <MdTrendingUp />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Revenue</div>
                            <div className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</div>
                            <div className="stat-detail">
                                Today: {formatCurrency(stats?.todayRevenue || 0)}
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon week">
                            <MdLocalShipping />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">This Week</div>
                            <div className="stat-value">{stats?.thisWeekOrders || 0} orders</div>
                            <div className="stat-detail">
                                {formatCurrency(stats?.weekRevenue || 0)}
                            </div>
                        </div>
                    </div>

                    {balance && (
                        <div className="stat-card">
                            <div className="stat-icon balance">
                                $
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Available Balance</div>
                                <div className="stat-value">
                                    {formatCurrency(balance.available_balance)}
                                </div>
                                <div className="stat-detail">
                                    Withdrawn: {formatCurrency(balance.total_withdrawn)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Products */}
                {topProducts.length > 0 && (
                    <div className="products-section">
                        <h3>Top 5 Products</h3>
                        <div className="products-table-wrapper">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity Sold</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((product, idx) => (
                                        <tr key={idx}>
                                            <td>{product.name}</td>
                                            <td className="text-center">{product.quantity}</td>
                                            <td className="text-right">
                                                {formatCurrency(product.revenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Orders */}
                {orders.length > 0 && (
                    <div className="orders-section">
                        <h3>Recent Orders ({orders.length})</h3>
                        <div className="orders-table-wrapper">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 10).map((order) => (
                                        <tr key={order.id}>
                                            <td>
                                                <code>{order.id}</code>
                                            </td>
                                            <td>{order.customer?.name || order.customerName || order.userName || order.user_id || "N/A"}</td>
                                            <td className="amount">
                                                {formatCurrency(order.total_amount || order.totalAmount || 0)}
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${order.status}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="date">
                                                {order.created_at || order.createdAt
                                                    ? new Date(order.created_at || order.createdAt).toLocaleDateString("vi-VN")
                                                    : "Invalid Date"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetail;
