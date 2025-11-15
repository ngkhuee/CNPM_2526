/**
 * Geolocation Abstraction Layer
 * Supports both Web (navigator.geolocation) and Mobile (expo-location)
 * 
 * Usage:
 * Web: Automatically uses navigator.geolocation (no setup needed)
 * Mobile: Call initGeolocation(adapter) in app entry point
 */

let geoAdapter = null;

/**
 * Initialize geolocation adapter for mobile
 * @param {Object} adapter - Geolocation adapter with getCurrentPosition and requestPermission
 */
export const initGeolocation = (adapter) => {
    geoAdapter = adapter;
    console.log('[Geolocation] Adapter initialized:', adapter ? 'Custom (Mobile)' : 'Default (Web)');
};

/**
 * Standard position result format
 * @typedef {Object} GeolocationPosition
 * @property {Object} coords
 * @property {number} coords.latitude
 * @property {number} coords.longitude
 * @property {number} coords.accuracy
 * @property {number} timestamp
 */

/**
 * Geolocation API
 */
export const geolocation = {
    /**
     * Request permission to access location
     * @returns {Promise<{granted: boolean, status?: string}>}
     */
    async requestPermission() {
        // Mobile: Use custom adapter
        if (geoAdapter?.requestPermission) {
            try {
                const result = await geoAdapter.requestPermission();
                return result;
            } catch (error) {
                console.error('[Geolocation] Permission error:', error);
                return { granted: false, status: 'denied' };
            }
        }

        // Web: Check if permissions API is available
        if (typeof navigator !== 'undefined' && navigator.permissions) {
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                return {
                    granted: result.state === 'granted',
                    status: result.state,
                };
            } catch (error) {
                // Permissions API not supported, assume granted (will prompt on getCurrentPosition)
                return { granted: true, status: 'prompt' };
            }
        }

        // Fallback: Assume granted (will prompt on first access)
        return { granted: true, status: 'prompt' };
    },

    /**
     * Get current GPS position
     * @param {Object} options - Options for accuracy and timeout
     * @returns {Promise<GeolocationPosition>}
     */
    async getCurrentPosition(options = {}) {
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
            ...options,
        };

        // Mobile: Use custom adapter
        if (geoAdapter?.getCurrentPosition) {
            try {
                const position = await geoAdapter.getCurrentPosition(defaultOptions);
                return {
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy || 0,
                        altitude: position.coords.altitude || null,
                        altitudeAccuracy: position.coords.altitudeAccuracy || null,
                        heading: position.coords.heading || null,
                        speed: position.coords.speed || null,
                    },
                    timestamp: position.timestamp || Date.now(),
                };
            } catch (error) {
                console.error('[Geolocation] Mobile position error:', error);
                throw new Error(`Failed to get position: ${error.message}`);
            }
        }

        // Web: Use navigator.geolocation
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            coords: {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                                altitude: position.coords.altitude,
                                altitudeAccuracy: position.coords.altitudeAccuracy,
                                heading: position.coords.heading,
                                speed: position.coords.speed,
                            },
                            timestamp: position.timestamp,
                        });
                    },
                    (error) => {
                        console.error('[Geolocation] Web position error:', error);
                        let message = 'Failed to get position';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                message = 'Location permission denied';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                message = 'Location information unavailable';
                                break;
                            case error.TIMEOUT:
                                message = 'Location request timed out';
                                break;
                        }
                        reject(new Error(message));
                    },
                    defaultOptions
                );
            });
        }

        // No geolocation available
        throw new Error('Geolocation not available on this device');
    },

    /**
     * Watch position changes
     * @param {Function} callback - Called when position changes
     * @param {Function} errorCallback - Called on error
     * @param {Object} options - Options for accuracy and timeout
     * @returns {number|string} Watch ID to clear later
     */
    watchPosition(callback, errorCallback, options = {}) {
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
            ...options,
        };

        // Mobile: Use custom adapter if available
        if (geoAdapter?.watchPosition) {
            return geoAdapter.watchPosition(callback, errorCallback, defaultOptions);
        }

        // Web: Use navigator.geolocation
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            return navigator.geolocation.watchPosition(
                callback,
                errorCallback,
                defaultOptions
            );
        }

        console.warn('[Geolocation] watchPosition not available');
        return null;
    },

    /**
     * Clear position watch
     * @param {number|string} watchId - Watch ID from watchPosition
     */
    clearWatch(watchId) {
        if (!watchId) return;

        // Mobile: Use custom adapter if available
        if (geoAdapter?.clearWatch) {
            geoAdapter.clearWatch(watchId);
            return;
        }

        // Web: Use navigator.geolocation
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
        }
    },
};

export default geolocation;
