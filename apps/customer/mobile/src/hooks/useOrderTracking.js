// hooks/useOrderTracking.js - Quản lý order tracking data & polling
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { orderService } from '../services/orderService';

export const useOrderTracking = (orderId, onNavigate) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrder = async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            setOrder(data);
        } catch (error) {
            console.error('[useOrderTracking] Error fetching order:', error);
            if (showLoading) {
                Alert.alert('Error', 'Failed to load order');
                onNavigate?.('orders');
            }
        } finally {
            if (showLoading) setLoading(false);
            setRefreshing(false);
        }
    };

    // Auto-refresh every 5 seconds
    useEffect(() => {
        if (!orderId) return;

        fetchOrder(true);
        const interval = setInterval(() => fetchOrder(false), 5000);
        
        return () => clearInterval(interval);
    }, [orderId]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrder(false);
    };

    return {
        order,
        loading,
        refreshing,
        handleRefresh,
        refetch: fetchOrder,
    };
};
