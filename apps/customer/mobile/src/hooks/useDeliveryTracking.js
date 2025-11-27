// hooks/useDeliveryTracking.js - Unified hook for delivery tracking & arrival detection
// Consolidates useOrderStatus + useDeliveryCompletion logic
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as orderService from '../services/orderService';
import { showToast } from '../utils/toastHelper';

// Simplified timeline: Đã thanh toán → Đã xác nhận → Đang chuẩn bị → Đang giao → Hoàn thành
export const ORDER_TIMELINE = [
    { status: 'paid', label: 'Đã thanh toán', icon: 'check-circle' },
    { status: 'confirmed', label: 'Đã xác nhận', icon: 'check-circle' },
    { status: 'preparing', label: 'Đang chuẩn bị', icon: 'local-dining' },
    { status: 'delivering', label: 'Đang giao', icon: 'local-shipping' },
    { status: 'delivered', label: 'Hoàn thành', icon: 'flag' },
];

// Cancelled/Rejected timeline
export const CANCELLED_TIMELINE = [
    { status: 'paid', label: 'Đã thanh toán', icon: 'check-circle' },
    { status: 'cancelled', label: 'Đã hủy', icon: 'cancel' },
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
        // Map actual status to timeline stages
        const statusMap = {
            'pending': 0, // Maps to 'paid' stage
            'paid': 0,
            'confirmed': 1,
            'preparing': 2,
            'ready': 2, // Part of preparing stage
            'picking_up': 3, // All delivery statuses map to delivering
            'picked_up': 3,
            'delivering': 3,
            'arrived': 3,
            'delivered': 4,
            'cancelled': 1, // For cancelled timeline
            'rejected': 1, // For rejected timeline
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

    // Handle closing arrived popup - just close popup, don't auto-complete
    // Let customer confirm manually or wait for 10-minute auto-timer
    const handleCloseArrivedPopup = () => {
        setShowArrivedPopup(false);
        // Don't auto-complete - customer should confirm receipt or wait for auto-timer
        // This gives customer time to actually receive and check their order
    };

    // Show map when drone is assigned (confirmed onwards) - so customer can track drone from restaurant
    // Drone is assigned when status = confirmed, and starts flying to restaurant
    const showMap = order?.drone_id || order?.droneId ||
        ['confirmed', 'preparing', 'ready', 'delivering', 'arrived', 'delivered'].includes(order?.status);

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
        handleConfirmDelivery: performAutoDelivery, // Direct confirmation without Alert
    };
};
