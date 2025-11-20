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
    // UI state for arrival detection (order stays in "delivering")
    const [uiArrivedState, setUiArrivedState] = useState(false);
    const [showArrivedPopup, setShowArrivedPopup] = useState(false);
    const [showConfirmButton, setShowConfirmButton] = useState(false);
    const [autoConfirmCountdown, setAutoConfirmCountdown] = useState(null);

    // Timers
    const autoDeliveryTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

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

    // Check if drone has arrived at dropoff location
    const isDroneAtDropoff = () => {
        if (!order?.status || order.status !== 'delivering') return false;
        if (!order?.current_gps || !order?.dropoff_gps) return false;

        const lat1 = order.current_gps.lat || order.current_gps.latitude;
        const lon1 = order.current_gps.lng || order.current_gps.longitude;
        const lat2 = order.dropoff_gps.lat || order.dropoff_gps.latitude;
        const lon2 = order.dropoff_gps.lng || order.dropoff_gps.longitude;

        if (!lat1 || !lon1 || !lat2 || !lon2) return false;

        const distance = calculateDistance(lat1, lon1, lat2, lon2);
        console.log('[useDeliveryTracking] Distance to dropoff:', distance.toFixed(3), 'km');

        // Within 100m = arrived
        return distance < 0.1;
    };

    // Get current status index for timeline
    const getStatusIndex = () => {
        if (uiArrivedState && order?.status === 'delivering') {
            return 5; // Arrived position
        }

        const statusMap = {
            pending: 0,
            confirmed: 1,
            preparing: 2,
            ready: 3,
            delivering: 4,
            delivered: 6,
        };

        return statusMap[order?.status] || 0;
    };

    // Auto-detect drone arrival
    useEffect(() => {
        if (order?.status === 'delivering' && !uiArrivedState) {
            if (isDroneAtDropoff()) {
                console.log('[useDeliveryTracking] DRONE ARRIVED at dropoff');
                setUiArrivedState(true);
                setShowArrivedPopup(true);
                startAutoDeliveryTimer();
            }
        }
    }, [order?.current_gps, order?.dropoff_gps, order?.status, uiArrivedState]);

    // Start 10-minute auto-confirm timer
    const startAutoDeliveryTimer = () => {
        if (autoDeliveryTimerRef.current) {
            clearTimeout(autoDeliveryTimerRef.current);
        }

        console.log('[useDeliveryTracking] Starting 10-min auto-confirm timer');

        // Countdown timer
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }

        let seconds = 600; // 10 minutes
        setAutoConfirmCountdown(seconds);

        countdownIntervalRef.current = setInterval(() => {
            seconds--;
            setAutoConfirmCountdown(seconds);

            if (seconds <= 0) {
                clearInterval(countdownIntervalRef.current);
            }
        }, 1000);

        // Auto-confirm timeout
        autoDeliveryTimerRef.current = setTimeout(async () => {
            console.log('[useDeliveryTracking] Auto-confirming delivery after 10 min');
            await handleAutoConfirm();
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
                        await performConfirmDelivery();
                    },
                },
            ]
        );
    };

    // Perform the actual delivery confirmation
    const performConfirmDelivery = async () => {
        try {
            // Clear timers
            if (autoDeliveryTimerRef.current) {
                clearTimeout(autoDeliveryTimerRef.current);
                autoDeliveryTimerRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }

            // Update order to delivered
            await orderService.updateOrderStatus(order.id, 'delivered');
            showToast('success', 'Delivery confirmed');

            // Reset UI state
            setUiArrivedState(false);
            setShowConfirmButton(false);
            setAutoConfirmCountdown(null);

            // Refetch to sync with backend
            onRefetch?.();
        } catch (error) {
            showToast('error', 'Failed to confirm delivery');
            console.error('[useDeliveryTracking] Confirm error:', error);
        }
    };

    // Auto-confirm after 10 minutes
    const handleAutoConfirm = async () => {
        try {
            // Clear timers
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }

            await orderService.updateOrderStatus(order.id, 'delivered');
            showToast('info', 'Order automatically marked as delivered');

            setUiArrivedState(false);
            setShowConfirmButton(false);
            setAutoConfirmCountdown(null);

            onRefetch?.();
        } catch (error) {
            console.error('[useDeliveryTracking] Auto-confirm error:', error);
        }
    };

    // Handle closing arrived popup
    const handleCloseArrivedPopup = () => {
        setShowArrivedPopup(false);
        setShowConfirmButton(true); // Show confirm button after popup dismissed
    };

    // Show map when delivering or delivered
    const showMap = order?.status === 'delivering' || order?.status === 'delivered';

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoDeliveryTimerRef.current) {
                clearTimeout(autoDeliveryTimerRef.current);
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, []);

    // Reset UI state when order reaches delivered
    useEffect(() => {
        if (order?.status === 'delivered') {
            setUiArrivedState(false);
            setShowArrivedPopup(false);
            setShowConfirmButton(false);
            setAutoConfirmCountdown(null);

            if (autoDeliveryTimerRef.current) {
                clearTimeout(autoDeliveryTimerRef.current);
                autoDeliveryTimerRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
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

        // Confirm button
        showConfirmButton,
        autoConfirmCountdown,
        handleConfirmDelivery,
        handleAutoConfirm: handleAutoConfirm,

        // Drone arrival state (UI-only)
        droneArrived: uiArrivedState,
    };
};
