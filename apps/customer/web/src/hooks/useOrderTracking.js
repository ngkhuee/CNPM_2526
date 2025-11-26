// hooks/useOrderTracking.js - Adaptive polling for order tracking
import { useState, useEffect } from 'react';
import { orderService } from 'shared-services';

export const useOrderTracking = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [intervalId, setIntervalId] = useState(null);

    const fetchOrder = async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const data = await orderService.getById(orderId);

            // If order has drone assigned, fetch drone location
            if (data.drone_id || data.droneId) {
                try {
                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
                    const token = localStorage.getItem("token");
                    const headers = {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` })
                    };

                    const droneId = data.drone_id || data.droneId;
                    const droneResponse = await fetch(`${API_BASE_URL}/drones/${droneId}`, { headers });

                    if (droneResponse.ok) {
                        const droneData = await droneResponse.json();
                        // Attach drone GPS to order - đồng bộ cả lat/lng và latitude/longitude
                        const droneLat = droneData.latitude || droneData.current_location?.lat || droneData.current_location?.latitude;
                        const droneLng = droneData.longitude || droneData.current_location?.lng || droneData.current_location?.longitude;

                        if (droneLat && droneLng) {
                            data.current_gps = {
                                lat: droneLat,
                                lng: droneLng,
                                latitude: droneLat,
                                longitude: droneLng
                            };
                            console.log('[useOrderTracking] Drone GPS updated:', data.current_gps);
                        }
                    }
                } catch (droneError) {
                    console.error('[useOrderTracking] Error fetching drone:', droneError);
                }
            }

            setOrder(data);
        } catch (error) {
            console.error('[useOrderTracking] Error:', error);
            if (showLoading) {
                alert('Không thể tải đơn hàng');
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
                return 500; // 500ms - very fast updates during delivery to track drone
            case 'confirmed':
            case 'preparing':
                return 3000; // 3 seconds - fast during preparation to see drone movement
            case 'pending':
                return 10000; // 10 seconds - medium during payment
            case 'ready':
                return 5000; // 5 seconds - medium when waiting for pickup
            case 'delivered':
            case 'cancelled':
                return null; // Stop polling
            default:
                return 10000;
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
