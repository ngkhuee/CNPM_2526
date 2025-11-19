/**
 * useOrderAutoCancel.js
 * Custom hook to handle automatic order cancellation after 30 minutes without payment
 * 
 * Usage:
 * const { startAutoCancel, stopAutoCancel, timeRemaining } = useOrderAutoCancel();
 * 
 * // Start the timer when order is created
 * useEffect(() => {
 *     if (order.payment_status === 'pending') {
 *         startAutoCancel(order.id, 30 * 60 * 1000); // 30 minutes
 *     }
 * }, [order.id]);
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as orderService from '../services/orderService';

const AUTO_CANCEL_TIMERS = {}; // Store timers globally to persist across re-renders

export const useOrderAutoCancel = () => {
    const [timeRemaining, setTimeRemaining] = useState({});
    const intervalsRef = useRef({});

    /**
     * Start auto-cancel timer for an order
     * 
     * @param {string} orderId - Order ID
     * @param {number} duration - Duration in milliseconds (default: 30 minutes)
     */
    const startAutoCancel = useCallback((orderId, duration = 30 * 60 * 1000) => {
        console.log('[useOrderAutoCancel] Starting timer for order:', { orderId, duration });

        if (AUTO_CANCEL_TIMERS[orderId]) {
            console.log('[useOrderAutoCancel] Timer already running for:', orderId);
            return;
        }

        const startTime = Date.now();
        const endTime = startTime + duration;

        AUTO_CANCEL_TIMERS[orderId] = {
            startTime,
            endTime,
            duration,
        };

        // Update remaining time every second
        const intervalId = setInterval(async () => {
            const now = Date.now();
            const remaining = endTime - now;

            setTimeRemaining((prev) => ({
                ...prev,
                [orderId]: Math.max(0, remaining),
            }));

            // If time's up, cancel the order
            if (remaining <= 0) {
                clearInterval(intervalId);
                delete AUTO_CANCEL_TIMERS[orderId];
                delete intervalsRef.current[orderId];

                console.log('[useOrderAutoCancel] Time expired, cancelling order:', orderId);

                try {
                    await orderService.updateOrder(orderId, {
                        status: 'cancelled',
                        payment_status: 'failed',
                    });
                    console.log('[useOrderAutoCancel] Order cancelled successfully:', orderId);
                } catch (error) {
                    console.error('[useOrderAutoCancel] Failed to cancel order:', error);
                }
            }
        }, 1000);

        intervalsRef.current[orderId] = intervalId;
    }, []);

    /**
     * Stop auto-cancel timer for an order (called when payment is completed)
     * 
     * @param {string} orderId - Order ID
     */
    const stopAutoCancel = useCallback((orderId) => {
        console.log('[useOrderAutoCancel] Stopping timer for order:', orderId);

        if (intervalsRef.current[orderId]) {
            clearInterval(intervalsRef.current[orderId]);
            delete intervalsRef.current[orderId];
        }

        if (AUTO_CANCEL_TIMERS[orderId]) {
            delete AUTO_CANCEL_TIMERS[orderId];
        }

        setTimeRemaining((prev) => {
            const updated = { ...prev };
            delete updated[orderId];
            return updated;
        });
    }, []);

    /**
     * Get formatted time remaining for an order
     * 
     * @param {string} orderId - Order ID
     * @returns {string} Formatted time (e.g., "5:30")
     */
    const getFormattedTime = useCallback((orderId) => {
        const ms = timeRemaining[orderId] || 0;
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }, [timeRemaining]);

    /**
     * Check if order has auto-cancel active
     * 
     * @param {string} orderId - Order ID
     * @returns {boolean}
     */
    const isActive = useCallback((orderId) => {
        return !!AUTO_CANCEL_TIMERS[orderId];
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(intervalsRef.current).forEach((intervalId) => {
                clearInterval(intervalId);
            });
        };
    }, []);

    return {
        startAutoCancel,
        stopAutoCancel,
        getFormattedTime,
        isActive,
        timeRemaining,
    };
};

export default useOrderAutoCancel;
