// hooks/useDeliveryCompletion.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as orderService from '../services/orderService';

export const useDeliveryCompletion = (order, onRefresh) => {
    const [showConfirmButton, setShowConfirmButton] = useState(false);
    const [autoConfirmCountdown, setAutoConfirmCountdown] = useState(null);
    const [autoConfirmTimeoutId, setAutoConfirmTimeoutId] = useState(null);
    const [notificationShown, setNotificationShown] = useState(false);

    // Check if drone has arrived at delivery location
    const isDroneAtLocation = () => {
        if (!order?.current_gps || !order?.dropoff_gps || order?.status !== 'delivering') {
            return false;
        }

        // Calculate distance between current position and destination (in km)
        const lat1 = order.current_gps.latitude;
        const lon1 = order.current_gps.longitude;
        const lat2 = order.dropoff_gps.latitude;
        const lon2 = order.dropoff_gps.longitude;

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
        const distance = R * c;

        // If within 100 meters (0.1 km), consider arrived
        return distance < 0.1;
    };

    // Handle showing notification and confirm button
    useEffect(() => {
        if (isDroneAtLocation()) {
            // Show notification once
            if (!notificationShown) {
                Alert.alert(
                    '📍 Your order has arrived!',
                    'The delivery has reached your location. Please dismiss this notification to proceed.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setNotificationShown(true);
                                setShowConfirmButton(true);
                                startAutoConfirmTimer();
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        } else {
            setShowConfirmButton(false);
            setAutoConfirmCountdown(null);
            setNotificationShown(false);
            if (autoConfirmTimeoutId) {
                clearTimeout(autoConfirmTimeoutId);
                setAutoConfirmTimeoutId(null);
            }
        }
    }, [order?.current_gps, order?.dropoff_gps, order?.status]);

    const startAutoConfirmTimer = () => {
        // Auto-confirm after 10 minutes (600 seconds)
        const countdownInterval = setInterval(() => {
            setAutoConfirmCountdown((prev) => {
                const remaining = prev === null ? 600 : prev - 1;
                if (remaining <= 0) {
                    clearInterval(countdownInterval);
                    handleAutoConfirm();
                    return null;
                }
                return remaining;
            });
        }, 1000);

        const timeoutId = setTimeout(() => {
            handleAutoConfirm();
        }, 600000); // 10 minutes

        setAutoConfirmTimeoutId(timeoutId);
        setAutoConfirmCountdown(600);
    };

    const handleAutoConfirm = async () => {
        try {
            await orderService.updateOrderStatus(order.id, 'delivered');
            Alert.alert('✓ Success', 'Order confirmed as delivered automatically');
            onRefresh?.();
        } catch (error) {
            console.error('Auto-confirm failed:', error);
        }
    };

    const handleManualConfirm = () => {
        Alert.alert(
            'Confirm Delivery',
            'Please confirm that you have received the order',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await orderService.updateOrderStatus(order.id, 'delivered');
                            Alert.alert('✓ Success', 'Delivery confirmed');
                            onRefresh?.();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to confirm delivery');
                        }
                    },
                },
            ]
        );
    };

    return {
        showConfirmButton,
        autoConfirmCountdown,
        handleManualConfirm,
    };
};
