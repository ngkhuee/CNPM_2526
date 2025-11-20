// hooks/useOrderTracking.js - Quản lý order tracking data & polling
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as orderService from '../services/orderService';

export const useOrderTracking = (orderId, onNavigate) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [intervalId, setIntervalId] = useState(null);

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

    // Auto-refresh effect
    useEffect(() => {
        if (!orderId) return;

        fetchOrder(true);

        if (autoRefreshEnabled) {
            const id = setInterval(() => fetchOrder(false), 5000);
            setIntervalId(id);
            return () => clearInterval(id);
        }
    }, [orderId, autoRefreshEnabled]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrder(false);
    };

    const setAutoRefresh = (enabled) => {
        setAutoRefreshEnabled(enabled);
    };

    return {
        order,
        loading,
        refreshing,
        handleRefresh,
        refetch: fetchOrder,
        setAutoRefresh,
    };
};
