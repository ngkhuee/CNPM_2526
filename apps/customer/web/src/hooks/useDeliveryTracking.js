// hooks/useDeliveryTracking.js - Unified hook for delivery tracking & arrival detection
import { useState, useEffect, useRef } from 'react';
import { orderService } from 'shared-services';

export const ORDER_TIMELINE = [
    { status: 'pending', label: 'Đã đặt hàng', icon: 'shopping-cart' },
    { status: 'confirmed', label: 'Đã xác nhận', icon: 'check-circle' },
    { status: 'preparing', label: 'Đang chuẩn bị', icon: 'local-dining' },
    { status: 'ready', label: 'Sẵn sàng lấy hàng', icon: 'done' },
    { status: 'delivering', label: 'Đang giao', icon: 'local-shipping' },
    { status: 'arrived', label: 'Đã đến nơi', icon: 'location-on' },
    { status: 'delivered', label: 'Đã giao', icon: 'flag' },
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

    // Handle customer confirming delivery - directly confirm without popup
    const handleConfirmDelivery = async () => {
        await performAutoDelivery();
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
            await orderService.updateStatus(order.id, 'delivered');

            // Reset UI state
            setShowArrivedPopup(false);

            // Refetch to sync with backend
            onRefetch?.();
        } catch (error) {
            alert('Không thể đánh dấu giao hàng');
            console.error('[useDeliveryTracking] Auto-deliver error:', error);
        }
    };

    // Handle closing arrived popup - NOT used anymore since we removed close button
    const handleCloseArrivedPopup = () => {
        // Do nothing - customer must confirm
    };

    // Show map when drone is assigned (has drone_id or droneId)
    const hasDrone = !!(order?.drone_id || order?.droneId);
    const showMap = hasDrone && ['confirmed', 'preparing', 'ready', 'picking_up', 'picked_up', 'delivering', 'arrived', 'delivered'].includes(order?.status);

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
        handleConfirmDelivery,
    };
};
