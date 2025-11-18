/**
 * useSettings.js - Mobile version of settings hook
 * Fetches system settings (delivery fee, etc)
 */

import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

export const useSettings = () => {
    const [deliveryFee, setDeliveryFee] = useState(2.00); // Default fallback in USD
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isActive = true;

        const fetchSettings = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch delivery fee from API
                const feeValue = await settingsService.getDeliveryFee();
                if (isActive) {
                    setDeliveryFee(feeValue);
                }
            } catch (err) {
                if (isActive) {
                    console.error('[useSettings] Error fetching settings:', err);
                    setError(err.message || 'Failed to fetch settings');
                    // Keep default delivery fee on error
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchSettings();

        return () => {
            isActive = false;
        };
    }, []);

    /**
     * Get specific setting by key
     * @param {string} key - Setting key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Setting value
     */
    const getSetting = (key, defaultValue = null) => {
        return settings[key] ?? defaultValue;
    };

    return {
        deliveryFee,
        settings,
        loading,
        error,
        getSetting,
    };
};
