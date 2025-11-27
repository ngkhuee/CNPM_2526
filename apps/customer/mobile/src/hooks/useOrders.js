// hooks/useOrders.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import orderService from '../services/orderService';

export const useOrders = (userId) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('current');

    useEffect(() => {
        if (userId) {
            fetchOrders();
        }
    }, [userId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Call real API
            const ordersData = await orderService.getOrders();
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Fallback to empty array instead of mock
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // In production: await orderService.cancelOrder(orderId);
                            setOrders(prev =>
                                prev.map(order =>
                                    order.id === orderId ? { ...order, status: 'cancelled' } : order
                                )
                            );
                            Alert.alert('Success', 'Order cancelled successfully');
                        } catch (error) {
                            console.error('Error cancelling order:', error);
                            Alert.alert('Error', 'Failed to cancel order');
                        }
                    },
                },
            ]
        );
    };

    const handleRetryOrder = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            Alert.alert('Retry Order', `Reorder "${order.restaurantName}"? This will add items to your cart`);
            // In production, would add to cart and navigate to checkout
        }
    };

    // Filter orders by tab - sort by updated_at DESC (newest first)
    // Current orders: all active orders (pending through arrived)
    const currentOrders = orders.filter(o =>
        ['pending', 'paid', 'confirmed', 'preparing', 'ready', 'delivering', 'arrived'].includes(o.status)
    ).sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

    // History orders: completed or cancelled
    const historyOrders = orders.filter(o =>
        ['delivered', 'cancelled', 'rejected'].includes(o.status)
    ).sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

    const displayOrders = activeTab === 'current' ? currentOrders : historyOrders;

    return {
        orders: displayOrders,
        allOrders: orders,
        loading,
        activeTab,
        setActiveTab,
        currentOrdersCount: currentOrders.length,
        historyOrdersCount: historyOrders.length,
        handleCancelOrder,
        handleRetryOrder,
        refetch: fetchOrders,
    };
};
