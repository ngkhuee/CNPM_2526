// hooks/useOrderStatus.js - Quản lý order status & timeline với UI-only arrived state
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as orderService from '../services/orderService';
import { showToast } from '../utils/toastHelper';

export const ORDER_TIMELINE = [
    { status: 'pending', label: 'Order Placed', icon: 'shopping-cart' },
    { status: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { status: 'preparing', label: 'Preparing', icon: 'local-dining' },
    { status: 'delivering', label: 'Delivering', icon: 'local-shipping' },
    { status: 'arrived', label: 'Arrived', icon: 'location-on' },
    { status: 'delivered', label: 'Delivered', icon: 'flag' },
];

export const useOrderStatus = (order, onRefetch) => {
    const [uiArrivedState, setUiArrivedState] = useState(false); // UI-only arrived flag
    const [showArrivedPopup, setShowArrivedPopup] = useState(false);
    const autoDeliveryTimerRef = useRef(null);

    const getStatusIndex = () => {
        // If UI arrived state is active, show index 4 (arrived)
        if (uiArrivedState && order?.status === 'delivering') {
            return 4; // Arrived position in timeline
        }

        const statusMap = {
            pending: 0,
            confirmed: 1,
            preparing: 2,
            ready: 2, // ready maps to preparing stage
            delivering: 3,
            delivered: 5, // Skip arrived, go directly to delivered
        };

        const index = statusMap[order?.status] || 0;
        console.log('[useOrderStatus] Order status:', order?.status, '-> index:', index, 'uiArrived:', uiArrivedState);
        return index;
    };

    const statusIndex = getStatusIndex();

    // Show map when status is delivering, arrived (UI-only), or delivered
    const showMap = order?.status === 'delivering' || order?.status === 'delivered' || (uiArrivedState && order?.status === 'delivering');

    // Calculate distance helper
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Auto-check for arrival based on GPS distance
    useEffect(() => {
        if (order?.status === 'delivering' && order?.current_gps && order?.dropoff_gps) {
            const lat1 = order.current_gps.lat || order.current_gps.latitude;
            const lon1 = order.current_gps.lng || order.current_gps.longitude;
            const lat2 = order.dropoff_gps.lat || order.dropoff_gps.latitude;
            const lon2 = order.dropoff_gps.lng || order.dropoff_gps.longitude;

            console.log('[useOrderStatus] GPS check:', {
                lat1, lon1, lat2, lon2,
                currentGPS: order.current_gps,
                dropoffGPS: order.dropoff_gps,
                uiArrived: uiArrivedState,
            });

            if (lat1 && lon1 && lat2 && lon2) {
                const distance = calculateDistance(lat1, lon1, lat2, lon2);

                console.log('[useOrderStatus] Distance to delivery:', distance.toFixed(3), 'km');

                // Auto-trigger arrival when within 100m
                if (distance < 0.1 && !uiArrivedState) {
                    console.log('[useOrderStatus] AUTO-TRIGGER ARRIVAL - Distance < 0.1km');
                    setUiArrivedState(true);
                    setShowArrivedPopup(true);
                    startAutoDeliveryTimer();
                }
            }
        }
    }, [order?.status, order?.current_gps, order?.dropoff_gps]);

    // Start timer for auto-delivery after 10 minutes
    const startAutoDeliveryTimer = () => {
        // Clear existing timer
        if (autoDeliveryTimerRef.current) {
            clearTimeout(autoDeliveryTimerRef.current);
        }

        console.log('[useOrderStatus] Starting 10-minute auto-delivery timer');

        // Set 10-minute timer
        autoDeliveryTimerRef.current = setTimeout(async () => {
            console.log('[useOrderStatus] Auto-delivering after 10 minutes');
            try {
                await orderService.updateOrderStatus(order.id, 'delivered');
                showToast('info', 'Order automatically marked as delivered');
                setUiArrivedState(false); // Reset UI state
                onRefetch?.();
            } catch (error) {
                console.error('[useOrderStatus] Auto-delivery failed:', error);
                showToast('error', 'Failed to auto-confirm delivery');
            }
        }, 10 * 60 * 1000); // 10 minutes
    };

    // Handle customer confirming delivery
    const handleConfirmDelivery = () => {
        Alert.alert(
            'Confirm Delivery',
            'Please confirm that you have received the order',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            // Clear auto-delivery timer
                            if (autoDeliveryTimerRef.current) {
                                clearTimeout(autoDeliveryTimerRef.current);
                                autoDeliveryTimerRef.current = null;
                            }

                            await orderService.updateOrderStatus(order.id, 'delivered');
                            showToast('success', 'Delivery confirmed');
                            setUiArrivedState(false); // Reset UI state
                            onRefetch?.();
                        } catch (error) {
                            showToast('error', 'Failed to confirm delivery');
                            console.error('[useOrderStatus] Confirm delivery error:', error);
                        }
                    },
                },
            ]
        );
    };

    // Handle closing arrived popup
    const handleCloseArrivedPopup = () => {
        setShowArrivedPopup(false);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autoDeliveryTimerRef.current) {
                clearTimeout(autoDeliveryTimerRef.current);
            }
        };
    }, []);

    // Reset UI arrived state when order status changes to delivered
    useEffect(() => {
        if (order?.status === 'delivered') {
            setUiArrivedState(false);
            setShowArrivedPopup(false);
            if (autoDeliveryTimerRef.current) {
                clearTimeout(autoDeliveryTimerRef.current);
                autoDeliveryTimerRef.current = null;
            }
        }
    }, [order?.status]);

    return {
        currentStatusIndex: statusIndex,
        isDelivered: order?.status === 'delivered',
        showMap,
        showArrivedPopup,
        droneArrived: uiArrivedState, // UI-only arrived state
        handleConfirmDelivery,
        handleCloseArrivedPopup,
    };
};
