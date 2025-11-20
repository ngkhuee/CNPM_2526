// hooks/useOrderTracking.js - Quản lý order tracking data & adaptive polling
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

    // Get adaptive polling interval based on order status
    const getPollingInterval = (status) => {
        switch (status) {
            case 'delivering':
                return 5000; // 5 seconds - fast updates during delivery
            case 'pending':
            case 'confirmed':
            case 'preparing':
                return 15000; // 15 seconds - medium during preparation
            case 'ready':
                return 30000; // 30 seconds - slower when waiting for pickup
            case 'delivered':
            case 'cancelled':
                return null; // Stop polling
            default:
                return 15000;
        }
    };

    // Auto-refresh effect with adaptive polling
    useEffect(() => {
        if (!orderId) return;

        fetchOrder(true);

        if (autoRefreshEnabled && order?.status) {
            const interval = getPollingInterval(order.status);

            if (interval) {
                console.log(`[useOrderTracking] Starting ${order.status} polling every ${interval}ms`);
                const id = setInterval(() => fetchOrder(false), interval);
                setIntervalId(id);
                return () => clearInterval(id);
            } else {
                console.log(`[useOrderTracking] Stopping polling for status: ${order.status}`);
                if (intervalId) {
                    clearInterval(intervalId);
                    setIntervalId(null);
                }
            }
        } else if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    }, [orderId, autoRefreshEnabled, order?.status]);

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
