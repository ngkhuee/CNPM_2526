// hooks/useDeliveryTracking.js - Unified hook for delivery tracking & arrival detection
// Consolidates useOrderStatus + useDeliveryCompletion logic
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as orderService from '../services/orderService';
import { showToast } from '../utils/toastHelper';

export const ORDER_TIMELINE = [
    { status: 'pending', label: 'Order Placed', icon: 'shopping-cart' },
    { status: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { status: 'preparing', label: 'Preparing', icon: 'local-dining' },
    { status: 'ready', label: 'Ready for Pickup', icon: 'done' },
    { status: 'delivering', label: 'Delivering', icon: 'local-shipping' },
    { status: 'arrived', label: 'Arrived', icon: 'location-on' },
    { status: 'delivered', label: 'Delivered', icon: 'flag' },
];

export const useDeliveryTracking = (order, onRefetch) => {
    // UI state for arrival popup
    const [showArrivedPopup, setShowArrivedPopup] = useState(false);

    // Timers
    const autoDeliveryTimerRef = useRef(null);

    // Calculate distance between two GPS points (in km)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
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

    // Get current status index for timeline
    const getStatusIndex = () => {
        const statusMap = {
            pending: 0,
            confirmed: 1,
            preparing: 2,
            ready: 3,
            delivering: 4,
            arrived: 5,
            delivered: 6,
        };

        return statusMap[order?.status] || 0;
    };

    // Auto-detect drone arrival - trigger popup when order becomes "arrived"
    useEffect(() => {
        if (order?.status === 'arrived' && !showArrivedPopup) {
            console.log('[useDeliveryTracking] Order status changed to ARRIVED, showing popup');
            setShowArrivedPopup(true);
            startAutoDeliveryTimer();
        }
    }, [order?.status]);

    // Start 10-minute auto-confirm timer (auto-deliver after popup shown)
    const startAutoDeliveryTimer = () => {
        if (autoDeliveryTimerRef.current) {
            clearTimeout(autoDeliveryTimerRef.current);
        }

        console.log('[useDeliveryTracking] Starting auto-delivery timer (10 min)');

        // Auto-deliver timeout
        autoDeliveryTimerRef.current = setTimeout(async () => {
            console.log('[useDeliveryTracking] Auto-delivering after 10 min');
            await performAutoDelivery();
        }, 10 * 60 * 1000);
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
                        await performAutoDelivery();
                    },
                },
            ]
        );
    };

    // Perform the actual delivery confirmation (auto-delivery)
    const performAutoDelivery = async () => {
        try {
            // Clear timers
            if (autoDeliveryTimerRef.current) {
                clearTimeout(autoDeliveryTimerRef.current);
                autoDeliveryTimerRef.current = null;
            }

            // Update order to delivered
            await orderService.updateOrderStatus(order.id, 'delivered');
            showToast('success', 'Delivery marked as received');

            // Reset UI state
            setShowArrivedPopup(false);

            // Refetch to sync with backend
            onRefetch?.();
        } catch (error) {
            showToast('error', 'Failed to mark delivery as received');
            console.error('[useDeliveryTracking] Auto-deliver error:', error);
        }
    };

    // Handle closing arrived popup - immediately move to delivered status
    const handleCloseArrivedPopup = () => {
        setShowArrivedPopup(false);
        // Immediately perform auto-delivery when popup is closed
        performAutoDelivery();
    };

    // Show map when delivering, arrived or delivered
    const showMap = order?.status === 'delivering' || order?.status === 'arrived' || order?.status === 'delivered';

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoDeliveryTimerRef.current) {
                clearTimeout(autoDeliveryTimerRef.current);
            }
        };
    }, []);

    // Reset UI state when order reaches delivered
    useEffect(() => {
        if (order?.status === 'delivered') {
            setShowArrivedPopup(false);

            if (autoDeliveryTimerRef.current) {
                clearTimeout(autoDeliveryTimerRef.current);
                autoDeliveryTimerRef.current = null;
            }
        }
    }, [order?.status]);

    return {
        // Timeline
        currentStatusIndex: getStatusIndex(),
        isDelivered: order?.status === 'delivered',

        // Map
        showMap,

        // Arrival popup
        showArrivedPopup,
        handleCloseArrivedPopup,
    };
};
